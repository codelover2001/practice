import socket

c=socket.socket()

c.connect(('localhost',3000))

print(c.recv(1024).decode())


