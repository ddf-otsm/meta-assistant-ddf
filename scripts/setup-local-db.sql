-- Create the database
CREATE DATABASE meta_assistant;

-- Create the user
CREATE USER postgres WITH PASSWORD 'postgres';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE meta_assistant TO postgres;

-- Connect to the new database
\c meta_assistant

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO postgres; 