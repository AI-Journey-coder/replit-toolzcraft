import importlib.util, pathlib, tempfile, unittest
spec=importlib.util.spec_from_file_location('rollout','deploy/rollout-document-intelligence.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class RolloutTests(unittest.TestCase):
 def test_manifest_preserves_namespace_and_private_api(self):
  old={'metadata':{'namespace':304384284059,'annotations':{'run.googleapis.com/ingress':'all','run.googleapis.com/sources':'obsolete'}}}
  x=m.minimal_service(old,'test','image@sha256:abc',{'X':{'name':'X','value':'y'}},'account')
  self.assertEqual(x['metadata']['namespace'],'304384284059');self.assertNotIn('run.googleapis.com/sources',x['metadata']['annotations']);self.assertNotIn('run.googleapis.com/invoker-iam-disabled',x['metadata']['annotations'])
  self.assertEqual(x['spec']['template']['spec']['containers'][0]['env'][0]['value'],'y')
 def test_cloudbuild_requires_success_and_immutable_digest(self):
  original=m.gc
  try:
   m.gc=lambda *a:'{"status":"FAILURE"}'
   with self.assertRaises(RuntimeError):m.build('test','commit')
   m.gc=lambda *a:'{"status":"SUCCESS","results":{"images":[{"name":"registry/repo/image:tag","digest":"sha256:'+('a'*64)+'"}]}}'
   self.assertEqual(m.build('test','commit'),'registry/repo/image@sha256:'+'a'*64)
  finally:m.gc=original
 def test_private_recovery_record(self):
  with tempfile.TemporaryDirectory() as d:
   p=m.write_json(pathlib.Path(d),'recovery.json',{'revision':'old'});self.assertIn('old',pathlib.Path(p).read_text())
unittest.main()
