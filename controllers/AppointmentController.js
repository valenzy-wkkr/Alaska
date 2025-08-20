/**
 * Clase para controlar las operaciones relacionadas con citas veterinarias
 * Actúa como intermediario entre la vista y el modelo de datos
 */
class AppointmentController {
  /**
   * Constructor de la clase AppointmentController
   * @param {AppointmentDAO} appointmentDAO - El objeto de acceso a datos de citas
   * @param {PetDAO} petDAO - El objeto de acceso a datos de mascotas
   * @param {Validator} validator - El validador de datos
   * @param {ErrorHandler} errorHandler - El manejador de errores
   */
  constructor(appointmentDAO, petDAO, validator, errorHandler) {
    this.appointmentDAO = appointmentDAO;
    this.petDAO = petDAO;
    this.validator = validator;
    this.errorHandler = errorHandler;
  }

  /**
   * Crea una nueva cita
   * @param {object} appointmentData - Los datos de la cita a crear
   * @returns {Promise<object>} - El resultado de la operación
   */
  async createAppointment(appointmentData) {
    try {
      // Validar datos de la cita
      const isValid = this.validateAppointmentData(appointmentData);
      
      if (!isValid) {
        throw new ValidationError('Datos de cita inválidos', this.validator.getErrors());
      }
      
      // Verificar que la mascota existe
      const pet = await this.petDAO.findById(appointmentData.petId);
      if (!pet) {
        throw new ValidationError('La mascota no existe');
      }
      
      // Crear instancia de Appointment
      const appointment = new Appointment(
        null, // ID será generado por la base de datos
        appointmentData.petId,
        appointmentData.userId,
        new Date(appointmentData.appointmentDate),
        appointmentData.reason,
        appointmentData.status || 'programada',
        appointmentData.notes || '',
        appointmentData.treatment || ''
      );
      
      // Crear cita en la base de datos
      const createdAppointment = await this.appointmentDAO.create(appointment);
      
      return {
        success: true,
        message: 'Cita creada exitosamente',
        appointment: createdAppointment.toJSON()
      };
    } catch (error) {
      this.errorHandler.handleError(error, 'AppointmentController.createAppointment');
      throw error;
    }
  }

  /**
   * Obtiene una cita por ID
   * @param {number} id - El ID de la cita a obtener
   * @returns {Promise<object>} - El resultado de la operación
   */
  async getAppointmentById(id) {
    try {
      // Validar que el ID sea un número
      if (typeof id !== 'number' || id <= 0) {
        throw new ValidationError('ID de cita inválido');
      }
      
      // Obtener cita de la base de datos
      const appointment = await this.appointmentDAO.findById(id);
      
      if (!appointment) {
        return {
          success: false,
          message: 'Cita no encontrada'
        };
      }
      
      return {
        success: true,
        message: 'Cita obtenida exitosamente',
        appointment: appointment.toJSON()
      };
    } catch (error) {
      this.errorHandler.handleError(error, 'AppointmentController.getAppointmentById');
      throw error;
    }
  }

  /**
   * Obtiene todas las citas de una mascota
   * @param {number} petId - El ID de la mascota
   * @returns {Promise<object>} - El resultado de la operación
   */
  async getAppointmentsByPetId(petId) {
    try {
      // Validar que el ID de mascota sea un número
      if (typeof petId !== 'number' || petId <= 0) {
        throw new ValidationError('ID de mascota inválido');
      }
      
      // Verificar que la mascota existe
      const pet = await this.petDAO.findById(petId);
      if (!pet) {
        throw new ValidationError('La mascota no existe');
      }
      
      // Obtener citas de la base de datos
      const appointments = await this.appointmentDAO.findByPetId(petId);
      
      return {
        success: true,
        message: 'Citas obtenidas exitosamente',
        appointments: appointments.map(appointment => appointment.toJSON())
      };
    } catch (error) {
      this.errorHandler.handleError(error, 'AppointmentController.getAppointmentsByPetId');
      throw error;
    }
  }

  /**
   * Obtiene todas las citas de un usuario
   * @param {number} userId - El ID del usuario
   * @returns {Promise<object>} - El resultado de la operación
   */
  async getAppointmentsByUserId(userId) {
    try {
      // Validar que el ID de usuario sea un número
      if (typeof userId !== 'number' || userId <= 0) {
        throw new ValidationError('ID de usuario inválido');
      }
      
      // Obtener citas de la base de datos
      const appointmentsWithPetInfo = await this.appointmentDAO.findByUserId(userId);
      
      return {
        success: true,
        message: 'Citas obtenidas exitosamente',
        appointments: appointmentsWithPetInfo.map(item => ({
          ...item.appointment.toJSON(),
          petName: item.petInfo.name,
          petSpecies: item.petInfo.species,
          petBreed: item.petInfo.breed
        }))
      };
    } catch (error) {
      this.errorHandler.handleError(error, 'AppointmentController.getAppointmentsByUserId');
      throw error;
    }
  }

