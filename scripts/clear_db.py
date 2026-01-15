import sqlite3
import os

# Database file path (assumes script is run from project root or scripts folder)
DB_FILE = 'leaderboard.db'

# Handle running from scripts/ subdirectory
if not os.path.exists(DB_FILE) and os.path.exists(os.path.join('..', DB_FILE)):
    DB_FILE = os.path.join('..', DB_FILE)

def clear_db():
    if not os.path.exists(DB_FILE):
        print(f"Error: Database file '{DB_FILE}' not found.")
        return

    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        
        # Check current count
        c.execute("SELECT COUNT(*) FROM scores")
        count = c.fetchone()[0]
        print(f"Found {count} records in leaderboard.")
        
        if count == 0:
            print("Leaderboard is already empty.")
            return

        confirm = input("Are you sure you want to delete ALL scores? (y/n): ")
        if confirm.lower() == 'y':
            c.execute("DELETE FROM scores")
            conn.commit()
            print("Successfully cleared all scores.")
        else:
            print("Operation cancelled.")
            
        conn.close()
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    clear_db()
