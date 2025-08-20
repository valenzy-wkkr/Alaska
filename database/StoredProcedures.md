# Procedimientos Almacenados

Este documento describe los procedimientos almacenados que se utilizarán en la base de datos SQL Server 2019 para mejorar la seguridad y el rendimiento.

## Procedimientos para Usuarios

### CreateUser
Crea un nuevo usuario en la base de datos.

```sql
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
```

### GetUserById
Obtiene un usuario por su ID.

```sql
CREATE PROCEDURE GetUserById
    @userId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT id, name, email, username, address, password
    FROM Users
    WHERE id = @userId;
END
```

### GetUserByEmail
Obtiene un usuario por su email.

```sql
CREATE PROCEDURE GetUserByEmail
    @email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT id, name, email, username, address, password
    FROM Users
    WHERE email = @email;
END
```

### UpdateUser
Actualiza la información de un usuario existente.

```sql
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
        address = @address
    WHERE id = @userId;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
```

### DeleteUser
Elimina un usuario de la base de datos.

```sql
CREATE PROCEDURE DeleteUser
    @userId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DELETE FROM Users
    WHERE id = @userId;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
```

### AuthenticateUser
Autentica un usuario por email y contraseña.

```sql
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
```

## Procedimientos para Mascotas

### CreatePet
Crea una nueva mascota en la base de datos.

```sql
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
```

### GetPetById
Obtiene una mascota por su ID.

```sql
CREATE PROCEDURE GetPetById
    @petId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT id, name, species, breed, age, weight, userId
    FROM Pets
    WHERE id = @petId;
END
```

### GetPetsByUserId
Obtiene todas las mascotas de un usuario.

```sql
CREATE PROCEDURE GetPetsByUserId
    @userId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT id, name, species, breed, age, weight, userId
    FROM Pets
    WHERE userId = @userId;
END
```

### UpdatePet
Actualiza la información de una mascota existente.

```sql
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
        weight = @weight
    WHERE id = @petId;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
```

### DeletePet
Elimina una mascota de la base de datos.

```sql
CREATE PROCEDURE DeletePet
    @petId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DELETE FROM Pets
    WHERE id = @petId;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END
```

## Beneficios de usar procedimientos almacenados

1. **Seguridad**: Previenen inyección SQL al usar parámetros
2. **Rendimiento**: Se compilan una vez y se reutilizan
3. **Mantenimiento**: Centralizan la lógica de base de datos
4. **Control de acceso**: Se pueden asignar permisos específicos
5. **Reducción de tráfico**: Menos datos enviados entre aplicación y base de datos