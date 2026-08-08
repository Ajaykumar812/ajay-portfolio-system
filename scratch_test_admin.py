import pyodbc

conn_str = (
    "Driver={ODBC Driver 17 for SQL Server};"
    "Server=AJAY_KUMAR\\SQLEXPRESS;"
    "Database=PortfolioDB;"
    "Trusted_Connection=yes;"
)

try:
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Admin")
    columns = [col[0] for col in cursor.description]
    rows = cursor.fetchall()
    print("Local Admin Table Rows:")
    for r in rows:
        print(dict(zip(columns, r)))
    conn.close()
except Exception as e:
    print("Error:", e)
