# Integración de Validaciones y Conexión a Base de Datos

Este documento describe cómo se integran las validaciones de datos y la conexión a la base de datos en la aplicación.

## Flujo de Validación

1. **Entrada de datos**: Los datos ingresan a través de formularios en la interfaz
2. **Validación en frontend**: La clase `FormView` utiliza `Validator` para validar datos en tiempo real
3. **Envío al controlador**: Si la validación frontend es exitosa, los datos se envían al controlador
4. **Validación en backend**: El controlador utiliza `Validator` nuevamente para validar datos
5. **Procesamiento seguro**: Los datos validados se procesan y envían a la base de datos

## Integración de Validaciones

### En FormView
```javascript
class FormView {
  constructor(formElement) {
    this.form = formElement;
    this.validator = new Validator();
    this.init();
  }
  
  init() {
    // Agregar validación en tiempo real
    this.form.addEventListener('input', (event) => {
      this.validateField(event.target);
    });
    
    // Validación completa al enviar
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.handleSubmission(event);
    });
  }
  
  validateField(field) {
    const fieldName = field.name;
    const fieldValue = field.value;
    const isValid = this.validator.validateField(fieldName, fieldValue);
    
    if (!isValid) {
      const errors = this.validator.getErrors();
      this.showFieldError(field, errors[fieldName]);
    } else {
      this.clearFieldError(field);
    }
  }
  
  async handleSubmission(event) {
    // Validar todo el formulario
    const formData = this.collectFormData();
    const isValid = this.validator.validate(formData, this.getValidationRules());
    
    if (isValid) {
      // Enviar datos al controlador
      await this.submitForm(formData);
    } else {
      // Mostrar errores
      this.showFormErrors(this.validator.getErrors());
    }
  }
}
```

### En UserController
```javascript
class UserController {
  constructor() {
    this.validator = new Validator();
    this.userDAO = new UserDAO(new DatabaseConnection());
    this.errorHandler = new ErrorHandler();
  }
  
  async createUser(userData) {
    try {
      // Validar datos
      const isValid = this.validator.validate(userData, this.getUserValidationRules());
      
      if (!isValid) {
        throw new ValidationError(this.validator.getErrors());
      }
      
      // Hashear contraseña
      userData.password = await this.hashUserPassword(userData.password);
      
      // Crear usuario en base de datos
      const createdUser = await this.userDAO.create(userData);
      
      return createdUser;
    } catch (error) {
      this.errorHandler.handleError(error, 'User creation');
      throw error;
    }
  }
}
```

## Integración con Base de Datos

### En DatabaseConnection
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
      console.error('Error al conectar a la base de datos:', error);
      throw error;
    }
  }
  
  async executeQuery(query, params = []) {
    try {
      const request = this.pool.request();
      
      // Agregar parámetros para prevenir inyección SQL
      params.forEach((param, index) => {
        request.input(`param${index}`, param);
      });
      
      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      console.error('Error al ejecutar consulta:', error);
      throw error;
    }
  }
  
  async executeStoredProcedure(procName, params = {}) {
    try {
      const request = this.pool.request();
      
      // Agregar parámetros
      Object.keys(params).forEach(key => {
        request.input(key, params[key]);
      });
      
      const result = await request.execute(procName);
      return result.recordset;
    } catch (error) {
      console.error('Error al ejecutar procedimiento almacenado:', error);
      throw error;
    }
  }
}
```

### En UserDAO
```javascript
class UserDAO {
  constructor(databaseConnection) {
    this.db = databaseConnection;
    this.errorHandler = new ErrorHandler();
  }
  
  async create(user) {
    try {
      const query = `
        INSERT INTO Users (name, email, username, address, password)
        VALUES (@name, @email, @username, @address, @password);
        SELECT SCOPE_IDENTITY() AS id;
      `;
      
      const params = {
        name: user.name,
        email: user.email,
        username: user.username,
        address: user.address,
        password: user.password
      };
      
      const result = await this.db.executeStoredProcedure('CreateUser', params);
      user.id = result[0].id;
      
      return user;
    } catch (error) {
      this.errorHandler.handleDatabaseError(error);
      throw error;
    }
  }
  
  async findById(id) {
    try {
      const params = { userId: id };
      const result = await this.db.executeStoredProcedure('GetUserById', params);
      
      if (result.length === 0) {
        return null;
      }
      
      return this.mapRowToUser(result[0]);
    } catch (error) {
      this.errorHandler.handleDatabaseError(error);
      throw error;
    }
  }
}
```

## Manejo de Errores

### En ErrorHandler
```javascript
class ErrorHandler {
  constructor() {
    this.logger = new Logger('./logs/error.log');
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }
  
  handleError(error, context) {
    // Registrar error
    this.logError(error, context);
    
    // Mostrar mensaje amigable al usuario
    if (error instanceof ValidationError) {
      this.showUserError('Por favor, verifica que todos los campos estén correctamente llenados.');
    } else if (error instanceof DatabaseError) {
      this.showUserError('Hubo un problema con la base de datos. Por favor, inténtalo de nuevo más tarde.');
    } else {
      this.showUserError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
    }
    
    // Enviar reporte de error en modo desarrollo
    if (this.isDevelopment) {
      console.error('Error detallado:', error);
    }
  }
  
  logError(error, context) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      context: context,
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    };
    
    this.logger.error(JSON.stringify(logEntry));
  }
}
```

## Beneficios de esta Integración

1. **Seguridad**: Validaciones en múltiples capas previenen datos maliciosos
2. **Consistencia**: Validaciones uniformes en toda la aplicación
3. **Mantenibilidad**: Código modular y fácil de actualizar
4. **Escalabilidad**: Arquitectura que permite crecer sin problemas
5. **Experiencia de usuario**: Retroalimentación inmediata sobre errores
6. **Depuración**: Sistema de logs para identificar problemas rápidamente