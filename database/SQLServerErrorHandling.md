# Manejo de Errores en SQL Server 2019

Este documento describe cómo se manejan los errores específicos de SQL Server 2019 en la aplicación.

## Tipos de Errores Comunes en SQL Server

### 1. Errores de Conexión
- **Error 2**: No se puede abrir la base de datos
- **Error 18456**: Error de inicio de sesión
- **Error 10060**: Tiempo de espera de conexión agotado

### 2. Errores de Integridad
- **Error 2627**: Violación de restricción UNIQUE
- **Error 547**: Violación de restricción FOREIGN KEY
- **Error 2601**: Violación de índice UNIQUE

### 3. Errores de Sintaxis
- **Error 156**: Sintaxis incorrecta cerca de una palabra clave
- **Error 102**: Sintaxis incorrecta cerca de un carácter

### 4. Errores de Permisos
- **Error 229**: Permiso DENY para el objeto
- **Error 230**: Permiso DENY para la columna

### 5. Errores de Recursos
- **Error 17803**: Memoria insuficiente
- **Error 701**: Memoria insuficiente para ejecutar consulta
- **Error 1105**: Espacio insuficiente en disco

## Implementación del Manejo de Errores

### En DatabaseConnection.js
```javascript
class DatabaseConnection {
  constructor() {
    this.connectionString = process.env.DATABASE_URL;
    this.pool = null;
  }
  
  async connect() {
    try {
      this.pool = await sql.connect(this.connectionString);
      console.log('Conexión a base de datos establecida');
    } catch (error) {
      // Manejo específico de errores de conexión
      switch (error.code) {
        case 'ELOGIN':
          throw new DatabaseError('Error de inicio de sesión. Verifique las credenciales.', 'CONNECTION_ERROR');
        case 'ETIMEOUT':
          throw new DatabaseError('Tiempo de espera de conexión agotado.', 'CONNECTION_TIMEOUT');
        case 'ECONNREFUSED':
          throw new DatabaseError('Conexión rechazada. Verifique que el servidor esté disponible.', 'CONNECTION_REFUSED');
        default:
          throw new DatabaseError(`Error de conexión: ${error.message}`, 'CONNECTION_ERROR');
      }
    }
  }
  
  async executeQuery(query, params = []) {
    try {
      const request = this.pool.request();
      
      // Agregar parámetros
      params.forEach((param, index) => {
        request.input(`param${index}`, param);
      });
      
      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      // Manejo específico de errores de SQL Server
      this.handleSQLError(error);
    }
  }
  
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
```

### En ErrorHandler.js
```javascript
class ErrorHandler {
  constructor() {
    this.logger = new Logger('./logs/error.log');
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }
  
  handleError(error, context) {
    // Registrar error
    this.logError(error, context);
    
    // Manejo específico de errores de base de datos
    if (error instanceof DatabaseError) {
      this.handleDatabaseError(error);
    } else if (error instanceof ValidationError) {
      this.handleValidationError(error);
    } else {
      this.handleGenericError(error);
    }
  }
  
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
  
  logError(error, context) {
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
      })
    };
    
    this.logger.error(JSON.stringify(logEntry));
  }
}
```

### En DatabaseError.js (nueva clase)
```javascript
class DatabaseError extends Error {
  constructor(message, type, originalError = null) {
    super(message);
    this.name = 'DatabaseError';
    this.type = type;
    this.originalError = originalError;
    
    // Capturar stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
  }
}
```

## Manejo de Transacciones con Control de Errores

```javascript
class DatabaseConnection {
  async executeTransaction(operations) {
    let transaction;
    
    try {
      // Iniciar transacción
      transaction = new sql.Transaction(this.pool);
      await transaction.begin();
      
      // Ejecutar operaciones
      const results = [];
      for (const operation of operations) {
        const result = await operation(transaction);
        results.push(result);
      }
      
      // Confirmar transacción
      await transaction.commit();
      return results;
      
    } catch (error) {
      // Revertir transacción en caso de error
      if (transaction) {
        try {
          await transaction.rollback();
        } catch (rollbackError) {
          console.error('Error al revertir transacción:', rollbackError);
        }
      }
      
      // Manejar error específico
      this.handleSQLError(error);
    }
  }
}
```

