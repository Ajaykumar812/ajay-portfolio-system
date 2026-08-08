import pyodbc

conn_str = (
    "Driver={ODBC Driver 17 for SQL Server};"
    "Server=AJAY_KUMAR\\SQLEXPRESS;"
    "Database=PortfolioDB;"
    "Trusted_Connection=yes;"
)

tables = ["Profile", "Skills", "Projects", "Experience", "Education", "BlogPosts"]

try:
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    for t in tables:
        print(f"\n==================== TABLE: {t} ====================")
        cursor.execute(f"SELECT * FROM {t} WHERE IsActive = 1")
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()
        print(f"Total Rows: {len(rows)}")
        for r in rows:
            row_dict = dict(zip(columns, r))
            # Clean up long content for print readability
            for k, v in row_dict.items():
                if isinstance(v, str) and len(v) > 150:
                    row_dict[k] = v[:150] + "..."
            print(row_dict)
            
    conn.close()
except Exception as e:
    print(f"Error: {e}")
