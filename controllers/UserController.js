/**
 * Clase para controlar las operaciones relacionadas con usuarios
 * Actúa como intermediario entre la vista y el modelo de datos
 */
class UserController {
  /**
   * Constructor de la clase UserController
   * @param {UserDAO} userDAO - El objeto de acceso a datos de usuarios
   * @param {Validator} validator - El validador de datos
   * @param {ErrorHandler} errorHandler - El manejador de errores
   */
  constructor(userDAO, validator, errorHandler) {
    this.userDAO = userDAO;
    this.validator = validator;
    this.errorHandler = errorHandler;
  }

  /**
   * Crea un nuevo usuario
   * @param {object} userData - Los datos del usuario a crear
   * @returns {Promise<object>} - El resultado de la operación
   */
  async createUser(userData) {
    try {
      // Validar datos del usuario
      const isValid = this.validateUserData(userData);
      
      if (!isValid) {
        throw new ValidationError('Datos de usuario inválidos', this.validator.getErrors());
      }
      
      // Crear instancia de User
      const user = new User(
        null, // ID será generado por la base de datos
        userData.name,
        userData.email,
        userData.username,
        userData.address,
        userData.password
      );
      
      // Hashear contraseña
      user.hashPassword();
      
      // Crear usuario en la base de datos
      const createdUser = await this.userDAO.create(user);
      
      return {
        success: true,
        message: 'Usuario creado exitosamente',
        user: createdUser.toJSON()
      };
    } catch (error) {
      this.errorHandler.handleError(error, 'UserController.createUser');
      throw error;
    }
  }

