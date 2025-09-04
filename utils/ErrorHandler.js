/**
 * Clase para manejar errores en la aplicación
 * Proporciona métodos para manejar diferentes tipos de errores y registrarlos
 */
class ErrorHandler {
  /**
   * Constructor de la clase ErrorHandler
   */
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logger = console; // En una implementación real, se usaría un logger como Winston
  }

  /**
   * Maneja un error específico
   * @param {Error} error - El error a manejar
   * @param {string} context - El contexto donde ocurrió el error
   */
  handleError(error, context = '') {
    // Registrar el error
    this.logError(error, context);

    // Mostrar mensaje amigable al usuario según el tipo de error
    if (error instanceof ValidationError) {
      this.showUserError('Por favor, verifica que todos los campos estén correctamente llenados.');
    } else if (error instanceof DatabaseError) {
      this.handleDatabaseError(error);
    } else if (error instanceof NetworkError) {
      this.showUserError('Problemas de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.');
    } else {
      this.showUserError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
    }

    // Enviar reporte de error en modo desarrollo
    if (this.isDevelopment) {
      console.error('Error detallado:', error);
    }
  }

  /**
   * Maneja errores de base de datos
   * @param {DatabaseError} error - El error de base de datos
   */
  handleDatabaseError(error) {
    switch (error.type) {
      case 'CONNECTION_ERROR':
        this.showUserError('No se puede conectar a la base de datos. Por favor, inténtelo de nuevo más tarde.');
        break;
        
      case 'CONNECTION_TIMEOUT':
        this.showUserError('La conexión a la base de datos está tardando demasiado. Por favor, inténtelo de nuevo.');
        break;
        
      case 'DUPLICATE_ENTRY':
        this.showUserError('Este valor ya existe en el sistema. Por favor, use un valor diferente.');
        break;
        
      case 'INTEGRITY_CONSTRAINT_VIOLATION':
        this.showUserError('No se puede realizar esta acción debido a restricciones del sistema.');
        break;
        
      case 'SYNTAX_ERROR':
        this.showUserError('Error en la solicitud. Por favor, inténtelo de nuevo.');
        // En modo desarrollo, mostrar detalles adicionales
        if (this.isDevelopment) {
          console.error('Detalles del error:', error.originalError);
        }
        break;
        
      case 'AUTHENTICATION_ERROR':
        this.showUserError('Error de autenticación. Verifique sus credenciales.');
        break;
        
      case 'PERMISSION_DENIED':
        this.showUserError('No tiene permisos suficientes para realizar esta acción.');
        break;
        
      default:
        this.showUserError('Ocurrió un error en la base de datos. Por favor, inténtelo de nuevo más tarde.');
        break;
    }
  }

  /**
   * Maneja errores de validación
   * @param {ValidationError} error - El error de validación
   */
  handleValidationError(error) {
    // Mostrar errores de validación específicos si están disponibles
    if (error.errors && Object.keys(error.errors).length > 0) {
      const errorMessages = Object.values(error.errors).flat();
      this.showUserError(`Error de validación: ${errorMessages.join(', ')}`);
    } else {
      this.showUserError('Por favor, verifica que todos los campos estén correctamente llenados.');
    }
  }

  /**
   * Maneja errores de red
   * @param {NetworkError} error - El error de red
   */
  handleNetworkError(error) {
    this.showUserError('Problemas de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.');
  }

  /**
   * Muestra un error amigable al usuario
   * @param {string} message - El mensaje de error
   */
  showUserError(message) {
    // En una aplicación web real, esto podría mostrar un mensaje en la interfaz
    console.warn(`[ERROR] ${message}`);
    
    // Para una aplicación web, se podría usar algo como:
    // alert(message);
    // o mostrar un mensaje en un elemento HTML
  }

  /**
   * Registra un error en el sistema
   * @param {Error} error - El error a registrar
   * @param {string} context - El contexto donde ocurrió el error
   */
  logError(error, context = '') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      context: context,
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
      // Información adicional para errores de base de datos
      ...(error instanceof DatabaseError && {
        databaseErrorType: error.type,
        originalError: error.originalError?.message
      }),
      // Información adicional para errores de validación
      ...(error instanceof ValidationError && {
        validationErrors: error.errors
      })
    };

    // En una implementación real, se usaría un logger como Winston
    this.logger.error(JSON.stringify(logEntry, null, 2));
  }

  /**
   * Formatea un error para mostrarlo
   * @param {Error} error - El error a formatear
   * @returns {string} - El error formateado
   */
  formatError(error) {
    return `${error.name}: ${error.message}`;
  }

  /**
   * Obtiene un mensaje de error descriptivo
   * @param {Error} error - El error
   * @returns {string} - El mensaje de error descriptivo
   */
  getErrorMessage(error) {
    if (error.message) {
      return error.message;
    }
    
    if (error.name) {
      return `Error: ${error.name}`;
    }
    
    return 'Ocurrió un error desconocido';
  }

  /**
   * Verifica si un error es operacional
   * @param {Error} error - El error a verificar
   * @returns {boolean} - true si el error es operacional, false en caso contrario
   */
  isOperationalError(error) {
    return error instanceof ValidationError || 
           error instanceof DatabaseError || 
           error instanceof NetworkError;
  }

  /**
   * Envía reporte de error (opcional)
   * @param {Error} error - El error
   * @param {string} context - El contexto donde ocurrió el error
   */
  sendErrorReport(error, context = '') {
    // En una implementación real, esto podría enviar el error a un servicio de reporte
    // como Sentry, Bugsnag, etc.
    console.info('Enviando reporte de error:', { error, context });
  }
}

/**
 * Clase para representar errores de validación
 */
class ValidationError extends Error {
  /**
   * Constructor de la clase ValidationError
   * @param {string} message - Mensaje de error
   * @param {object} errors - Errores de validación específicos
   */
  constructor(message, errors = {}) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Clase para representar errores de base de datos
 */
class DatabaseError extends Error {
  /**
   * Constructor de la clase DatabaseError
   * @param {string} message - Mensaje de error
   * @param {string} type - Tipo de error
   * @param {object} originalError - Error original de la base de datos
   */
  constructor(message, type, originalError = null) {
    super(message);
    this.name = 'DatabaseError';
    this.type = type;
    this.originalError = originalError;
  }
}

/**
 * Clase para representar errores de red
 */
class NetworkError extends Error {
  /**
   * Constructor de la clase NetworkError
   * @param {string} message - Mensaje de error
   * @param {object} originalError - Error original de red
   */
  constructor(message, originalError = null) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

// Exportar las clases para poder usarlas en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ErrorHandler,
    ValidationError,
    DatabaseError,
    NetworkError
  };
}

// Exponer en entorno navegador
if (typeof window !== 'undefined') {
  window.ErrorHandler = ErrorHandler;
  window.ValidationError = ValidationError;
  window.DatabaseError = DatabaseError;
  window.NetworkError = NetworkError;
}