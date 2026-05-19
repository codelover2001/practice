import socket

c=socket.socket()

port = input("Enter the port number that you want to connect :  ")

c.connect(('localhost',port))

while True:
    message=input('Enter message to send :  ')
    c.send(bytes(message,'utf-8'))
    print('got from server '+ c.recv(port).decode())
    if(message=="Bye"):
        break
c.close()	

