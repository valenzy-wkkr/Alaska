# Clase AppointmentDAO

La clase `AppointmentDAO` maneja el acceso a datos para las citas veterinarias, proporcionando métodos para realizar operaciones CRUD en la base de datos.

## Propiedades

- `db`: Conexión a la base de datos

## Métodos

- `constructor(databaseConnection)`: Inicializa el DAO con una conexión a la base de datos
- `create(appointment)`: Crea una nueva cita en la base de datos
- `findById(id)`: Busca una cita por su ID
- `findByPetId(petId)`: Busca todas las citas de una mascota
- `findByUserId(userId)`: Busca todas las citas de un usuario
- `getPetHistory(petId)`: Obtiene el historial de citas completadas de una mascota
- `update(appointment)`: Actualiza una cita existente
- `delete(id)`: Elimina una cita por su ID

## Ejemplo de Uso

```javascript
// Crear una instancia del DAO
const dbConnection = new DatabaseConnection();
const appointmentDAO = new AppointmentDAO(dbConnection);

// Crear una nueva cita
const appointment = new Appointment(
  null, // ID será generado por la base de datos
  1, // ID de la mascota
  2, // ID del usuario
  new Date('2023-12-15T10:30:00'), // Fecha y hora de la cita
  'Revisión anual', // Motivo
  'programada' // Estado
);

// Guardar la cita en la base de datos
await appointmentDAO.create(appointment);

// Obtener todas las citas de un usuario
const userAppointments = await appointmentDAO.findByUserId(2);

// Obtener el historial de citas de una mascota
const petHistory = await appointmentDAO.getPetHistory(1);
```

## Procedimientos Almacenados Utilizados

- `CreateAppointment`: Crea una nueva cita
- `GetAppointmentById`: Obtiene una cita por su ID
- `GetAppointmentsByPetId`: Obtiene todas las citas de una mascota
- `GetAppointmentsByUserId`: Obtiene todas las citas de un usuario con información de mascotas
- `GetPetAppointmentHistory`: Obtiene el historial de citas completadas de una mascota
- `UpdateAppointment`: Actualiza una cita existente
- `DeleteAppointment`: Elimina una cita por su ID