  /**
   * Obtiene el historial de citas de una mascota
   * @param {number} petId - El ID de la mascota
   * @returns {Promise<object>} - El resultado de la operación
   */
  async getPetAppointmentHistory(petId) {
    try {
      // Validar que el ID de mascota sea un número
      if (typeof petId !== 'number' || petId <= 0) {
        throw new ValidationError('ID de mascota inválido');
      }
      
      // Verificar que la mascota existe
      const pet = await this.petDAO.findById(petId);
      if (!pet) {
        throw new ValidationError('La mascota no existe');
      }
      
      // Obtener historial de citas de la base de datos
      const history = await this.appointmentDAO.getPetHistory(petId);
      
      return {
        success: true,
        message: 'Historial de citas obtenido exitosamente',
        history: history.map(appointment => appointment.toJSON())
      };
    } catch (error) {
      this.errorHandler.handleError(error, 'AppointmentController.getPetAppointmentHistory');
      throw error;
    }
  }

  /**
   * Actualiza una cita existente
   * @param {number} id - El ID de la cita a actualizar
   * @param {object} appointmentData - Los nuevos datos de la cita
   * @returns {Promise<object>} - El resultado de la operación
   */
  async updateAppointment(id, appointmentData) {
    try {
      // Validar que el ID sea un número
      if (typeof id !== 'number' || id <= 0) {
        throw new ValidationError('ID de cita inválido');
      }
      
      // Obtener la cita existente
      const existingAppointment = await this.appointmentDAO.findById(id);
      if (!existingAppointment) {
        return {
          success: false,
          message: 'Cita no encontrada'
        };
      }
      
      // Validar datos de la cita
      const isValid = this.validateAppointmentData(appointmentData, false);
      if (!isValid) {
        throw new ValidationError('Datos de cita inválidos', this.validator.getErrors());
      }
      
      // Actualizar los datos de la cita
      existingAppointment.appointmentDate = new Date(appointmentData.appointmentDate);
      existingAppointment.reason = appointmentData.reason;
      existingAppointment.status = appointmentData.status;
      existingAppointment.notes = appointmentData.notes || existingAppointment.notes;
      existingAppointment.treatment = appointmentData.treatment || existingAppointment.treatment;
      
      // Actualizar cita en la base de datos
      const updated = await this.appointmentDAO.update(existingAppointment);
      
      if (!updated) {
        return {
          success: false,
          message: 'No se pudo actualizar la cita'
        };
      }
      
      return {
        success: true,
        message: 'Cita actualizada exitosamente',
        appointment: existingAppointment.toJSON()
      };
    } catch (error) {
      this.errorHandler.handleError(error, 'AppointmentController.updateAppointment');
      throw error;
    }
  }

  /**
   * Elimina una cita
   * @param {number} id - El ID de la cita a eliminar
   * @returns {Promise<object>} - El resultado de la operación
   */
  async deleteAppointment(id) {
    try {
      // Validar que el ID sea un número
      if (typeof id !== 'number' || id <= 0) {
        throw new ValidationError('ID de cita inválido');
      }
      
      // Verificar que la cita existe
      const appointment = await this.appointmentDAO.findById(id);
      if (!appointment) {
        return {
          success: false,
          message: 'Cita no encontrada'
        };
      }
      
      // Eliminar cita de la base de datos
      const deleted = await this.appointmentDAO.delete(id);
      
      if (!deleted) {
        return {
          success: false,
          message: 'No se pudo eliminar la cita'
        };
      }
      
      return {
        success: true,
        message: 'Cita eliminada exitosamente'
      };
    } catch (error) {
      this.errorHandler.handleError(error, 'AppointmentController.deleteAppointment');
      throw error;
    }
  }

