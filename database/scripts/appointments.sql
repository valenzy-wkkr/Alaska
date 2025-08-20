/**
 * Script para crear la tabla de citas y sus procedimientos almacenados
 */

USE AlaskaPets;
GO

-- Crear tabla de citas
CREATE TABLE Appointments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    petId INT NOT NULL,
    userId INT NOT NULL,
    appointmentDate DATETIME2 NOT NULL,
    reason NVARCHAR(255) NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'programada',
    notes NVARCHAR(MAX),
    treatment NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (petId) REFERENCES Pets(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);
GO

-- Crear índices para mejorar el rendimiento
CREATE INDEX IX_Appointments_PetId ON Appointments(petId);
CREATE INDEX IX_Appointments_UserId ON Appointments(userId);
CREATE INDEX IX_Appointments_Date ON Appointments(appointmentDate);
GO

-- Crear trigger para actualizar la fecha de modificación
CREATE TRIGGER TR_Appointments_UpdateTimestamp
ON Appointments
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Appointments
    SET updated_at = GETDATE()
    WHERE id IN (SELECT DISTINCT id FROM Inserted);
END;
GO

-- Procedimiento para crear una cita
CREATE PROCEDURE CreateAppointment
    @petId INT,
    @userId INT,
    @appointmentDate DATETIME2,
    @reason NVARCHAR(255),
    @status NVARCHAR(50) = 'programada',
    @notes NVARCHAR(MAX) = NULL,
    @treatment NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        INSERT INTO Appointments (petId, userId, appointmentDate, reason, status, notes, treatment)
        VALUES (@petId, @userId, @appointmentDate, @reason, @status, @notes, @treatment);
        
        DECLARE @appointmentId INT = SCOPE_IDENTITY();
        
        COMMIT TRANSACTION;
        
        SELECT @appointmentId AS AppointmentId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        THROW;
    END CATCH
END;
GO

-- Procedimiento para obtener una cita por ID
CREATE PROCEDURE GetAppointmentById
    @appointmentId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT id, petId, userId, appointmentDate, reason, status, notes, treatment, created_at, updated_at
    FROM Appointments
    WHERE id = @appointmentId;
END;
GO

-- Procedimiento para obtener citas por ID de mascota
CREATE PROCEDURE GetAppointmentsByPetId
    @petId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT id, petId, userId, appointmentDate, reason, status, notes, treatment, created_at, updated_at
    FROM Appointments
    WHERE petId = @petId
    ORDER BY appointmentDate DESC;
END;
GO

-- Procedimiento para obtener citas por ID de usuario
CREATE PROCEDURE GetAppointmentsByUserId
    @userId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT a.id, a.petId, a.userId, a.appointmentDate, a.reason, a.status, a.notes, a.treatment, a.created_at, a.updated_at,
           p.name AS petName, p.species, p.breed
    FROM Appointments a
    INNER JOIN Pets p ON a.petId = p.id
    WHERE a.userId = @userId
    ORDER BY a.appointmentDate DESC;
END;
GO

-- Procedimiento para actualizar una cita
CREATE PROCEDURE UpdateAppointment
    @appointmentId INT,
    @appointmentDate DATETIME2,
    @reason NVARCHAR(255),
    @status NVARCHAR(50),
    @notes NVARCHAR(MAX) = NULL,
    @treatment NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        UPDATE Appointments
        SET appointmentDate = @appointmentDate,
            reason = @reason,
            status = @status,
            notes = @notes,
            treatment = @treatment,
            updated_at = GETDATE()
        WHERE id = @appointmentId;
        
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

-- Procedimiento para eliminar una cita
CREATE PROCEDURE DeleteAppointment
    @appointmentId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DELETE FROM Appointments
        WHERE id = @appointmentId;
        
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

-- Procedimiento para obtener el historial de citas de una mascota
CREATE PROCEDURE GetPetAppointmentHistory
    @petId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT id, petId, userId, appointmentDate, reason, status, notes, treatment, created_at, updated_at
    FROM Appointments
    WHERE petId = @petId AND status = 'completada'
    ORDER BY appointmentDate DESC;
END;
GO