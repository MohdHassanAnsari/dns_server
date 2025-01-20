from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import psycopg2
from typing import List
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (Change this for security)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Database Config
DB_CONFIG = {
    "dbname": "dns_server",
    "user": "postgres",
    "password": "879330",  # Change this
    "host": "localhost",
    "port": 5432
}

# Pydantic Model for DNS Records


class DNSRecord(BaseModel):
    name: str
    type: str
    value: str
    ttl: int

# Connect to PostgreSQL


def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

# Fetch All DNS Records


@app.get("/dns", response_model=List[DNSRecord])
def get_dns_records():
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT name, type, value, ttl FROM dns_records")
    records = cursor.fetchall()
    connection.close()
    return [{"name": r[0], "type": r[1], "value": r[2], "ttl": r[3]} for r in records]

# Add New DNS Record


@app.post("/dns")
def add_dns_record(record: DNSRecord):
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "INSERT INTO dns_records (name, type, value, ttl) VALUES (%s, %s, %s, %s)",
            (record.name, record.type, record.value, record.ttl)
        )
        connection.commit()
        return {"message": "Record added successfully"}
    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        connection.close()

# Update DNS Record


@app.put("/dns/{name}/{type}")
def update_dns_record(name: str, type: str, record: DNSRecord):
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "UPDATE dns_records SET value=%s, ttl=%s WHERE name=%s AND type=%s",
            (record.value, record.ttl, name, type)
        )
        connection.commit()
        return {"message": "Record updated successfully"}
    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        connection.close()

# Delete DNS Record


@app.delete("/dns/{name}/{type}")
def delete_dns_record(name: str, type: str):
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "DELETE FROM dns_records WHERE name=%s AND type=%s", (name, type))
        connection.commit()
        return {"message": "Record deleted successfully"}
    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        connection.close()
