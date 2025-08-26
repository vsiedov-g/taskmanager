-- Task Manager Database Initialization Script
-- This script sets up the initial database structure and seed data

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE priority_level AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE task_status AS ENUM ('ToDo', 'InProgress', 'Review', 'Done');
CREATE TYPE user_role AS ENUM ('Admin', 'Manager', 'Member');

-- Create tables will be handled by Entity Framework migrations
-- This file is for initial setup and seed data only

-- Insert default admin user (password will be hashed in application)
-- This is just a placeholder for the migration process

-- Log initialization
INSERT INTO public.__ef_migrations_history (migration_id, product_version) 
VALUES ('00000000000000_InitialSetup', '8.0.0')
ON CONFLICT DO NOTHING;

COMMIT;