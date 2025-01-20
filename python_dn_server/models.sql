CREATE TABLE dns_records (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('A', 'AAAA', 'CNAME', 'NS')),
    value VARCHAR(255) NOT NULL,
    ttl INTEGER NOT NULL DEFAULT 3600
);

-- Sample Data
INSERT INTO dns_records (name, type, value, ttl) VALUES
('example.com', 'A', '192.168.1.1', 3600),
('example.com', 'AAAA', '2001:db8::1', 3600),
('www.example.com', 'CNAME', 'example.com', 3600),
('example.com', 'NS', 'ns1.example.com', 3600);
