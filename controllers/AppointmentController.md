# Clase AppointmentController

La clase `AppointmentController` maneja las operaciones relacionadas con citas veterinarias, actuando como intermediario entre la vista y el modelo de datos.

## Propiedades

- `appointmentDAO`: Instancia del objeto de acceso a datos de citas
- `petDAO`: Instancia del objeto de acceso a datos de mascotas
- `validator`: Instancia del validador de datos
- `errorHandler`: Instancia del manejador de errores

## Métodos

- `constructor()`: Inicializa el controlador
- `createAppointment(appointmentData)`: Crea una nueva cita
- `getAppointmentById(id)`: Obtiene una cita por ID
- `getAppointmentsByPetId(petId)`: Obtiene todas las citas de una mascota
- `getAppointmentsByUserId(userId)`: Obtiene todas las citas de un usuario
- `getPetAppointmentHistory(petId)`: Obtiene el historial de citas de una mascota
- `updateAppointment(id, appointmentData)`: Actualiza una cita existente
- `deleteAppointment(id)`: Elimina una cita
- `validateAppointmentData(appointmentData, isNew)`: Valida los datos de una cita
- `handleCreateAppointment(request, response)`: Maneja la solicitud HTTP para crear una cita
- `handleGetAppointment(request, response)`: Maneja la solicitud HTTP para obtener una cita
- `handleGetAppointmentsByPet(request, response)`: Maneja la solicitud HTTP para obtener citas por mascota
- `handleGetAppointmentsByUser(request, response)`: Maneja la solicitud HTTP para obtener citas por usuario
- `handleGetPetHistory(request, response)`: Maneja la solicitud HTTP para obtener historial de citas
- `handleUpdateAppointment(request, response)`: Maneja la solicitud HTTP para actualizar una cita
- `handleDeleteAppointment(request, response)`: Maneja la solicitud HTTP para eliminar una cita

## Ejemplo de Uso

```javascript
// Crear instancia del controlador
const dbConnection = new DatabaseConnection();
const appointmentDAO = new AppointmentDAO(dbConnection);
const petDAO = new PetDAO(dbConnection);
const validator = new Validator();
const errorHandler = new ErrorHandler();

const appointmentController = new AppointmentController(
  appointmentDAO,
  petDAO,
  validator,
  errorHandler
);

// Crear una nueva cita
const appointmentData = {
  petId: 1,
  userId: 2,
  appointmentDate: '2023-12-15T10:30:00',
  reason: 'Revisión anual',
  status: 'programada'
};

const result = await appointmentController.createAppointment(appointmentData);

// Obtener historial de citas de una mascota
const history = await appointmentController.getPetAppointmentHistory(1);
```

## Validaciones

- Campos requeridos: petId, userId, appointmentDate, reason
- Tipos de datos: petId y userId deben ser números
- Fecha: debe ser válida y futura para citas nuevas o reprogramadas
- Estado: debe ser uno de los permitidos ('programada', 'completada', 'cancelada')

## Manejo de Errores

- Validación de datos de entrada
- Verificación de existencia de mascotas
- Manejo de errores de base de datos
- Respuestas HTTP apropiadas según el resultado de las operaciones