  /**
   * Obtiene un usuario por ID
   * @param {number} id - El ID del usuario a obtener
   * @returns {Promise<object>} - El resultado de la operación
   */
  async getUserById(id) {
    try {
      // Validar que el ID sea un número
      if (typeof id !== 'number' || id <= 0) {
        throw new ValidationError('ID de usuario inválido');
      }
      
      // Obtener usuario de la base de datos
      const user = await this.userDAO.findById(id);
      
      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }
      
      return {
        success: true,
        message: 'Usuario obtenido exitosamente',
        user: user.toJSON()
      };
    } catch (error) {
      this.errorHandler.handleError(error, 'UserController.getUserById');
      throw error;
    }
  }

  /**
   * Obtiene un usuario por email
   * @param {string} email - El email del usuario a obtener
   * @returns {Promise<object>} - El resultado de la operación
   */
  async getUserByEmail(email) {
    try {
      // Validar formato de email
      if (!this.validator.validateEmail(email)) {
        throw new ValidationError('Formato de email inválido');
      }
      
      // Obtener usuario de la base de datos
      const user = await this.userDAO.findByEmail(email);
      
      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }
      
      return {
        success: true,
        message: 'Usuario obtenido exitosamente',
        user: user.toJSON()
      };
    } catch (error) {
      this.errorHandler.handleError(error, 'UserController.getUserByEmail');
      throw error;
    }
  }

  /**
   * Actualiza un usuario existente
   * @param {number} id - El ID del usuario a actualizar
   * @param {object} userData - Los nuevos datos del usuario
   * @returns {Promise<object>} - El resultado de la operación
   */
  async updateUser(id, userData) {
    try {
      // Validar que el ID sea un número
      if (typeof id !== 'number' || id <= 0) {
        throw new ValidationError('ID de usuario inválido');
      }
      
      // Validar datos del usuario
      const validationRules = {
        name: ['required', 'name'],
        email: ['required', 'email'],
        username: ['required', 'username'],
        address: ['required', 'address']
      };
      
      const isValid = this.validator.validate(userData, validationRules);
      
      if (!isValid) {
        throw new ValidationError('Datos de usuario inválidos', this.validator.getErrors());
      }
      
      // Verificar que el usuario exista
      const existingUser = await this.userDAO.findById(id);
      if (!existingUser) {
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }
      
      // Actualizar usuario en la base de datos
      const rowsAffected = await this.userDAO.update(id, userData);
      
      if (rowsAffected === 0) {
        return {
          success: false,
          message: 'No se pudo actualizar el usuario'
        };
      }
      
      return {
        success: true,
        message: 'Usuario actualizado exitosamente'
      };
    } catch (error) {
      this.errorHandler.handleError(error, 'UserController.updateUser');
      throw error;
    }
  }

  /**
   * Elimina un usuario
   * @param {number} id - El ID del usuario a eliminar
   * @returns {Promise<object>} - El resultado de la operación
   */
  async deleteUser(id) {
    try {
      // Validar que el ID sea un número
      if (typeof id !== 'number' || id <= 0) {
        throw new ValidationError('ID de usuario inválido');
      }
      
      // Verificar que el usuario exista
      const existingUser = await this.userDAO.findById(id);
      if (!existingUser) {
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }
      
      // Eliminar usuario de la base de datos
      const rowsAffected = await this.userDAO.delete(id);
      
      if (rowsAffected === 0) {
        return {
          success: false,
          message: 'No se pudo eliminar el usuario'
        };
      }
      
      return {
        success: true,
        message: 'Usuario eliminado exitosamente'
      };
    } catch (error) {
      this.errorHandler.handleError(error, 'UserController.deleteUser');
      throw error;
    }
  }

  /**
   * Obtiene todos los usuarios
   * @returns {Promise<object>} - El resultado de la operación
   */
  async getAllUsers() {
    try {
      // Obtener todos los usuarios de la base de datos
      const users = await this.userDAO.findAll();
      
      return {
        success: true,
        message: 'Usuarios obtenidos exitosamente',
        users: users.map(user => user.toJSON())
      };
    } catch (error) {
      this.errorHandler.handleError(error, 'UserController.getAllUsers');
      throw error;
    }
  }

  /**
   * Autentica un usuario
   * @param {string} email - El email del usuario
   * @param {string} password - La contraseña del usuario
   * @returns {Promise<object>} - El resultado de la operación
   */
  async authenticateUser(email, password) {
    try {
      // Validar formato de email
      if (!this.validator.validateEmail(email)) {
        throw new ValidationError('Formato de email inválido');
      }
      
      // Validar longitud mínima de contraseña
      if (!password || password.length < 8) {
        throw new ValidationError('La contraseña debe tener al menos 8 caracteres');
      }
      
      // Autenticar usuario
      const user = await this.userDAO.authenticate(email, password);
      
      if (!user) {
        return {
          success: false,
          message: 'Credenciales inválidas'
        };
      }
      
      return {
        success: true,
        message: 'Autenticación exitosa',
        user: user.toJSON()
      };
    } catch (error) {
      this.errorHandler.handleError(error, 'UserController.authenticateUser');
      throw error;
    }
  }

  /**
   * Valida los datos de un usuario
   * @param {object} userData - Los datos del usuario a validar
   * @returns {boolean} - true si los datos son válidos, false en caso contrario
   */
  validateUserData(userData) {
    const validationRules = {
      name: ['required', 'name'],
      email: ['required', 'email'],
      username: ['required', 'username'],
      address: ['required', 'address'],
      password: ['required', 'password']
    };
    
    return this.validator.validate(userData, validationRules);
  }

  /**
   * Hashea la contraseña de un usuario
   * @param {string} password - La contraseña a hashear
   * @returns {string} - La contraseña hasheada
   */
  hashUserPassword(password) {
    // En una implementación real, se usaría una biblioteca de hashing como bcrypt
    // return bcrypt.hashSync(password, 10);
    
    // Para este ejemplo, simplemente agregamos un prefijo
    return `hashed_${password}`;
  }

  /**
   * Maneja la solicitud de creación de usuario
   * @param {object} request - La solicitud HTTP
   * @param {object} response - La respuesta HTTP
   */
  async handleCreateUser(request, response) {
    try {
      const userData = request.body;
      const result = await this.createUser(userData);
      
      // En una aplicación web real, esto enviaría una respuesta HTTP
      console.log('Respuesta de creación de usuario:', result);
      
      // Para una aplicación web, se usaría algo como:
      // response.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      this.errorHandler.handleError(error, 'UserController.handleCreateUser');
      
      // Para una aplicación web, se usaría algo como:
      // response.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  /**
   * Maneja la solicitud de obtención de usuario
   * @param {object} request - La solicitud HTTP
   * @param {object} response - La respuesta HTTP
   */
  async handleGetUser(request, response) {
    try {
      const userId = parseInt(request.params.id);
      const result = await this.getUserById(userId);
      
      // En una aplicación web real, esto enviaría una respuesta HTTP
      console.log('Respuesta de obtención de usuario:', result);
      
      // Para una aplicación web, se usaría algo como:
      // response.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      this.errorHandler.handleError(error, 'UserController.handleGetUser');
      
      // Para una aplicación web, se usaría algo como:
      // response.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  /**
   * Maneja la solicitud de actualización de usuario
   * @param {object} request - La solicitud HTTP
   * @param {object} response - La respuesta HTTP
   */
  async handleUpdateUser(request, response) {
    try {
      const userId = parseInt(request.params.id);
      const userData = request.body;
      const result = await this.updateUser(userId, userData);
      
      // En una aplicación web real, esto enviaría una respuesta HTTP
      console.log('Respuesta de actualización de usuario:', result);
      
      // Para una aplicación web, se usaría algo como:
      // response.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      this.errorHandler.handleError(error, 'UserController.handleUpdateUser');
      
      // Para una aplicación web, se usaría algo como:
      // response.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  /**
   * Maneja la solicitud de eliminación de usuario
   * @param {object} request - La solicitud HTTP
   * @param {object} response - La respuesta HTTP
   */
  async handleDeleteUser(request, response) {
    try {
      const userId = parseInt(request.params.id);
      const result = await this.deleteUser(userId);
      
      // En una aplicación web real, esto enviaría una respuesta HTTP
      console.log('Respuesta de eliminación de usuario:', result);
      
      // Para una aplicación web, se usaría algo como:
      // response.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      this.errorHandler.handleError(error, 'UserController.handleDeleteUser');
      
      // Para una aplicación web, se usaría algo como:
      // response.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
}

// Importar dependencias necesarias
if (typeof require !== 'undefined') {
  var User = require('../models/User');
  var { ValidationError } = require('../utils/ErrorHandler');
}

// Exportar la clase para poder usarla en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UserController;
}