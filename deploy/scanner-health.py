"""Readiness only: never accepts file data or exposes the clamd command socket."""
from http.server import BaseHTTPRequestHandler,HTTPServer
import socket
class Health(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path!='/healthz':self.send_error(404);return
        ready=False
        try:
            with socket.create_connection(('127.0.0.1',3310),timeout=1) as scanner:
                scanner.sendall(b'zPING\0');ready=scanner.recv(32)==b'PONG\0'
        except OSError:pass
        self.send_response(200 if ready else 503);self.send_header('Content-Type','text/plain');self.end_headers();self.wfile.write(b'ok' if ready else b'not ready')
    def log_message(self,*args):pass
HTTPServer(('0.0.0.0',8081),Health).serve_forever()