## Recuperación de Errores

### Reintentos Automáticos
```javascript
class DatabaseConnection {
  async executeWithRetry(query, params = [], maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeQuery(query, params);
      } catch (error) {
        lastError = error;
        
        // No reintentar en errores de validación o permisos
        if (error.type === 'SYNTAX_ERROR' || 
            error.type === 'AUTHENTICATION_ERROR' || 
            error.type === 'PERMISSION_DENIED') {
          throw error;
        }
        
        // Esperar antes de reintentar
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    throw lastError;
  }
}
```

## Monitoreo y Alertas

### Sistema de Alertas para Errores Críticos
```javascript
class DatabaseErrorMonitor {
  constructor() {
    this.errorCounts = new Map();
    this.alertThreshold = 10; // Número de errores antes de alertar
    this.timeWindow = 60000; // Ventana de tiempo en ms (1 minuto)
  }
  
  async checkErrorRate(error) {
    const now = Date.now();
    const errorType = error.type || 'UNKNOWN';
    
    // Limpiar errores antiguos
    for (const [key, timestamps] of this.errorCounts.entries()) {
      const filtered = timestamps.filter(time => now - time < this.timeWindow);
      if (filtered.length === 0) {
        this.errorCounts.delete(key);
      } else {
        this.errorCounts.set(key, filtered);
      }
    }
    
    // Registrar error actual
    if (!this.errorCounts.has(errorType)) {
      this.errorCounts.set(errorType, []);
    }
    
    this.errorCounts.get(errorType).push(now);
    
    // Verificar si se debe enviar alerta
    const count = this.errorCounts.get(errorType).length;
    if (count >= this.alertThreshold) {
      await this.sendAlert(errorType, count);
    }
  }
  
  async sendAlert(errorType, count) {
    // Enviar alerta por email, Slack, etc.
    console.warn(`Alerta: ${count} errores de tipo ${errorType} en el último minuto`);
  }
}
```

## Pruebas de Manejo de Errores

### Pruebas Unitarias para Errores de Base de Datos
```javascript
// test/databaseErrorHandling.test.js
describe('Manejo de Errores de Base de Datos', () => {
  test('debe manejar errores de conexión', async () => {
    const db = new DatabaseConnection();
    
    // Simular error de conexión
    jest.spyOn(sql, 'connect').mockRejectedValue({ code: 'ELOGIN' });
    
    await expect(db.connect()).rejects.toThrow('Error de inicio de sesión');
  });
  
  test('debe manejar violaciones de restricción única', async () => {
    const db = new DatabaseConnection();
    
    // Simular error de violación de restricción única
    jest.spyOn(db.pool, 'request').mockRejectedValue({ number: 2627 });
    
    await expect(db.executeQuery('INSERT INTO Users...')).rejects.toThrow('Ya existe un registro con este valor único');
  });
});
```

## Mejores Prácticas

1. **Validación Previa**: Validar datos antes de enviarlos a la base de datos
2. **Consultas Parametrizadas**: Siempre usar parámetros para prevenir inyección SQL
3. **Manejo de Transacciones**: Usar transacciones para operaciones múltiples
4. **Reintentos Inteligentes**: Reintentar operaciones en errores transitorios
5. **Logging Detallado**: Registrar información suficiente para depuración
6. **Mensajes Amigables**: Mostrar mensajes comprensibles al usuario
7. **Monitoreo Continuo**: Implementar alertas para errores frecuentes
8. **Pruebas Exhaustivas**: Probar todos los escenarios de error posibles

Este enfoque integral para el manejo de errores en SQL Server 2019 garantiza que la aplicación sea robusta y pueda manejar adecuadamente cualquier problema que pueda surgir con la base de datos.