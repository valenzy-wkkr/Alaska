# Esquema de Base de Datos

Este documento contiene los scripts SQL para crear la base de datos y sus tablas.

## Creación de la Base de Datos

```sql
-- Crear la base de datos
CREATE DATABASE AlaskaPets;
GO

-- Usar la base de datos
USE AlaskaPets;
GO
```

## Creación de Tablas

### Tabla Users

```sql
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

-- Crear índices para mejorar el rendimiento
CREATE INDEX IX_Users_Email ON Users(email);
CREATE INDEX IX_Users_Username ON Users(username);
GO
```

### Tabla Pets

```sql
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

-- Crear índice para mejorar el rendimiento
CREATE INDEX IX_Pets_UserId ON Pets(userId);
GO
```

## Procedimientos Almacenados

### Procedimientos para Usuarios

```sql
-- Crear procedimiento para crear usuario
CREATE PROCEDURE CreateUser
    @name NVARCHAR(100),
    @email NVARCHAR(255),
    @username NVARCHAR(50),
    @address NVARCHAR(255),
    @password NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Users (name, email, username, address, password)
    VALUES (@name, @email, @username, @address, @password);
    
    SELECT SCOPE_IDENTITY() AS UserId;
END
GO

-- Crear procedimiento para obtener usuario por ID
CREATE PROCEDURE GetUserById
    @userId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT id, name, email, username, address
    FROM Users
    WHERE id = @userId;
END
GO

-- Crear procedimiento para obtener usuario por email
CREATE PROCEDURE GetUserByEmail
    @email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT id, name, email, username, address
    FROM Users
    WHERE email = @email;
END
GO

-- Crear procedimiento para actualizar usuario
CREATE PROCEDURE UpdateUser
    @userId INT,
    @name NVARCHAR(100),
    @email NVARCHAR(255),
    @username NVARCHAR(50),
    @address NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Users
    SET name = @name,
        email = @email,
        username = @username,
        address = @address,
        updated_at = GETDATE()
    WHERE id = @userId;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- Crear procedimiento para eliminar usuario
CREATE PROCEDURE DeleteUser
    @userId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DELETE FROM Users
    WHERE id = @userId;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- Crear procedimiento para autenticar usuario
CREATE PROCEDURE AuthenticateUser
    @email NVARCHAR(255),
    @password NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT id, name, email, username, address
    FROM Users
    WHERE email = @email AND password = @password;
END
GO
```

### Procedimientos para Mascotas

```sql
-- Crear procedimiento para crear mascota
CREATE PROCEDURE CreatePet
    @name NVARCHAR(100),
    @species NVARCHAR(50),
    @breed NVARCHAR(100),
    @age INT,
    @weight DECIMAL(5,2),
    @userId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Pets (name, species, breed, age, weight, userId)
    VALUES (@name, @species, @breed, @age, @weight, @userId);
    
    SELECT SCOPE_IDENTITY() AS PetId;
END
GO

-- Crear procedimiento para obtener mascota por ID
CREATE PROCEDURE GetPetById
    @petId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT id, name, species, breed, age, weight, userId
    FROM Pets
    WHERE id = @petId;
END
GO

-- Crear procedimiento para obtener mascotas por ID de usuario
CREATE PROCEDURE GetPetsByUserId
    @userId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT id, name, species, breed, age, weight, userId
    FROM Pets
    WHERE userId = @userId;
END
GO

-- Crear procedimiento para actualizar mascota
CREATE PROCEDURE UpdatePet
    @petId INT,
    @name NVARCHAR(100),
    @species NVARCHAR(50),
    @breed NVARCHAR(100),
    @age INT,
    @weight DECIMAL(5,2)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Pets
    SET name = @name,
        species = @species,
        breed = @breed,
        age = @age,
        weight = @weight,
        updated_at = GETDATE()
    WHERE id = @petId;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- Crear procedimiento para eliminar mascota
CREATE PROCEDURE DeletePet
    @petId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DELETE FROM Pets
    WHERE id = @petId;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
```

## Ejemplos de Consultas

### Consultas INSERT

```sql
-- Insertar un nuevo usuario
INSERT INTO Users (name, email, username, address, password)
VALUES ('Juan Pérez', 'juan@example.com', 'juanp', 'Calle 123', 'hashed_password');

-- Insertar una nueva mascota
INSERT INTO Pets (name, species, breed, age, weight, userId)
VALUES ('Firulais', 'perro', 'Labrador', 3, 25.5, 1);
```

### Consultas SELECT

```sql
-- Obtener todos los usuarios
SELECT * FROM Users;

-- Obtener todas las mascotas de un usuario
SELECT * FROM Pets WHERE userId = 1;

-- Obtener usuario y sus mascotas
SELECT u.name AS UserName, p.name AS PetName, p.species
FROM Users u
JOIN Pets p ON u.id = p.userId
WHERE u.id = 1;
```

### Consultas UPDATE

```sql
-- Actualizar información de usuario
UPDATE Users
SET address = 'Nueva Dirección 456'
WHERE id = 1;

-- Actualizar información de mascota
UPDATE Pets
SET weight = 27.0
WHERE id = 1;
```

### Consultas DELETE

```sql
-- Eliminar una mascota
DELETE FROM Pets WHERE id = 1;

-- Eliminar un usuario (también eliminará sus mascotas por la restricción CASCADE)
DELETE FROM Users WHERE id = 1;
```

## Consideraciones de Seguridad

1. **Contraseñas**: Las contraseñas deben almacenarse como hashes, no en texto plano
2. **Validación**: Validar todos los datos antes de insertarlos en la base de datos
3. **Consultas parametrizadas**: Usar siempre consultas parametrizadas para prevenir inyección SQL
4. **Permisos**: Asignar permisos mínimos necesarios a la cuenta de la aplicación
5. **Auditoría**: Registrar cambios importantes en la base de datos para auditoría