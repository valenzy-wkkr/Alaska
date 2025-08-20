# Clase Appointment

La clase `Appointment` representa una cita veterinaria en el sistema, con toda la información necesaria para gestionar visitas y tratamientos de mascotas.

## Propiedades

- `id`: Identificador único de la cita
- `petId`: Identificador de la mascota asociada a la cita
- `userId`: Identificador del usuario dueño de la mascota
- `appointmentDate`: Fecha y hora de la cita
- `reason`: Motivo de la cita
- `status`: Estado de la cita (programada, completada, cancelada)
- `notes`: Notas o comentarios sobre la cita
- `treatment`: Tratamiento aplicado durante la cita

## Métodos

- `constructor()`: Inicializa una nueva instancia de cita
- `validate()`: Valida que los datos de la cita sean correctos
- `toJSON()`: Convierte el objeto a formato JSON para su serialización

## Ejemplo de Uso

```javascript
const appointment = new Appointment(
  null, // ID será generado por la base de datos
  1, // ID de la mascota
  2, // ID del usuario
  new Date('2023-12-15T10:30:00'), // Fecha y hora de la cita
  'Revisión anual', // Motivo
  'programada', // Estado
  '', // Notas (vacío inicialmente)
  '' // Tratamiento (vacío inicialmente)
);

if (appointment.validate()) {
  // Guardar la cita en la base de datos
  appointmentDAO.create(appointment);
}
```

## Validaciones

- Todos los campos requeridos deben estar presentes (petId, userId, appointmentDate, reason)
- Los IDs deben ser números válidos
- La fecha debe ser un objeto Date válido
- Para citas nuevas, la fecha debe ser futura
- El estado debe ser uno de los permitidos: 'programada', 'completada', 'cancelada'