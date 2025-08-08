import socket

s = socket.socket()
s.connect(('192.168.88.100', 8090))
s.send(b'hello from windows')
s.close()
