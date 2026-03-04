-- Ensure the formsync database exists (runs only on first container init)
SELECT 'CREATE DATABASE formsync'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'formsync')\gexec
