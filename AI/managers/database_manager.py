import psycopg2

from managers.env_manager import getEnv
from pgvector.psycopg2 import register_vector

def create_db_conn():
    conn = psycopg2.connect(
        database=getEnv("DATABASE_NAME"),
        user=getEnv("DATABASE_USER"),
        password=getEnv("DATABASE_PASSWORD"),
        host=getEnv("DATABASE_HOST"),
        port=getEnv("DATABASE_PORT")
    )

    register_vector(conn)
    return conn

def query_db(query, params):
    with create_db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            result = cur.fetchall()
            return result

def insert_db(query, params):
    with create_db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            conn.commit()