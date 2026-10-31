import importlib.util, pathlib, tempfile, unittest
spec=importlib.util.spec_from_file_location('rollout','deploy/rollout-document-intelligence.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class RolloutTests(unittest.TestCase):
 def test_manifest_preserves_namespace_and_private_api(self):
  old={'metadata':{'namespace':304384284059,'annotations':{'run.googleapis.com/ingress':'all','run.googleapis.com/sources':'obsolete'}}}
  x=m.minimal_service(old,'test','image@sha256:abc',{'X':{'name':'X','value':'y'}},'account')
  self.assertEqual(x['metadata']['namespace'],'304384284059');self.assertNotIn('run.googleapis.com/sources',x['metadata']['annotations']);self.assertNotIn('run.googleapis.com/invoker-iam-disabled',x['metadata']['annotations'])
  self.assertEqual(x['spec']['template']['spec']['containers'][0]['env'][0]['value'],'y')
 def test_cloudbuild_requires_success_and_immutable_digest(self):
  from unittest.mock import patch
  build_id='12345678-1234-1234-1234-123456789abc'
  with patch.object(m,'gc',side_effect=[build_id,'{"status":"FAILURE"}']):
   with self.assertRaisesRegex(RuntimeError,'FAILURE'):m.build('test','commit')
  with patch.object(m,'gc',side_effect=[build_id,'{"status":"WORKING"}','{"status":"SUCCESS","results":{"images":[{"name":"registry/repo/image:tag","digest":"sha256:'+('a'*64)+'"}]}}']) as cloud, patch.object(m.time,'sleep'):
   self.assertEqual(m.build('test','commit'),'registry/repo/image@sha256:'+'a'*64)
   self.assertIn('--async',cloud.call_args_list[0].args)
   self.assertEqual(cloud.call_args_list[1].args[:3],('builds','describe',build_id))
  with patch.object(m,'gc',side_effect=[build_id,'']):
   with self.assertRaisesRegex(RuntimeError,build_id):m.build('test','commit')
 def test_resume_checks_deployed_images_and_skips_migrations(self):
  from unittest.mock import patch,MagicMock
  import sys,json
  commit='a'*40; digest='sha256:'+'b'*64
  def service(name):
   container,artifact=('scanner','scanner') if name.endswith('documents') else ('api','api') if name.endswith('api') else ('web','web')
   return {'status':{'latestReadyRevisionName':'ready','traffic':[{'revisionName':'ready','percent':100}],'url':'https://example.test'},'spec':{'template':{'spec':{'serviceAccountName':'test','containers':[{'name':container,'image':m.REGION+'-docker.pkg.dev/'+m.PROJECT+'/toolzcraft-staging/'+artifact+'@'+digest,'env':[{'name':'DATABASE_URL','valueFrom':{'secretKeyRef':{'name':'db','key':'1'}}}]}]}}}}
  with tempfile.TemporaryDirectory() as d:
   home=pathlib.Path(d); state=home/'.toolzcraft-rollouts';state.mkdir();record=state/'staging-20261031T142604Z-recovery.json'
   record.write_text(json.dumps(dict(commit=commit,api='toolzcraft-staging-api',website='toolzcraft-staging',previousApiRevision='old-api',previousWebRevision='old-web')))
   response=MagicMock();response.__enter__.return_value.status=200
   with patch.object(sys,'argv',['rollout','--apply','--resume-staging-jobs',str(record)]),patch.object(pathlib.Path,'home',return_value=home),patch.object(m,'run',side_effect=['c'*40,'','deploy/rollout-document-intelligence.py']),patch.object(m,'describe',side_effect=service),patch.object(m,'gc',side_effect=lambda *a:digest if a[0]=='artifacts' else '') as cloud,patch.object(m.subprocess,'run',return_value=MagicMock(returncode=0)),patch.object(m.urllib.request,'urlopen',return_value=response) as urls:
    m.main()
    self.assertEqual([call.args[0] for call in urls.call_args_list],['https://example.test/','https://example.test/api/healthz','https://example.test/guides'])
    self.assertFalse(any('toolzcraft-staging-migrate' in c.args or 'replace' in c.args for c in cloud.call_args_list))
    self.assertEqual(json.loads((state/('staging-'+'c'*40+'.json')).read_text())['previousApiRevision'],'old-api')
 def test_private_recovery_record(self):
  with tempfile.TemporaryDirectory() as d:
   p=m.write_json(pathlib.Path(d),'recovery.json',{'revision':'old'});self.assertIn('old',pathlib.Path(p).read_text())
unittest.main()
