"""Bounded, noninteractive extraction worker. Input bytes only; no network or credentials."""
import io, json, os, re, subprocess, sys, tempfile, zipfile
from pathlib import Path
from xml.etree import ElementTree

MAX_BYTES = 20 * 1024 * 1024
MAX_TEXT = 200000

def command(args):
    return subprocess.run(args, check=True, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, timeout=20).stdout

def extract(data, kind, root):
    if not data or len(data) > MAX_BYTES:
        raise ValueError('File size exceeds limits')
    pages, warnings = [], []
    if kind == 'txt':
        text = data.decode('utf-8-sig', errors='strict')
        if '\0' in text: raise ValueError('Binary text input')
        pages = [text]
    elif kind == 'docx':
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            entries = archive.infolist()
            if len(entries)>2000 or sum(e.file_size for e in entries)>50*1024*1024 or any(e.flag_bits & 1 for e in entries):
                raise ValueError('Archive exceeds limits or is encrypted')
            xml = archive.read('word/document.xml')
            if len(xml)>5*1024*1024 or b'<!DOCTYPE' in xml.upper() or b'<!ENTITY' in xml.upper():
                raise ValueError('Unsupported document XML')
            doc = ElementTree.fromstring(xml)
            ns = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
            paragraphs=[]
            for p in doc.iter(ns+'p'):
                paragraphs.append(''.join(n.text or '' if n.tag==ns+'t' else '\t' if n.tag==ns+'tab' else '\n' if n.tag==ns+'br' else '' for n in p.iter()))
            pages=['\n'.join(paragraphs)]
            warnings.append('DOCX paragraphs are normalized; original page boundaries and layout are not preserved.')
    elif kind == 'pdf':
        if not data.startswith(b'%PDF-'): raise ValueError('Invalid PDF signature')
        source=root/'input.pdf';source.write_bytes(data)
        info=command(['pdfinfo',str(source)]).decode('utf-8',errors='replace')
        match=re.search(r'^Pages:\s+(\d+)',info,re.M)
        if not match or not 1<=int(match.group(1))<=20: raise ValueError('PDF must contain 1–20 pages')
        for number in range(1,int(match.group(1))+1):
            target=root/'text.txt'
            command(['pdftotext','-f',str(number),'-l',str(number),'-layout',str(source),str(target)])
            if target.stat().st_size>MAX_TEXT*4: raise ValueError('Text exceeds limit')
            text=target.read_text(encoding='utf-8').strip('\f\n ')
            if not text:
                image=root/'page'
                command(['pdftoppm','-f',str(number),'-l',str(number),'-singlefile','-scale-to','1600','-png',str(source),str(image)])
                text=command(['tesseract',str(image)+'.png','stdout','-l','eng']).decode('utf-8')
                warnings.append('Page '+str(number)+': English OCR; review recognition errors.')
            pages.append(text)
    elif kind in ('png','jpg','jpeg'):
        from PIL import Image
        Image.MAX_IMAGE_PIXELS=20000000
        if kind=='png' and not data.startswith(b'\x89PNG\r\n\x1a\n'): raise ValueError('Invalid PNG signature')
        if kind in ('jpg','jpeg') and not data.startswith(b'\xff\xd8\xff'): raise ValueError('Invalid JPEG signature')
        with Image.open(io.BytesIO(data)) as image:
            if image.width*image.height>20000000: raise ValueError('Image pixel limit exceeded')
            image.thumbnail((2400,2400));image.convert('RGB').save(root/'image.png')
        pages=[command(['tesseract',str(root/'image.png'),'stdout','-l','eng']).decode('utf-8')]
        warnings.append('English OCR; review recognition errors. Use local multilingual OCR for other languages.')
    else: raise ValueError('Unsupported format')
    if sum(len(p) for p in pages)>MAX_TEXT: raise ValueError('Extracted text exceeds 200,000 characters; split the document')
    if not any(p.strip() for p in pages): raise ValueError('No text found')
    return {'pages':[{'id':'page-'+str(i+1),'label':'Page '+str(i+1) if kind=='pdf' else 'Extracted text','text':p} for i,p in enumerate(pages)],'warnings':warnings}

if __name__=='__main__':
    try:
        if os.name=='posix':
            import resource
            resource.setrlimit(resource.RLIMIT_AS,(512*1024*1024,512*1024*1024))
            resource.setrlimit(resource.RLIMIT_FSIZE,(64*1024*1024,64*1024*1024))
            resource.setrlimit(resource.RLIMIT_CPU,(35,35))
        data=sys.stdin.buffer.read(MAX_BYTES+1)
        if len(sys.argv)>2:
            result=extract(data,sys.argv[1],Path(sys.argv[2]))
        else:
            with tempfile.TemporaryDirectory(prefix='toolzcraft-extract-') as directory:
                result=extract(data,sys.argv[1],Path(directory))
        print(json.dumps(result,ensure_ascii=True))
    except Exception:
        # Never echo document content, paths, passwords or parser diagnostics.
        print(json.dumps({'error':'Extraction failed: unsupported, encrypted, corrupt or oversized document. Use local extraction or split the file.'}))
        sys.exit(1)
