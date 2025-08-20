/**
 * Clase para manejar la conexión a la base de datos SQL Server 2019
 * Proporciona métodos para conectarse, ejecutar consultas y procedimientos almacenados
 */
class DatabaseConnection {
  /**
   * Constructor de la clase DatabaseConnection
   * Inicializa la cadena de conexión desde variables de entorno
   */
  constructor() {
    // En una implementación real, estos valores vendrían de variables de entorno
    this.config = {
      server: process.env.DB_SERVER || 'localhost',
      database: process.env.DB_NAME || 'AlaskaPets',
      user: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'TuContraseñaSegura123',
      options: {
        encrypt: true, // Usar en producción
        trustServerCertificate: true // Solo para desarrollo
      }
    };
    
    this.pool = null;
    this.isConnected = false;
  }

  /**
   * Establece la conexión con la base de datos
   * @returns {Promise<void>}
   */
  async connect() {
    try {
      // En una implementación real, se usaría:
      // this.pool = await sql.connect(this.config);
      
      // Para este ejemplo, simulamos la conexión
      console.log('Conectando a SQL Server 2019...');
      console.log(`Servidor: ${this.config.server}`);
      console.log(`Base de datos: ${this.config.database}`);
      console.log(`Usuario: ${this.config.user}`);
      
      // Simular un retraso de conexión
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.isConnected = true;
      console.log('Conexión a base de datos establecida');
    } catch (error) {
      console.error('Error al conectar a la base de datos:', error);
      throw new DatabaseError('No se pudo establecer la conexión con la base de datos', 'CONNECTION_ERROR', error);
    }
  }

  /**
   * Cierra la conexión con la base de datos
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      if (this.pool) {
        await this.pool.close();
        this.isConnected = false;
        console.log('Conexión a base de datos cerrada');
      }
    } catch (error) {
      console.error('Error al cerrar la conexión a la base de datos:', error);
      throw new DatabaseError('Error al cerrar la conexión con la base de datos', 'DISCONNECTION_ERROR', error);
    }
  }

  /**
   * Ejecuta una consulta SQL con parámetros
   * @param {string} query - La consulta SQL a ejecutar
   * @param {object} params - Los parámetros para la consulta
   * @returns {Promise<Array>} - Los resultados de la consulta
   */
  async executeQuery(query, params = {}) {
    if (!this.isConnected) {
      throw new DatabaseError('No hay conexión establecida con la base de datos', 'NO_CONNECTION');
    }

    try {
      console.log('Ejecutando consulta:', query);
      console.log('Con parámetros:', params);
      
      // En una implementación real, se usaría:
      // const request = this.pool.request();
      // Object.keys(params).forEach(key => {
      //   request.input(key, params[key]);
      // });
      // const result = await request.query(query);
      // return result.recordset;
      
      // Para este ejemplo, simulamos resultados
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simular diferentes tipos de consultas
      if (query.toLowerCase().includes('insert')) {
        return [{ id: Math.floor(Math.random() * 1000) + 1 }];
      } else if (query.toLowerCase().includes('select')) {
        // Simular datos de usuarios o mascotas
        if (query.toLowerCase().includes('users')) {
          return [
            { id: 1, name: 'Juan Pérez', email: 'juan@example.com', username: 'juanp', address: 'Calle 123' },
            { id: 2, name: 'María García', email: 'maria@example.com', username: 'mariag', address: 'Avenida 456' }
          ];
        } else if (query.toLowerCase().includes('pets')) {
          return [
            { id: 1, name: 'Firulais', species: 'perro', breed: 'Labrador', age: 3, weight: 25.5, userId: 1 },
            { id: 2, name: 'Mishi', species: 'gato', breed: 'Siames', age: 2, weight: 4.2, userId: 2 }
          ];
        }
        return [];
      } else {
        return { rowsAffected: [1] };
      }
    } catch (error) {
      console.error('Error al ejecutar consulta:', error);
      this.handleSQLError(error);
    }
  }

