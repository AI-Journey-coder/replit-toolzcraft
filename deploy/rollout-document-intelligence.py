"""Run in authenticated Google Cloud Shell. Default is a read-only plan.
No secret values are printed or passed in command-line arguments.
"""
import time
import argparse,base64,copy,datetime,json,os,pathlib,re,subprocess,tempfile,urllib.parse,urllib.request
PROJECT='toolzcraft-062026';REGION='asia-southeast1'
def run(args,**kwargs):
    result=subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.PIPE,**kwargs)
    if result.returncode:raise RuntimeError('Command failed: '+' '.join(args[:4])+'. Inspect its status in Google Cloud Console; no secret output was printed.')
    return result.stdout.decode().strip()
def gc(*args):return run(['gcloud',*args,'--project='+PROJECT,'--quiet'])
def describe(service):return json.loads(gc('run','services','describe',service,'--region='+REGION,'--format=json'))
def secret_value(ref):return gc('secrets','versions','access',ref['key'],'--secret='+ref['name'])
def write_json(folder,name,value):
    target=folder/name;target.write_text(json.dumps(value));target.chmod(0o600);return str(target)
def build(config,release):
    print('Building '+config,flush=True)
    build_id=gc('builds','submit','--async','--region=global','--config=deploy/'+config,'--substitutions=_RELEASE='+release,'--format=value(id)','.')
    if not re.fullmatch(r'[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}',build_id):
        raise RuntimeError('Submission did not return a build ID. Check Cloud Build history before retrying.')
    print('Cloud Build: https://console.cloud.google.com/cloud-build/builds/'+build_id+'?project='+PROJECT,flush=True)
    previous=None
    while True:
        try:
            result=json.loads(gc('builds','describe',build_id,'--region=global','--format=json'))
        except json.JSONDecodeError:
            raise RuntimeError('Cannot read status for build '+build_id+'. Open its build link for details.') from None
        status=result.get('status')
        if status!=previous:
            print(config+': '+str(status),flush=True)
            previous=status
        if status=='SUCCESS':break
        if status not in ('PENDING','QUEUED','WORKING'):
            raise RuntimeError('Cloud Build '+build_id+' ended with status '+str(status)+'. See its build logs.')
        time.sleep(10)
    images=result.get('results',{}).get('images',[])
    if len(images)!=1 or not re.fullmatch(r'sha256:[0-9a-f]{64}',images[0].get('digest','')):raise RuntimeError('Build did not return one immutable image digest.')
    return images[0]['name'].rsplit(':',1)[0]+'@'+images[0]['digest']
def env_map(service):return {e['name']:e for e in service['spec']['template']['spec']['containers'][0].get('env',[])}
def set_env(env,name,value):env[name]={'name':name,'value':value}
def minimal_service(original,name,image,env,identity):
    annotations={k:v for k,v in original.get('metadata',{}).get('annotations',{}).items() if k in ('run.googleapis.com/ingress','run.googleapis.com/invoker-iam-disabled')}
    return {'apiVersion':'serving.knative.dev/v1','kind':'Service','metadata':{'name':name,'namespace':str(original['metadata']['namespace']),'annotations':annotations},'spec':{'template':{'metadata':{'annotations':{'autoscaling.knative.dev/minScale':'0','autoscaling.knative.dev/maxScale':'1'}},'spec':{'serviceAccountName':identity,'containerConcurrency':20,'timeoutSeconds':120,'containers':[{'name':'api','image':image,'ports':[{'containerPort':8080}],'env':list(env.values()),'resources':{'limits':{'cpu':'1','memory':'512Mi'}}}]}},'traffic':[{'latestRevision':True,'percent':100}]}}
