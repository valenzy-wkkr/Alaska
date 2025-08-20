/**
 * Clase para controlar las operaciones relacionadas con mascotas
 * Actúa como intermediario entre la vista y el modelo de datos
 */
class PetController {
  /**
   * Constructor de la clase PetController
   * @param {PetDAO} petDAO - El objeto de acceso a datos de mascotas
   * @param {Validator} validator - El validador de datos
   * @param {ErrorHandler} errorHandler - El manejador de errores
   */
  constructor(petDAO, validator, errorHandler) {
    this.petDAO = petDAO;
    this.validator = validator;
    this.errorHandler = errorHandler;
  }

  /**
   * Crea una nueva mascota
   * @param {object} petData - Los datos de la mascota a crear
   * @returns {Promise<object>} - El resultado de la operación
   */
  async createPet(petData) {
    try {
      // Validar datos de la mascota
      const isValid = this.validatePetData(petData);
      
      if (!isValid) {
        throw new ValidationError('Datos de mascota inválidos', this.validator.getErrors());
      }
      
      // Crear instancia de Pet
      const pet = new Pet(
        null, // ID será generado por la base de datos
        petData.name,
        petData.species,
        petData.breed,
        petData.age,
        petData.weight,
        petData.userId
      );
      
      // Crear mascota en la base de datos
      const createdPet = await this.petDAO.create(pet);
      
      return {
        success: true,
        message: 'Mascota creada exitosamente',
        pet: createdPet.toJSON()
      };
    } catch (error) {
      this.errorHandler.handleError(error, 'PetController.createPet');
      throw error;
    }
  }

  /**
   * Obtiene una mascota por ID
   * @param {number} id - El ID de la mascota a obtener
   * @returns {Promise<object>} - El resultado de la operación
   */
  async getPetById(id) {
    try {
      // Validar que el ID sea un número
      if (typeof id !== 'number' || id <= 0) {
        throw new ValidationError('ID de mascota inválido');
      }
      
      // Obtener mascota de la base de datos
      const pet = await this.petDAO.findById(id);
      
      if (!pet) {
        return {
          success: false,
          message: 'Mascota no encontrada'
        };
      }
      
      return {
        success: true,
        message: 'Mascota obtenida exitosamente',
        pet: pet.toJSON()
      };
    } catch (error) {
      this.errorHandler.handleError(error, 'PetController.getPetById');
      throw error;
    }
  }

  /**
   * Obtiene todas las mascotas de un usuario
   * @param {number} userId - El ID del usuario
   * @returns {Promise<object>} - El resultado de la operación
   */
  async getPetsByUserId(userId) {
    try {
      // Validar que el ID de usuario sea un número
      if (typeof userId !== 'number' || userId <= 0) {
        throw new ValidationError('ID de usuario inválido');
      }
      
      // Obtener mascotas de la base de datos
      const pets = await this.petDAO.findByUserId(userId);
      
      return {
        success: true,
        message: 'Mascotas obtenidas exitosamente',
        pets: pets.map(pet => pet.toJSON())
      };
    } catch (error) {
      this.errorHandler.handleError(error, 'PetController.getPetsByUserId');
      throw error;
    }
  }

  /**
   * Actualiza una mascota existente
   * @param {number} id - El ID de la mascota a actualizar
   * @param {object} petData - Los nuevos datos de la mascota
   * @returns {Promise<object>} - El resultado de la operación
   */
  async updatePet(id, petData) {
    try {
      // Validar que el ID sea un número
      if (typeof id !== 'number' || id <= 0) {
        throw new ValidationError('ID de mascota inválido');
      }
      
      // Validar datos de la mascota
      const validationRules = {
        name: ['required', 'name'],
        species: ['required'],
        breed: [],
        age: ['age'],
        weight: ['weight']
      };
      
      const isValid = this.validator.validate(petData, validationRules);
      
      if (!isValid) {
        throw new ValidationError('Datos de mascota inválidos', this.validator.getErrors());
      }
      
      // Verificar que la mascota exista
      const existingPet = await this.petDAO.findById(id);
      if (!existingPet) {
        return {
          success: false,
          message: 'Mascota no encontrada'
        };
      }
      
      // Actualizar mascota en la base de datos
      const rowsAffected = await this.petDAO.update(id, petData);
      
      if (rowsAffected === 0) {
        return {
          success: false,
          message: 'No se pudo actualizar la mascota'
        };
      }
      
      return {
        success: true,
        message: 'Mascota actualizada exitosamente'
      };
    } catch (error) {
      this.errorHandler.handleError(error, 'PetController.updatePet');
      throw error;
    }
  }

