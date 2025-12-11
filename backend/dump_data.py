import sqlite3
import datetime

def format_value(v):
    if v is None:
        return 'NULL'
    if isinstance(v, (int, float)):
        return str(v)
    # Escape single quotes
    return "'" + str(v).replace("'", "''") + "'"

def generate_inserts(db_path, tables):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("BEGIN;")
    
    for table in tables:
        try:
            cursor.execute(f"SELECT * FROM {table}")
            rows = cursor.fetchall()
            
            # Get column names
            col_names = [description[0] for description in cursor.description]
            cols_str = ", ".join(f'"{c}"' for c in col_names)
            
            for row in rows:
                values = [format_value(val) for val in row]
                vals_str = ", ".join(values)
                print(f"INSERT INTO {table} ({cols_str}) VALUES ({vals_str}) ON CONFLICT DO NOTHING;")
                
        except Exception as e:
            print(f"-- Error processing table {table}: {e}")
            
    print("COMMIT;")
    conn.close()

if __name__ == "__main__":
    generate_inserts('snake_royale.db', ['users', 'leaderboard', 'active_games'])
