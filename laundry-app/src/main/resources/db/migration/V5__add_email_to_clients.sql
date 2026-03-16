-- Migration to add email column to clients table
ALTER TABLE clients ADD COLUMN email VARCHAR(255) AFTER name;
