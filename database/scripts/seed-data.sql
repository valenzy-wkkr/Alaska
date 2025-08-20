/**
 * Script para insertar datos de prueba en la base de datos de Alaska Pets
 */

USE AlaskaPets;
GO

-- Insertar usuarios de prueba
INSERT INTO Users (name, email, username, address, password)
VALUES 
    ('Juan Pérez', 'juan@example.com', 'juanp', 'Calle 123, Ciudad', 'hashed_password123'),
    ('María García', 'maria@example.com', 'mariag', 'Avenida 456, Ciudad', 'hashed_password456'),
    ('Carlos López', 'carlos@example.com', 'carlosl', 'Boulevard 789, Ciudad', 'hashed_password789');
GO

-- Insertar mascotas de prueba
INSERT INTO Pets (name, species, breed, age, weight, userId)
VALUES 
    ('Firulais', 'perro', 'Labrador', 3, 25.5, 1),
    ('Mishi', 'gato', 'Siames', 2, 4.2, 1),
    ('Rocky', 'perro', 'Pastor Alemán', 5, 30.0, 2),
    ('Luna', 'gato', 'Persa', 1, 3.8, 2),
    ('Max', 'perro', 'Chihuahua', 4, 2.5, 3);
GO