def backup(ref,folder,label):
    print('Creating database backup before migrations…',flush=True)
    parsed=urllib.parse.urlsplit(secret_value(ref))
    if parsed.scheme not in ('postgres','postgresql') or not parsed.hostname:raise RuntimeError('Database URL is not PostgreSQL.')
    environment=dict(os.environ,PGHOST=parsed.hostname,PGPORT=str(parsed.port or 5432),PGDATABASE=urllib.parse.unquote(parsed.path.lstrip('/')),PGUSER=urllib.parse.unquote(parsed.username or ''),PGPASSWORD=urllib.parse.unquote(parsed.password or ''),PGSSLMODE='require')
    target=folder/(label+'.dump')
    with target.open('xb') as output:
        target.chmod(0o600)
        result=subprocess.run(['docker','run','--rm',*[item for key in ('PGHOST','PGPORT','PGDATABASE','PGUSER','PGPASSWORD','PGSSLMODE') for item in ('-e',key)],'postgres:18','pg_dump','--format=custom','--no-owner','--no-acl'],env=environment,stdout=output,stderr=subprocess.PIPE)
    if result.returncode or target.stat().st_size<100:raise RuntimeError('Database backup failed; migrations were not started.')
    print('Backup saved privately: '+str(target),flush=True)
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--environment',choices=['staging','production'],default='staging');parser.add_argument('--apply',action='store_true');parser.add_argument('--accept-staging',action='store_true',help='Confirm signed-in staging acceptance for this exact commit before production');parser.add_argument('--resume-staging-jobs',metavar='RECOVERY_JSON');args=parser.parse_args()
    environment=args.environment;api_name='toolzcraft-'+environment+'-api';web_name='toolzcraft-staging' if environment=='staging' else 'toolzcraft';binary_name='toolzcraft-'+environment+'-documents'
    release=run(['git','rev-parse','HEAD']);dirty=run(['git','status','--porcelain'])
    if dirty:raise RuntimeError('Use a clean checkout of the tested release commit.')
    api,web=describe(api_name),describe(web_name);env=env_map(api)
    dbref=env.get('DATABASE_URL',{}).get('valueFrom',{}).get('secretKeyRef')
    if not dbref:raise RuntimeError('DATABASE_URL must use Secret Manager before rollout.')
    identity=api['spec']['template']['spec']['serviceAccountName'];web_identity=web['spec']['template']['spec']['serviceAccountName']
    resume=args.resume_staging_jobs
    if resume and (environment!='staging' or not args.apply):
        raise RuntimeError('Resume requires staging and --apply.')
    print(json.dumps({'environment':environment,'commit':release,'api':api_name,'website':web_name,'optionalBinaryService':binary_name,'databaseSecret':dbref['name'],'actions':['backup database','build three images','apply additive migrations','configure private scanner service','deploy API and website','execute worker and cleanup','schedule jobs'],'costControls':'minimum zero / maximum one service instance; scanner runs separately with 2 GiB plus 1 GiB API only when used. Cloud Build, jobs, storage and Scheduler can incur charges.'},indent=2))
    if not args.apply:return
    state=pathlib.Path.home()/'.toolzcraft-rollouts';state.mkdir(mode=0o700,exist_ok=True)
    if environment=='production' and not (state/('staging-'+release+'.json')).exists():raise RuntimeError('Run this exact commit through staging first.')
    if environment=='production' and not args.accept_staging:raise RuntimeError('Complete signed-in staging acceptance, then explicitly pass --accept-staging.')
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    if resume:
        recovery_path=pathlib.Path(resume).expanduser().resolve()
        if recovery_path.parent!=state.resolve() or not re.fullmatch(r'staging-[0-9TZ]+-recovery\.json',recovery_path.name):
            raise RuntimeError('Expected a staging recovery record in ~/.toolzcraft-rollouts.')
        recovery=json.loads(recovery_path.read_text())
        if recovery['api']!=api_name or recovery['website']!=web_name or not re.fullmatch('[0-9a-f]{40}',recovery['commit']):
            raise RuntimeError('Recovery record does not match staging.')
        changed=run(['git','diff','--name-only',recovery['commit'],release]).splitlines()
        if set(changed)-{'deploy/rollout-document-intelligence.py','scripts/check-document-rollout.py'}:
            raise RuntimeError('Application source changed since the recovered release.')
        def deployed_image(service,container,artifact):
            live=service['status']
            revision=live['latestReadyRevisionName']
            if not any(t.get('revisionName')==revision and t.get('percent')==100 for t in live['traffic']):
                raise RuntimeError('Expected all traffic on the ready revision.')
            actual=next(c['image'] for c in service['spec']['template']['spec']['containers'] if c['name']==container)
            repo=REGION+'-docker.pkg.dev/'+PROJECT+'/toolzcraft-staging/'+artifact
            digest=gc('artifacts','docker','images','describe',repo+':'+recovery['commit'],'--format=value(image_summary.digest)')
            if not re.fullmatch('sha256:[0-9a-f]{64}',digest) or actual!=repo+'@'+digest:
                raise RuntimeError('Deployed '+container+' image does not match the recovered build.')
            return actual
        api_image=deployed_image(api,'api','api')
        web_image=deployed_image(web,'web','web')
        scanner_image=deployed_image(describe(binary_name),'scanner','scanner')
        print('Verified deployed images. Resuming staging checks and jobs.',flush=True)
    else:
        recovery={'commit':release,'api':api_name,'website':web_name,'previousApiRevision':api['status'].get('latestReadyRevisionName'),'previousWebRevision':web['status'].get('latestReadyRevisionName'),'databaseBackup':str(state/(environment+'-'+stamp+'.dump'))}
        recovery_path=write_json(state,environment+'-'+stamp+'-recovery.json',recovery)
        print('Recovery record saved before changes: '+recovery_path,flush=True)
        backup(dbref,state,environment+'-'+stamp)
        if environment=='production':
            accepted=json.loads((state/('staging-'+release+'.json')).read_text())
            api_image,scanner_image=accepted['apiImage'],accepted['scannerImage']
            if not all(re.search(r'@sha256:[0-9a-f]{64}$',x) for x in (api_image,scanner_image)):raise RuntimeError('Staging image record is invalid.')
        else:
            api_image=build('cloudbuild.staging-api.yaml',release);scanner_image=build('cloudbuild.scanner.yaml',release)
        web_image=build('cloudbuild.'+('staging' if environment=='staging' else 'production')+'-web.yaml',release)
        keyref=env.get('DOCUMENT_WORKSPACE_KEY',{}).get('valueFrom',{}).get('secretKeyRef')
        if not keyref:
            name='toolzcraft-document-workspace-key'
            existing=subprocess.run(['gcloud','secrets','describe',name,'--project='+PROJECT,'--format=json'],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
            if existing.returncode:
                if b'NOT_FOUND' not in existing.stderr:raise RuntimeError('Cannot inspect encryption secret permissions.')
                run(['gcloud','secrets','create',name,'--project='+PROJECT,'--replication-policy=automatic','--data-file=-','--quiet'],input=base64.b64encode(os.urandom(32)))
            version=gc('secrets','versions','describe','latest','--secret='+name,'--format=value(name)').split('/')[-1]
            keyref={'name':name,'key':version}
        gc('secrets','add-iam-policy-binding',keyref['name'],'--member=serviceAccount:'+identity,'--role=roles/secretmanager.secretAccessor')
        env['DOCUMENT_WORKSPACE_KEY']={'name':'DOCUMENT_WORKSPACE_KEY','valueFrom':{'secretKeyRef':keyref}}
        set_env(env,'ENABLE_DOCUMENT_JOBS','true');set_env(env,'ENABLE_DOCUMENT_SCAN','false');set_env(env,'ENABLE_DOCUMENT_EXTRACTION','false')
    with tempfile.TemporaryDirectory(prefix='toolzcraft-rollout-') as temp:
        folder=pathlib.Path(temp)
        values={k:v['value'] for k,v in env.items() if 'value' in v}
        secrets=','.join(k+'='+v['valueFrom']['secretKeyRef']['name']+':'+v['valueFrom']['secretKeyRef']['key'] for k,v in env.items() if 'valueFrom' in v)
        def job(name,entry):
            job_values=values if entry=='document-worker' else {'NODE_ENV':'production'}
            job_secrets=secrets if entry=='document-worker' else 'DATABASE_URL='+dbref['name']+':'+dbref['key']
            gc('run','jobs','deploy',name,'--region='+REGION,'--image='+api_image,'--service-account='+identity,'--command=node','--args=dist/'+entry+'.mjs','--tasks=1','--parallelism=1','--max-retries=0','--task-timeout=900s','--memory=512Mi','--cpu=1','--env-vars-file='+write_json(folder,name+'-env.json',job_values),'--set-secrets='+job_secrets)
        if not resume:
            migration='toolzcraft-'+environment+'-migrate';job(migration,'document-migrate');gc('run','jobs','execute',migration,'--region='+REGION,'--wait')
            binary_env={k:copy.deepcopy(v) for k,v in env.items() if k in ('DATABASE_URL','FIREBASE_PROJECT_ID','APP_ORIGIN','ALLOWED_ORIGINS','TRUST_PROXY')}
            for k,v in {'NODE_ENV':'production','ENABLE_AI':'false','ENABLE_PAYMENTS':'false','ENABLE_DOCUMENT_JOBS':'false','ENABLE_DOCUMENT_SCAN':'true','ENABLE_DOCUMENT_EXTRACTION':'true','CLAMAV_PORT':'3310'}.items():set_env(binary_env,k,v)
            binary=minimal_service(api,binary_name,api_image,binary_env,identity);binary['metadata']['annotations'].pop('run.googleapis.com/invoker-iam-disabled',None)
            binary['spec']['template']['metadata']['annotations']['run.googleapis.com/container-dependencies']='{"api":["scanner"]}'
            binary['spec']['template']['spec']['containerConcurrency']=2
            binary['spec']['template']['spec']['containers'][0]['resources']['limits']['memory']='1Gi'
            binary['spec']['template']['spec']['containers'].append({'name':'scanner','image':scanner_image,'resources':{'limits':{'cpu':'1','memory':'2Gi'}},'startupProbe':{'httpGet':{'path':'/healthz','port':8081},'periodSeconds':5,'timeoutSeconds':2,'failureThreshold':48}})
            gc('run','services','replace',write_json(folder,'binary.json',binary),'--region='+REGION)
            gc('run','services','add-iam-policy-binding',binary_name,'--region='+REGION,'--member=serviceAccount:'+web_identity,'--role=roles/run.invoker')
            binary_url=describe(binary_name)['status']['url']
            gc('run','services','replace',write_json(folder,'api.json',minimal_service(api,api_name,api_image,env,identity)),'--region='+REGION)
            webenv=env_map(web);set_env(webenv,'API_UPSTREAM',describe(api_name)['status']['url']);set_env(webenv,'API_BINARY_UPSTREAM',binary_url);set_env(webenv,'API_CLOUD_RUN_AUTH','true')
            webservice=minimal_service(web,web_name,web_image,webenv,web_identity);webservice['spec']['template']['spec']['containers'][0]['name']='web'
            gc('run','services','replace',write_json(folder,'web.json',webservice),'--region='+REGION)
        site=describe(web_name)['status']['url']
        for path in ('/','/api/healthz','/guides'):
            print('Checking '+site+path,flush=True)
            with urllib.request.urlopen(site+path,timeout=120) as response:
                if response.status!=200:raise RuntimeError('HTTP smoke check failed: '+path)
        worker='toolzcraft-'+environment+'-document-worker';cleanup='toolzcraft-'+environment+'-document-cleanup'
        job(worker,'document-worker');job(cleanup,'document-maintenance')
        for name in (worker,cleanup):gc('run','jobs','execute',name,'--region='+REGION,'--wait')
        gc('services','enable','cloudscheduler.googleapis.com')
        scheduler='toolzcraft-document-scheduler@'+PROJECT+'.iam.gserviceaccount.com'
        exists=subprocess.run(['gcloud','iam','service-accounts','describe',scheduler,'--project='+PROJECT],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
        if exists.returncode:
            if b'NOT_FOUND' not in exists.stderr:raise RuntimeError('Cannot inspect scheduler identity.')
            gc('iam','service-accounts','create','toolzcraft-document-scheduler','--display-name=ToolzCraft document job scheduler')
        for name,schedule in ((worker,'*/5 * * * *'),(cleanup,'17 * * * *')):
            gc('run','jobs','add-iam-policy-binding',name,'--region='+REGION,'--member=serviceAccount:'+scheduler,'--role=roles/run.invoker')
            found=subprocess.run(['gcloud','scheduler','jobs','describe',name,'--location='+REGION,'--project='+PROJECT],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
            if found.returncode and b'NOT_FOUND' not in found.stderr:raise RuntimeError('Cannot inspect scheduled job.')
            gc('scheduler','jobs','update' if found.returncode==0 else 'create','http',name,'--location='+REGION,'--schedule='+schedule,'--time-zone=UTC','--uri=https://run.googleapis.com/v2/projects/'+PROJECT+'/locations/'+REGION+'/jobs/'+name+':run','--http-method=POST','--oauth-service-account-email='+scheduler,'--message-body={}')
    record={'commit':release,'apiImage':api_image,'webImage':web_image,'scannerImage':scanner_image,'site':site,'completedAt':stamp,'previousApiRevision':recovery['previousApiRevision'],'previousWebRevision':recovery['previousWebRevision']}
    write_json(state,environment+'-'+release+'.json',record)
    print('Rollout and basic smoke checks succeeded: '+site)
    print('Now verify signed-in document, admin and credit flows on staging before promoting this commit. No AdSense approval or ad serving was enabled.')
if __name__=='__main__':
    try:main()
    except Exception as error:print('STOPPED:',str(error));raise SystemExit(1)
