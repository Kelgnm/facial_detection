import psycopg2
import numpy as np
from cryptography.fernet import Fernet
from psycopg2.extras import RealDictCursor

connect = "dbname=face_images user=postgres password=kokostelko123 host=localhost port=5432"

def split(embedding):
    vec_low = embedding[:64]
    vec_high = embedding[64:]
    return vec_low, vec_high

def cube(vec):
    return "(" + ",".join(str(round(v, 6)) for v in vec) + ")"

def generated():
    key = Fernet.generate_key()
    with open("secret.key", "wb") as f:
        f.write(key)
    
def load_key():
    with open("secret.key", "rb") as f:
        return f.read()

def insert(name, role, password, embedding):
    try:
        print(f"Connecting to: {connect}")
        conn = psycopg2.connect(connect)
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        print("Checking for duplicates...")
        cursor.execute("SELECT vec_low, vec_high, name FROM detected")
        rows = cursor.fetchall()

        for row in rows:
            low = np.array([float(x) for x in row['vec_low'].strip('()').split(',')])
            high = np.array([float(x) for x in row['vec_high'].strip('()').split(',')])
            existing_embedding = np.concatenate((low, high))

            dist = np.linalg.norm(existing_embedding - embedding)
            if dist < 0.5:
                print(f"Duplicate found: {row['name']}")
                return False, f"Face already exists as '{row['name']}'"

        print("Splitting embedding...")
        vec_low, vec_high = split(embedding)
        vec_low_str = cube(vec_low)
        vec_high_str = cube(vec_high)

        print("Encrypting password...")
        key = load_key()
        fernet = Fernet(key)
        encMessage = fernet.encrypt(password.encode()).decode()

        print(f"Inserting user: {name}, role: {role}")
        cursor.execute("""
            INSERT INTO detected (name, role, password, vec_low, vec_high)
            VALUES (%s, %s, %s, %s, %s)
        """, (name, role, encMessage, vec_low_str, vec_high_str))

        # Check affected rows
        if cursor.rowcount != 1:
            raise Exception("Insert failed, rowcount != 1")

        conn.commit()
        print("Insert committed successfully!")

        cursor.close()
        conn.close()

        return True, f"User '{name}' registered successfully."

    except Exception as e:
        print("Database error:", e)
        return False, f"Database error: {str(e)}"
