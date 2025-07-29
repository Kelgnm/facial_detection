import psycopg2
from db_setup import DATABASE_CONFIG, DATABASE_DISTANCE

def duplication(vec_low, vec_high):
    vec_low_str = "(" + ",".join(str(v) for v in vec_low) + ")"
    vec_high_str = "(" + ",".join(str(v) for v in vec_high) + ")"

    try:
        connect = psycopg2.connect(DATABASE_CONFIG)
        cursor = connect.cursor()

        cursor.execute("""
            SELECT file, id,
                   (CUBE(%s) <-> vec_low) + (CUBE(%s) <-> vec_high) AS distance
            FROM vectors
            ORDER BY distance ASC
            LIMIT 1;
        """, (vec_low_str, vec_high_str))

        result = cursor.fetchone()
        cursor.close()
        connect.close()

        if result and result[2] < DATABASE_DISTANCE:
            return True, result[0], result[2]
        
        return False

    except Exception as e:
        raise RuntimeError(f"Database check failed: {str(e)}")