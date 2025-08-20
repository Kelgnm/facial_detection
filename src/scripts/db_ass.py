import psycopg2
import numpy as np
from cryptography.fernet import Fernet
from psycopg2.extras import RealDictCursor

connect = "dbname=face_images user=postgres password=kokostelko123 host=localhost port=5432"

def split(embedding):
    return embedding[:64], embedding[64:]

def load_key():
    with open("secret.key", "rb") as f:
        return f.read()

def insert(name, role, password, embedding, log):
    try:
        log(f"Connecting to: {connect}")
        conn = psycopg2.connect(connect)
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        log("Checking for duplicates...")
        cursor.execute("SELECT vec_low, vec_high, name FROM facess")
        rows = cursor.fetchall()

        for row in rows:
            low = np.array([float(x) for x in row['vec_low'].strip('()').split(',')], dtype=np.float64)
            high = np.array([float(x) for x in row['vec_high'].strip('()').split(',')], dtype=np.float64)
            existing_embedding = np.concatenate((low, high))
            dist = np.linalg.norm(existing_embedding - embedding)
            log(f"Checking duplicate: {row['name']}, distance={dist}")
            if dist < 0.6:
                return False, f"Face already exists as '{row['name']}'"


        vec_low, vec_high = split(embedding)
        vec_low_str = ",".join(str(round(v, 6)) for v in vec_low)
        vec_high_str = ",".join(str(round(v, 6)) for v in vec_high)

        log("Encrypting password...")
        key = load_key()
        fernet = Fernet(key)
        encPassword = fernet.encrypt(password.encode()).decode()

        log(f"Inserting user: {name}, role: {role}")
        cursor.execute("""
            INSERT INTO facess (name, role, password, vec_low, vec_high)
            VALUES (%s, %s, %s, %s, %s)
        """, (name, role, encPassword, vec_low_str, vec_high_str))

        if cursor.rowcount != 1:
            raise Exception("Insert failed, rowcount != 1")

        conn.commit()
        log("Insert committed successfully!")

        cursor.close()
        conn.close()
        return True, f"User '{name}' registered successfully."

    except Exception as e:
        log(f"Database error: {e}")
        return False, f"Database error: {str(e)}"
