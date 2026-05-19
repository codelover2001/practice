database_host="localhost"
database_name="lab4"
database_user='postgres'
database_password="postgres"

import psycopg2
conn = psycopg2.connect(dbname = database_name,user=database_user,password=database_password,host=database_host)



cur = conn.cursor()  
# cur.execute('DROP TABLE IF EXISTS reservation')
# cur.execute("CREATE TABLE reservation (seat_no int NOT NULL,p_name varchar(50), p_src varchar(20),p_dest varchar(20),PRIMARY KEY(seat_no));")
# conn.pcommit()

def insert_module():
    seat = input("Enter the seat no: ")
    name = input("Enter the name: ")
    src = input("Enter the src: ")
    dest = input("Enter the dest: ")
    cur.execute("INSERT INTO reservation VALUES(%s,%s, %s, %s);",(seat,name,src,dest))
    conn.commit()
    print("All the values have been inserted successfully")


insert_module()

def find_module():
    name = input("Enter the name of passenger to view the details: ")
    cur.execute("SELECT * FROM reservation WHERE p_name=%s;",(name,)) 
    print(cur.fetchall())
    conn.commit()

# find_module()

def update_module():
    name=input("Enter name of passenger to see the details: ")
    dest = input("Enter the new destination: ")
    cur.execute("UPDATE reservation SET p_dest = %s WHERE P_name = %s",(dest,name))
    conn.commit()
    print("All the information has been updated successfully")

# update_module()

def delete_module():
    seatNo=input("Enter the seat number to cancel ticket: ")
    cur.execute("DELETE FROM reservation WHERE seat_no=%s",(seatNo,))
    conn.commit()
    print("Deleted Successfully")

# delete_module()

cur.close()
conn.close()