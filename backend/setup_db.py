import psycopg2
conn = psycopg2.connect(dbname='janmitra_db', user='janmitra_admin', password='janmitra_password', host='localhost', port='5433')
conn.autocommit = True
cursor = conn.cursor()
cursor.execute('CREATE EXTENSION IF NOT EXISTS postgis;')
cursor.execute('CREATE EXTENSION IF NOT EXISTS vector;')
conn.close()
print("Extensions created")
