/**
 * Clase para acceder a los datos de citas en la base de datos
 * Proporciona métodos para realizar operaciones CRUD sobre citas
 */
class AppointmentDAO {
  /**
   * Constructor de la clase AppointmentDAO
   * @param {DatabaseConnection} databaseConnection - La conexión a la base de datos
   */
  constructor(databaseConnection) {
    this.db = databaseConnection;
  }

  /**
   * Crea una nueva cita en la base de datos
   * @param {Appointment} appointment - El objeto Appointment a crear
   * @returns {Promise<Appointment>} - La cita creada con su ID asignado
   */
  async create(appointment) {
    try {
      // Validar que la cita tenga los datos requeridos
      if (!appointment.validate()) {
        throw new Error('Datos de cita inválidos');
      }

      const params = {
        petId: appointment.petId,
        userId: appointment.userId,
        appointmentDate: appointment.appointmentDate,
        reason: appointment.reason,
        status: appointment.status,
        notes: appointment.notes,
        treatment: appointment.treatment
      };

      // Ejecutar el procedimiento almacenado para crear cita
      const result = await this.db.executeStoredProcedure('CreateAppointment', params);
      
      // Asignar el ID generado a la cita
      appointment.id = result[0].AppointmentId;
      
      return appointment;
    } catch (error) {
      console.error('Error al crear cita:', error);
      throw new Error(`No se pudo crear la cita: ${error.message}`);
    }
  }

  /**
   * Busca una cita por su ID
   * @param {number} id - El ID de la cita a buscar
   * @returns {Promise<Appointment|null>} - La cita encontrada o null si no existe
   */
  async findById(id) {
    try {
      // Ejecutar el procedimiento almacenado para obtener cita por ID
      const result = await this.db.executeStoredProcedure('GetAppointmentById', { appointmentId: id });
      
      if (result.length === 0) {
        return null;
      }
      
      const appointmentData = result[0];
      
      // Crear y retornar un objeto Appointment con los datos obtenidos
      return new Appointment(
        appointmentData.id,
        appointmentData.petId,
        appointmentData.userId,
        new Date(appointmentData.appointmentDate),
        appointmentData.reason,
        appointmentData.status,
        appointmentData.notes,
        appointmentData.treatment
      );
    } catch (error) {
      console.error('Error al buscar cita por ID:', error);
      throw new Error(`No se pudo obtener la cita: ${error.message}`);
    }
  }

  /**
   * Busca todas las citas de una mascota
   * @param {number} petId - El ID de la mascota
   * @returns {Promise<Array<Appointment>>} - Lista de citas de la mascota
   */
  async findByPetId(petId) {
    try {
      // Ejecutar el procedimiento almacenado para obtener citas por ID de mascota
      const result = await this.db.executeStoredProcedure('GetAppointmentsByPetId', { petId: petId });
      
      // Mapear los resultados a objetos Appointment
      return result.map(appointmentData => new Appointment(
        appointmentData.id,
        appointmentData.petId,
        appointmentData.userId,
        new Date(appointmentData.appointmentDate),
        appointmentData.reason,
        appointmentData.status,
        appointmentData.notes,
        appointmentData.treatment
      ));
    } catch (error) {
      console.error('Error al buscar citas por ID de mascota:', error);
      throw new Error(`No se pudieron obtener las citas: ${error.message}`);
    }
  }

  /**
   * Busca todas las citas de un usuario
   * @param {number} userId - El ID del usuario
   * @returns {Promise<Array<Object>>} - Lista de citas del usuario con información de mascotas
   */
  async findByUserId(userId) {
    try {
      // Ejecutar el procedimiento almacenado para obtener citas por ID de usuario
      const result = await this.db.executeStoredProcedure('GetAppointmentsByUserId', { userId: userId });
      
      // Retornar los resultados con información adicional de mascotas
      return result.map(data => ({
        appointment: new Appointment(
          data.id,
          data.petId,
          data.userId,
          new Date(data.appointmentDate),
          data.reason,
          data.status,
          data.notes,
          data.treatment
        ),
        petInfo: {
          name: data.petName,
          species: data.species,
          breed: data.breed
        }
      }));
    } catch (error) {
      console.error('Error al buscar citas por ID de usuario:', error);
      throw new Error(`No se pudieron obtener las citas: ${error.message}`);
    }
  }

  /**
   * Obtiene el historial de citas completadas de una mascota
   * @param {number} petId - El ID de la mascota
   * @returns {Promise<Array<Appointment>>} - Lista de citas completadas de la mascota
   */
  async getPetHistory(petId) {
    try {
      // Ejecutar el procedimiento almacenado para obtener historial de citas
      const result = await this.db.executeStoredProcedure('GetPetAppointmentHistory', { petId: petId });
      
      // Mapear los resultados a objetos Appointment
      return result.map(appointmentData => new Appointment(
        appointmentData.id,
        appointmentData.petId,
        appointmentData.userId,
        new Date(appointmentData.appointmentDate),
        appointmentData.reason,
        appointmentData.status,
        appointmentData.notes,
        appointmentData.treatment
      ));
    } catch (error) {
      console.error('Error al obtener historial de citas:', error);
      throw new Error(`No se pudo obtener el historial de citas: ${error.message}`);
    }
  }

  /**
   * Actualiza una cita existente
   * @param {Appointment} appointment - La cita con los datos actualizados
   * @returns {Promise<boolean>} - true si la actualización fue exitosa
   */
  async update(appointment) {
    try {
      // Validar que la cita tenga los datos requeridos
      if (!appointment.validate() || !appointment.id) {
        throw new Error('Datos de cita inválidos');
      }

      const params = {
        appointmentId: appointment.id,
        appointmentDate: appointment.appointmentDate,
        reason: appointment.reason,
        status: appointment.status,
        notes: appointment.notes,
        treatment: appointment.treatment
      };

      // Ejecutar el procedimiento almacenado para actualizar cita
      const result = await this.db.executeStoredProcedure('UpdateAppointment', params);
      
      return result[0].RowsAffected > 0;
    } catch (error) {
      console.error('Error al actualizar cita:', error);
      throw new Error(`No se pudo actualizar la cita: ${error.message}`);
    }
  }

  /**
   * Elimina una cita por su ID
   * @param {number} id - El ID de la cita a eliminar
   * @returns {Promise<boolean>} - true si la eliminación fue exitosa
   */
  async delete(id) {
    try {
      // Ejecutar el procedimiento almacenado para eliminar cita
      const result = await this.db.executeStoredProcedure('DeleteAppointment', { appointmentId: id });
      
      return result[0].RowsAffected > 0;
    } catch (error) {
      console.error('Error al eliminar cita:', error);
      throw new Error(`No se pudo eliminar la cita: ${error.message}`);
    }
  }
}

// Exportar la clase para poder usarla en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppointmentDAO;
}