/**
 * Script para crear la base de datos de Alaska Pets
 */

-- Crear base de datos
CREATE DATABASE AlaskaPets;
GO

-- Usar la base de datos
USE AlaskaPets;
GO

-- Crear tabla de usuarios
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    username NVARCHAR(50) NOT NULL UNIQUE,
    address NVARCHAR(255) NOT NULL,
    password NVARCHAR(255) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Crear tabla de mascotas
CREATE TABLE Pets (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    species NVARCHAR(50) NOT NULL,
    breed NVARCHAR(100),
    age INT,
    weight DECIMAL(5,2),
    userId INT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);
GO

-- Crear índices para mejorar el rendimiento
CREATE INDEX IX_Users_Email ON Users(email);
CREATE INDEX IX_Users_Username ON Users(username);
CREATE INDEX IX_Pets_UserId ON Pets(userId);
GO

-- Crear trigger para actualizar la fecha de modificación
CREATE TRIGGER TR_Users_UpdateTimestamp
ON Users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Users
    SET updated_at = GETDATE()
    WHERE id IN (SELECT DISTINCT id FROM Inserted);
END;
GO

CREATE TRIGGER TR_Pets_UpdateTimestamp
ON Pets
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Pets
    SET updated_at = GETDATE()
    WHERE id IN (SELECT DISTINCT id FROM Inserted);
END;
GO