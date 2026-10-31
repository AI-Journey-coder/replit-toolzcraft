import importlib.util, io, tempfile, unittest, zipfile
from pathlib import Path
spec=importlib.util.spec_from_file_location('extractor',str(Path(__file__).resolve().parents[1]/'artifacts/api-server/document-extract.py'))
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)

class ExtractionTests(unittest.TestCase):
    def extract(self,data,kind):
        with tempfile.TemporaryDirectory() as folder:return module.extract(data,kind,Path(folder))
    def test_text_and_no_silent_truncation(self):
        self.assertEqual(self.extract('Amount ₹850'.encode(),'txt')['pages'][0]['text'],'Amount ₹850')
        for content in [b'',b'\0binary',b'x'*200001,b'\xff']:
            with self.assertRaises(Exception):self.extract(content,'txt')
    def test_docx_normalization_and_entity_rejection(self):
        def document(xml):
            output=io.BytesIO()
            with zipfile.ZipFile(output,'w') as z:z.writestr('word/document.xml',xml)
            return output.getvalue()
        xml='<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Invoice</w:t><w:tab/><w:t>850</w:t></w:r></w:p></w:body></w:document>'
        self.assertEqual(self.extract(document(xml),'docx')['pages'][0]['text'],'Invoice\t850')
        with self.assertRaises(Exception):self.extract(document('<!DOCTYPE x [<!ENTITY a "x">]>'+xml),'docx')
    def test_searchable_pdf_page_evidence(self):
        from reportlab.pdfgen import canvas
        buffer=io.BytesIO();pdf=canvas.Canvas(buffer);pdf.drawString(50,700,'Invoice amount 850');pdf.showPage();pdf.drawString(50,700,'Due date September 1');pdf.save()
        result=self.extract(buffer.getvalue(),'pdf')
        self.assertEqual(len(result['pages']),2);self.assertIn('850',result['pages'][0]['text']);self.assertIn('September',result['pages'][1]['text'])
    def test_png_jpeg_and_scanned_pdf_ocr(self):
        from PIL import Image,ImageDraw,ImageFont
        image=Image.new('RGB',(1200,400),'white');draw=ImageDraw.Draw(image)
        font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',56)
        draw.text((60,80),'Invoice amount 850',font=font,fill='black')
        for kind in ['png','jpeg','pdf']:
            buffer=io.BytesIO();image.save(buffer,format=kind.upper())
            result=self.extract(buffer.getvalue(),kind)
            self.assertIn('850',result['pages'][0]['text']);self.assertTrue(result['warnings'])
    def test_corrupt_files_fail(self):
        for kind in ['pdf','png','jpg','docx']:
            with self.assertRaises(Exception):self.extract(b'not a document',kind)

if __name__=='__main__':unittest.main()
