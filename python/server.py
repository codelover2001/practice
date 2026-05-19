import socket

s=socket.socket()

print('socket is created')

port = input("Enter the port number that you want to connect :  ")

s.bind(('localhost',port))

s.listen(5)

print('waiting for connections')

while True:
    c,addr=s.accept()
    message=c.recv(1024).decode()
    if message == "Bye":
        c.send(bytes('Bye','utf-8'))
    else :
        UpperCaseString=message.upper()
        c.send(bytes(UpperCaseString,'utf-8'))
        
s.close()