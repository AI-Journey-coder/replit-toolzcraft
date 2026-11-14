"""Runs only inside the disposable scanner test container; no host fixture files."""
import pathlib, socket, struct, subprocess, tempfile, time
with tempfile.TemporaryDirectory() as folder:
    config=pathlib.Path(folder)/'clamd.conf'
    config.write_text('Foreground yes\nTCPSocket 3310\nTCPAddr 127.0.0.1\nDatabaseDirectory /var/lib/clamav\nStreamMaxLength 20M\nMaxFileSize 20M\nMaxScanSize 50M\nAlertExceedsMax yes\nAlertEncrypted yes\nLeaveTemporaryFiles no\n')
    daemon=subprocess.Popen(['clamd','--config-file='+str(config)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    try:
        for _ in range(300):
            if daemon.poll() is not None:raise RuntimeError('Scanner failed to start')
            try:
                with socket.create_connection(('127.0.0.1',3310),timeout=1):break
            except OSError:time.sleep(.2)
        else:raise RuntimeError('Scanner startup timeout')
        def scan(data):
            with socket.create_connection(('127.0.0.1',3310),timeout=30) as connection:
                connection.sendall(b'zINSTREAM\0'+struct.pack('!I',len(data))+data+bytes(4))
                result=b''
                while True:
                    chunk=connection.recv(4096)
                    if not chunk:break
                    result+=chunk
                return result
        assert scan(b'Synthetic invoice amount 850')==b'stream: OK\0'
        # Standard harmless antivirus test string, constructed in container memory.
        fixture=b'X5O!P%@AP[4\\PZX54(P^)7CC)7}$' + b'EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*'
        assert b'FOUND' in scan(fixture)
        print('PASS: real ClamAV accepts clean text and blocks the standard antivirus fixture')
    finally:
        daemon.terminate()
        try:daemon.wait(timeout=10)
        except subprocess.TimeoutExpired:daemon.kill();daemon.wait()