  /**
   * Valida los datos de una cita
   * @param {object} appointmentData - Los datos a validar
   * @param {boolean} isNew - Indica si es una cita nueva o una actualización
   * @returns {boolean} - true si los datos son válidos, false en caso contrario
   */
  validateAppointmentData(appointmentData, isNew = true) {
    this.validator.reset();
    
    // Validar campos requeridos
    if (isNew) {
      this.validator.required(appointmentData.petId, 'petId', 'El ID de mascota es requerido');
      this.validator.required(appointmentData.userId, 'userId', 'El ID de usuario es requerido');
    }
    
    this.validator.required(appointmentData.appointmentDate, 'appointmentDate', 'La fecha de la cita es requerida');
    this.validator.required(appointmentData.reason, 'reason', 'El motivo de la cita es requerido');
    
    // Validar tipos de datos
    if (appointmentData.petId) {
      this.validator.isNumber(appointmentData.petId, 'petId', 'El ID de mascota debe ser un número');
    }
    
    if (appointmentData.userId) {
      this.validator.isNumber(appointmentData.userId, 'userId', 'El ID de usuario debe ser un número');
    }
    
    // Validar fecha
    if (appointmentData.appointmentDate) {
      const date = new Date(appointmentData.appointmentDate);
      this.validator.isDate(date, 'appointmentDate', 'La fecha de la cita no es válida');
      
      // Para citas nuevas o reprogramaciones, validar que la fecha sea futura
      if (appointmentData.status === 'programada' && date < new Date()) {
        this.validator.addError('appointmentDate', 'La fecha de la cita debe ser futura');
      }
    }
    
    // Validar estado
    if (appointmentData.status) {
      const validStatus = ['programada', 'completada', 'cancelada'];
      this.validator.isIn(appointmentData.status, validStatus, 'status', 'El estado no es válido');
    }
    
    return this.validator.isValid();
  }

  /**
   * Maneja la solicitud HTTP para crear una cita
   * @param {Request} request - La solicitud HTTP
   * @param {Response} response - La respuesta HTTP
   */
  async handleCreateAppointment(request, response) {
    try {
      const appointmentData = request.body;
      const result = await this.createAppointment(appointmentData);
      response.status(201).json(result);
    } catch (error) {
      this.errorHandler.handleHttpError(error, response);
    }
  }

  /**
   * Maneja la solicitud HTTP para obtener una cita
   * @param {Request} request - La solicitud HTTP
   * @param {Response} response - La respuesta HTTP
   */
  async handleGetAppointment(request, response) {
    try {
      const id = parseInt(request.params.id);
      const result = await this.getAppointmentById(id);
      
      if (!result.success) {
        response.status(404).json(result);
        return;
      }
      
      response.status(200).json(result);
    } catch (error) {
      this.errorHandler.handleHttpError(error, response);
    }
  }

  /**
   * Maneja la solicitud HTTP para obtener citas por mascota
   * @param {Request} request - La solicitud HTTP
   * @param {Response} response - La respuesta HTTP
   */
  async handleGetAppointmentsByPet(request, response) {
    try {
      const petId = parseInt(request.params.petId);
      const result = await this.getAppointmentsByPetId(petId);
      response.status(200).json(result);
    } catch (error) {
      this.errorHandler.handleHttpError(error, response);
    }
  }

  /**
   * Maneja la solicitud HTTP para obtener citas por usuario
   * @param {Request} request - La solicitud HTTP
   * @param {Response} response - La respuesta HTTP
   */
  async handleGetAppointmentsByUser(request, response) {
    try {
      const userId = parseInt(request.params.userId);
      const result = await this.getAppointmentsByUserId(userId);
      response.status(200).json(result);
    } catch (error) {
      this.errorHandler.handleHttpError(error, response);
    }
  }

  /**
   * Maneja la solicitud HTTP para obtener historial de citas
   * @param {Request} request - La solicitud HTTP
   * @param {Response} response - La respuesta HTTP
   */
  async handleGetPetHistory(request, response) {
    try {
      const petId = parseInt(request.params.petId);
      const result = await this.getPetAppointmentHistory(petId);
      response.status(200).json(result);
    } catch (error) {
      this.errorHandler.handleHttpError(error, response);
    }
  }

  /**
   * Maneja la solicitud HTTP para actualizar una cita
   * @param {Request} request - La solicitud HTTP
   * @param {Response} response - La respuesta HTTP
   */
  async handleUpdateAppointment(request, response) {
    try {
      const id = parseInt(request.params.id);
      const appointmentData = request.body;
      const result = await this.updateAppointment(id, appointmentData);
      
      if (!result.success) {
        response.status(404).json(result);
        return;
      }
      
      response.status(200).json(result);
    } catch (error) {
      this.errorHandler.handleHttpError(error, response);
    }
  }

  /**
   * Maneja la solicitud HTTP para eliminar una cita
   * @param {Request} request - La solicitud HTTP
   * @param {Response} response - La respuesta HTTP
   */
  async handleDeleteAppointment(request, response) {
    try {
      const id = parseInt(request.params.id);
      const result = await this.deleteAppointment(id);
      
      if (!result.success) {
        response.status(404).json(result);
        return;
      }
      
      response.status(200).json(result);
    } catch (error) {
      this.errorHandler.handleHttpError(error, response);
    }
  }
}

// Exportar la clase para poder usarla en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppointmentController;
}