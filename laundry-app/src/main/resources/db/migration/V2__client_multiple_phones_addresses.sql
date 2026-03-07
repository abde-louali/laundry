CREATE TABLE client_phones (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    client_id BIGINT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE client_addresses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    client_id BIGINT NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Migrate existing phone data
INSERT INTO client_phones (client_id, phone_number)
SELECT id, phone FROM clients WHERE phone IS NOT NULL AND phone != '';

-- Migrate existing address data
INSERT INTO client_addresses (client_id, address, latitude, longitude, notes)
SELECT id, address, latitude, longitude, notes FROM clients WHERE address IS NOT NULL AND address != '';

-- Drop old columns
ALTER TABLE clients 
DROP COLUMN phone,
DROP COLUMN address,
DROP COLUMN latitude,
DROP COLUMN longitude,
DROP COLUMN notes;
