/**
 * Script para crear los procedimientos almacenados de Alaska Pets
 */

USE AlaskaPets;
GO

-- Procedimiento para crear un usuario
CREATE PROCEDURE CreateUser
    @name NVARCHAR(100),
    @email NVARCHAR(255),
    @username NVARCHAR(50),
    @address NVARCHAR(255),
    @password NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        INSERT INTO Users (name, email, username, address, password)
        VALUES (@name, @email, @username, @address, @password);
        
        DECLARE @userId INT = SCOPE_IDENTITY();
        
        COMMIT TRANSACTION;
        
        SELECT @userId AS UserId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        THROW;
    END CATCH
END;
GO

-- Procedimiento para obtener un usuario por ID
CREATE PROCEDURE GetUserById
    @userId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT id, name, email, username, address, created_at, updated_at
    FROM Users
    WHERE id = @userId;
END;
GO

-- Procedimiento para obtener un usuario por email
CREATE PROCEDURE GetUserByEmail
    @email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT id, name, email, username, address, created_at, updated_at
    FROM Users
    WHERE email = @email;
END;
GO

-- Procedimiento para actualizar un usuario
CREATE PROCEDURE UpdateUser
    @userId INT,
    @name NVARCHAR(100),
    @email NVARCHAR(255),
    @username NVARCHAR(50),
    @address NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        UPDATE Users
        SET name = @name,
            email = @email,
            username = @username,
            address = @address,
            updated_at = GETDATE()
        WHERE id = @userId;
        
        COMMIT TRANSACTION;
        
        SELECT @@ROWCOUNT AS RowsAffected;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        THROW;
    END CATCH
END;
GO

-- Procedimiento para eliminar un usuario
CREATE PROCEDURE DeleteUser
    @userId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DELETE FROM Users
        WHERE id = @userId;
        
        COMMIT TRANSACTION;
        
        SELECT @@ROWCOUNT AS RowsAffected;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        THROW;
    END CATCH
END;
GO

-- Procedimiento para autenticar un usuario
CREATE PROCEDURE AuthenticateUser
    @email NVARCHAR(255),
    @password NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT id, name, email, username, address, created_at, updated_at
    FROM Users
    WHERE email = @email AND password = @password;
END;
GO

-- Procedimiento para crear una mascota
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
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        INSERT INTO Pets (name, species, breed, age, weight, userId)
        VALUES (@name, @species, @breed, @age, @weight, @userId);
        
        DECLARE @petId INT = SCOPE_IDENTITY();
        
        COMMIT TRANSACTION;
        
        SELECT @petId AS PetId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        THROW;
    END CATCH
END;
GO

-- Procedimiento para obtener una mascota por ID
CREATE PROCEDURE GetPetById
    @petId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT id, name, species, breed, age, weight, userId, created_at, updated_at
    FROM Pets
    WHERE id = @petId;
END;
GO

-- Procedimiento para obtener mascotas por ID de usuario
CREATE PROCEDURE GetPetsByUserId
    @userId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT id, name, species, breed, age, weight, userId, created_at, updated_at
    FROM Pets
    WHERE userId = @userId;
END;
GO

-- Procedimiento para actualizar una mascota
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
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        UPDATE Pets
        SET name = @name,
            species = @species,
            breed = @breed,
            age = @age,
            weight = @weight,
            updated_at = GETDATE()
        WHERE id = @petId;
        
        COMMIT TRANSACTION;
        
        SELECT @@ROWCOUNT AS RowsAffected;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        THROW;
    END CATCH
END;
GO

-- Procedimiento para eliminar una mascota
CREATE PROCEDURE DeletePet
    @petId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DELETE FROM Pets
        WHERE id = @petId;
        
        COMMIT TRANSACTION;
        
        SELECT @@ROWCOUNT AS RowsAffected;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        THROW;
    END CATCH
END;
GO