  /**
   * Ejecuta un procedimiento almacenado con parámetros
   * @param {string} procedureName - El nombre del procedimiento almacenado
   * @param {object} params - Los parámetros para el procedimiento
   * @returns {Promise<Array>} - Los resultados del procedimiento
   */
  async executeStoredProcedure(procedureName, params = {}) {
    if (!this.isConnected) {
      throw new DatabaseError('No hay conexión establecida con la base de datos', 'NO_CONNECTION');
    }

    try {
      console.log('Ejecutando procedimiento almacenado:', procedureName);
      console.log('Con parámetros:', params);
      
      // En una implementación real, se usaría:
      // const request = this.pool.request();
      // Object.keys(params).forEach(key => {
      //   request.input(key, params[key]);
      // });
      // const result = await request.execute(procedureName);
      // return result.recordset;
      
      // Para este ejemplo, simulamos resultados
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simular resultados de diferentes procedimientos
      switch (procedureName) {
        case 'CreateUser':
          return [{ UserId: Math.floor(Math.random() * 1000) + 1 }];
        case 'GetUserById':
          return [{ id: params.userId, name: 'Juan Pérez', email: 'juan@example.com', username: 'juanp', address: 'Calle 123' }];
        case 'GetUserByEmail':
          return [{ id: 1, name: 'Juan Pérez', email: params.email, username: 'juanp', address: 'Calle 123' }];
        case 'UpdateUser':
          return [{ RowsAffected: 1 }];
        case 'DeleteUser':
          return [{ RowsAffected: 1 }];
        case 'AuthenticateUser':
          // Simular autenticación exitosa
          return [{ id: 1, name: 'Juan Pérez', email: params.email, username: 'juanp', address: 'Calle 123' }];
        case 'CreatePet':
          return [{ PetId: Math.floor(Math.random() * 1000) + 1 }];
        case 'GetPetById':
          return [{ id: params.petId, name: 'Firulais', species: 'perro', breed: 'Labrador', age: 3, weight: 25.5, userId: 1 }];
        case 'GetPetsByUserId':
          return [
            { id: 1, name: 'Firulais', species: 'perro', breed: 'Labrador', age: 3, weight: 25.5, userId: params.userId },
            { id: 2, name: 'Mishi', species: 'gato', breed: 'Siames', age: 2, weight: 4.2, userId: params.userId }
          ];
        case 'UpdatePet':
          return [{ RowsAffected: 1 }];
        case 'DeletePet':
          return [{ RowsAffected: 1 }];
        default:
          return [];
      }
    } catch (error) {
      console.error('Error al ejecutar procedimiento almacenado:', error);
      this.handleSQLError(error);
    }
  }

  /**
   * Maneja errores específicos de SQL Server
   * @param {object} error - El error ocurrido
   */
  handleSQLError(error) {
    // Mapeo de códigos de error de SQL Server
    const errorMap = {
      2627: 'VIOLATION_UNIQUE_CONSTRAINT',
      2601: 'VIOLATION_UNIQUE_INDEX',
      547: 'VIOLATION_FOREIGN_KEY',
      156: 'SYNTAX_ERROR',
      102: 'SYNTAX_ERROR',
      18456: 'LOGIN_ERROR',
      229: 'PERMISSION_DENIED',
      230: 'PERMISSION_DENIED_COLUMN'
    };
    
    const errorCode = error.number || error.code;
    const errorType = errorMap[errorCode] || 'DATABASE_ERROR';
    
    switch (errorCode) {
      case 2627:
      case 2601:
        throw new DatabaseError('Ya existe un registro con este valor único.', 'DUPLICATE_ENTRY', error);
        
      case 547:
        throw new DatabaseError('No se puede realizar la operación debido a una restricción de integridad.', 'INTEGRITY_CONSTRAINT_VIOLATION', error);
        
      case 156:
      case 102:
        throw new DatabaseError('Error de sintaxis en la consulta SQL.', 'SYNTAX_ERROR', error);
        
      case 18456:
        throw new DatabaseError('Error de autenticación. Verifique las credenciales.', 'AUTHENTICATION_ERROR', error);
        
      case 229:
      case 230:
        throw new DatabaseError('Permisos insuficientes para realizar esta operación.', 'PERMISSION_DENIED', error);
        
      default:
        throw new DatabaseError(`Error de base de datos: ${error.message}`, errorType, error);
    }
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

// Exportar las clases para poder usarlas en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DatabaseConnection, DatabaseError };
}