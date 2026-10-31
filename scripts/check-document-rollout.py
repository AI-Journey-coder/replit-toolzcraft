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
 def test_private_recovery_record(self):
  with tempfile.TemporaryDirectory() as d:
   p=m.write_json(pathlib.Path(d),'recovery.json',{'revision':'old'});self.assertIn('old',pathlib.Path(p).read_text())
unittest.main()
