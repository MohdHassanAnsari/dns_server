import socket
import struct
import psycopg2
from dnslib import DNSRecord, RR, A, AAAA, CNAME, NS
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

DB_CONFIG = {
    "dbname": "dns_server",
    "user": "postgres",
    "password": "879330",
    "host": "localhost",
    "port": 5432
}


def get_dns_records(domain, record_type):
    connection = None
    try:
        connection = psycopg2.connect(**DB_CONFIG)
        cursor = connection.cursor()
        query = "SELECT value, ttl FROM dns_records WHERE name=%s AND type=%s"
        cursor.execute(query, (domain, record_type))
        results = cursor.fetchall()
        return results  # List of (value, ttl)
    except Exception as e:
        print(f"Database error: {e}")
        return []
    finally:
        if connection:
            connection.close()


def add_dns_record(name, record_type, value, ttl=3600):
    """ Inserts a new DNS record into the database. """
    connection = None
    try:
        connection = psycopg2.connect(**DB_CONFIG)
        cursor = connection.cursor()
        query = """
        INSERT INTO dns_records (name, type, value, ttl)
        VALUES (%s, %s, %s, %s)
        """
        cursor.execute(query, (name, record_type, value, ttl))
        connection.commit()
        print(f"✅ DNS Record Added: {name} {record_type} {value} TTL={ttl}")
    except Exception as e:
        print(f"❌ Error Adding Record: {e}")
    finally:
        if connection:
            connection.close()


def update_dns_record(name, record_type, new_value, new_ttl=3600):
    """ Updates an existing DNS record in the database. """
    connection = None
    try:
        connection = psycopg2.connect(**DB_CONFIG)
        cursor = connection.cursor()
        query = """
        UPDATE dns_records SET value=%s, ttl=%s, updated_at=NOW()
        WHERE name=%s AND type=%s
        """
        cursor.execute(query, (new_value, new_ttl, name, record_type))
        connection.commit()
        print(f"✅ DNS Record Updated: {name} {
              record_type} -> {new_value} TTL={new_ttl}")
    except Exception as e:
        print(f"❌ Error Updating Record: {e}")
    finally:
        if connection:
            connection.close()


def delete_dns_record(name, record_type):
    """ Deletes a DNS record from the database. """
    connection = None
    try:
        connection = psycopg2.connect(**DB_CONFIG)
        cursor = connection.cursor()
        query = "DELETE FROM dns_records WHERE name=%s AND type=%s"
        cursor.execute(query, (name, record_type))
        connection.commit()
        print(f"✅ DNS Record Deleted: {name} {record_type}")
    except Exception as e:
        print(f"❌ Error Deleting Record: {e}")
    finally:
        if connection:
            connection.close()


def build_dns_response(request_data):
    request = DNSRecord.parse(request_data)
    reply = request.reply()

    for question in request.questions:
        qname = str(question.qname).strip('.')
        qtype = question.qtype
        # logging.info(f"Received Query: {qname} Type: {qtype}")

        if qtype == 1:  # A Record
            answers = get_dns_records(qname, 'A')
            for value, ttl in answers:
                reply.add_answer(RR(qname, qtype, ttl=ttl, rdata=A(value)))

        elif qtype == 28:  # AAAA Record
            answers = get_dns_records(qname, 'AAAA')
            for value, ttl in answers:
                reply.add_answer(RR(qname, qtype, ttl=ttl, rdata=AAAA(value)))

        elif qtype == 5:  # CNAME Record
            answers = get_dns_records(qname, 'CNAME')
            for value, ttl in answers:
                reply.add_answer(RR(qname, qtype, ttl=ttl, rdata=CNAME(value)))

        elif qtype == 2:  # NS Record
            answers = get_dns_records(qname, 'NS')
            for value, ttl in answers:
                reply.add_answer(RR(qname, qtype, ttl=ttl, rdata=NS(value)))

    # logging.info(f"Response Sent: {reply}")
    return reply.pack()


def start_dns_server():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    server_socket.bind(("0.0.0.0", 53))  # Bind to UDP port 53

    print("DNS Server is running on UDP port 53...")

    while True:
        request_data, client_address = server_socket.recvfrom(512)
        response_data = build_dns_response(request_data)
        server_socket.sendto(response_data, client_address)


if __name__ == "__main__":
    start_dns_server()