  /**
   * Elimina una mascota
   * @param {number} id - El ID de la mascota a eliminar
   * @returns {Promise<object>} - El resultado de la operación
   */
  async deletePet(id) {
    try {
      // Validar que el ID sea un número
      if (typeof id !== 'number' || id <= 0) {
        throw new ValidationError('ID de mascota inválido');
      }
      
      // Verificar que la mascota exista
      const existingPet = await this.petDAO.findById(id);
      if (!existingPet) {
        return {
          success: false,
          message: 'Mascota no encontrada'
        };
      }
      
      // Eliminar mascota de la base de datos
      const rowsAffected = await this.petDAO.delete(id);
      
      if (rowsAffected === 0) {
        return {
          success: false,
          message: 'No se pudo eliminar la mascota'
        };
      }
      
      return {
        success: true,
        message: 'Mascota eliminada exitosamente'
      };
    } catch (error) {
      this.errorHandler.handleError(error, 'PetController.deletePet');
      throw error;
    }
  }

  /**
   * Obtiene todas las mascotas
   * @returns {Promise<object>} - El resultado de la operación
   */
  async getAllPets() {
    try {
      // Obtener todas las mascotas de la base de datos
      const pets = await this.petDAO.findAll();
      
      return {
        success: true,
        message: 'Mascotas obtenidas exitosamente',
        pets: pets.map(pet => pet.toJSON())
      };
    } catch (error) {
      this.errorHandler.handleError(error, 'PetController.getAllPets');
      throw error;
    }
  }

  /**
   * Valida los datos de una mascota
   * @param {object} petData - Los datos de la mascota a validar
   * @returns {boolean} - true si los datos son válidos, false en caso contrario
   */
  validatePetData(petData) {
    const validationRules = {
      name: ['required', 'name'],
      species: ['required'],
      breed: [],
      age: ['age'],
      weight: ['weight'],
      userId: ['required']
    };
    
    return this.validator.validate(petData, validationRules);
  }

  /**
   * Maneja la solicitud de creación de mascota
   * @param {object} request - La solicitud HTTP
   * @param {object} response - La respuesta HTTP
   */
  async handleCreatePet(request, response) {
    try {
      const petData = request.body;
      const result = await this.createPet(petData);
      
      // En una aplicación web real, esto enviaría una respuesta HTTP
      console.log('Respuesta de creación de mascota:', result);
      
      // Para una aplicación web, se usaría algo como:
      // response.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      this.errorHandler.handleError(error, 'PetController.handleCreatePet');
      
      // Para una aplicación web, se usaría algo como:
      // response.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  /**
   * Maneja la solicitud de obtención de mascota
   * @param {object} request - La solicitud HTTP
   * @param {object} response - La respuesta HTTP
   */
  async handleGetPet(request, response) {
    try {
      const petId = parseInt(request.params.id);
      const result = await this.getPetById(petId);
      
      // En una aplicación web real, esto enviaría una respuesta HTTP
      console.log('Respuesta de obtención de mascota:', result);
      
      // Para una aplicación web, se usaría algo como:
      // response.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      this.errorHandler.handleError(error, 'PetController.handleGetPet');
      
      // Para una aplicación web, se usaría algo como:
      // response.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  /**
   * Maneja la solicitud de actualización de mascota
   * @param {object} request - La solicitud HTTP
   * @param {object} response - La respuesta HTTP
   */
  async handleUpdatePet(request, response) {
    try {
      const petId = parseInt(request.params.id);
      const petData = request.body;
      const result = await this.updatePet(petId, petData);
      
      // En una aplicación web real, esto enviaría una respuesta HTTP
      console.log('Respuesta de actualización de mascota:', result);
      
      // Para una aplicación web, se usaría algo como:
      // response.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      this.errorHandler.handleError(error, 'PetController.handleUpdatePet');
      
      // Para una aplicación web, se usaría algo como:
      // response.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  /**
   * Maneja la solicitud de eliminación de mascota
   * @param {object} request - La solicitud HTTP
   * @param {object} response - La respuesta HTTP
   */
  async handleDeletePet(request, response) {
    try {
      const petId = parseInt(request.params.id);
      const result = await this.deletePet(petId);
      
      // En una aplicación web real, esto enviaría una respuesta HTTP
      console.log('Respuesta de eliminación de mascota:', result);
      
      // Para una aplicación web, se usaría algo como:
      // response.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      this.errorHandler.handleError(error, 'PetController.handleDeletePet');
      
      // Para una aplicación web, se usaría algo como:
      // response.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  /**
   * Maneja la solicitud de obtención de mascotas de un usuario
   * @param {object} request - La solicitud HTTP
   * @param {object} response - La respuesta HTTP
   */
  async handleGetUserPets(request, response) {
    try {
      const userId = parseInt(request.params.userId);
      const result = await this.getPetsByUserId(userId);
      
      // En una aplicación web real, esto enviaría una respuesta HTTP
      console.log('Respuesta de obtención de mascotas de usuario:', result);
      
      // Para una aplicación web, se usaría algo como:
      // response.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      this.errorHandler.handleError(error, 'PetController.handleGetUserPets');
      
      // Para una aplicación web, se usaría algo como:
      // response.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
}

// Importar dependencias necesarias
if (typeof require !== 'undefined') {
  var Pet = require('../models/Pet');
  var { ValidationError } = require('../utils/ErrorHandler');
}

// Exportar la clase para poder usarla en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PetController;
}