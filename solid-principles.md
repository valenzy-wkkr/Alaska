# Aplicación de Principios SOLID

Este documento describe cómo se aplican los principios SOLID en el diseño del sistema de cuidado de mascotas.

## Principio de Responsabilidad Única (SRP)

Cada clase tiene una única razón para cambiar:

### Modelos (models/)
- `User.js`: Solo se encarga de representar la entidad usuario
- `Pet.js`: Solo se encarga de representar la entidad mascota

### Controladores (controllers/)
- `UserController.js`: Solo se encarga de la lógica de usuarios
- `PetController.js`: Solo se encarga de la lógica de mascotas

### Vistas (views/)
- `MenuView.js`: Solo se encarga de la funcionalidad del menú
- `ButtonView.js`: Solo se encarga de la funcionalidad de botones
- `FormView.js`: Solo se encarga de la funcionalidad de formularios

### Acceso a Datos (database/)
- `UserDAO.js`: Solo se encarga del acceso a datos de usuarios
- `PetDAO.js`: Solo se encarga del acceso a datos de mascotas

### Utilidades (utils/)
- `Validator.js`: Solo se encarga de validaciones
- `ErrorHandler.js`: Solo se encarga del manejo de errores
- `Logger.js`: Solo se encarga del registro de logs

## Principio de Abierto/Cerrado (OCP)

El sistema está diseñado para ser abierto a extensiones pero cerrado a modificaciones:

### Ejemplo de extensión:
```javascript
// Se puede extender fácilmente con nuevos tipos de validación
class CustomValidator extends Validator {
  validateCustomField(value) {
    // Lógica de validación personalizada
    return true;
  }
}

// Se puede extender con nuevos tipos de errores
class CustomError extends Error {
  constructor(message) {
    super(message);
    this.name = "CustomError";
  }
}
```

### Ejemplo de uso:
```javascript
// El controlador puede trabajar con cualquier implementación de DAO
class GenericController {
  constructor(dataAccessObject) {
    this.dao = dataAccessObject;
  }
  
  // Este método no necesita modificarse si se cambia el DAO
  async create(item) {
    return await this.dao.create(item);
  }
}
```

## Principio de Sustitución de Liskov (LSP)

Las clases derivadas pueden sustituir a sus clases base sin alterar el comportamiento esperado:

### Ejemplo:
```javascript
// Clase base
class BaseDAO {
  async create(item) {
    throw new Error("Método no implementado");
  }
}

// Implementación concreta
class UserDAO extends BaseDAO {
  async create(user) {
    // Implementación específica para usuarios
    return await database.executeStoredProcedure('CreateUser', user);
  }
}

class PetDAO extends BaseDAO {
  async create(pet) {
    // Implementación específica para mascotas
    return await database.executeStoredProcedure('CreatePet', pet);
  }
}

// Ambas pueden ser usadas indistintamente
const userDAO = new UserDAO();
const petDAO = new PetDAO();

// Ambos cumplen con el contrato de BaseDAO
const user = await userDAO.create(userData);
const pet = await petDAO.create(petData);
```

## Principio de Segregación de Interfaces (ISP)

Interfaces específicas son mejores que interfaces generales:

### Ejemplo de interfaces específicas:
```javascript
// Interfaz para validación
interface ValidationInterface {
  validate(data);
  getErrors();
}

// Interfaz para acceso a datos
interface DataAccessInterface {
  create(item);
  findById(id);
  update(id, item);
  delete(id);
}

// Clase que implementa solo lo necesario
class UserValidator implements ValidationInterface {
  validate(userData) {
    // Solo implementa validación de usuarios
  }
}

class UserDAO implements DataAccessInterface {
  create(user) {
    // Solo implementa operaciones de usuarios
  }
}
```

## Principio de Inversión de Dependencias (DIP)

Depender de abstracciones, no de implementaciones concretas:

### Ejemplo de inversión de dependencias:
```javascript
// Dependiendo de una interfaz (abstracción)
class UserController {
  constructor(userDAO) {
    this.userDAO = userDAO; // Inyección de dependencia
  }
  
  async createUser(userData) {
    // No depende de una implementación concreta
    return await this.userDAO.create(userData);
  }
}

// Se puede inyectar cualquier implementación que cumpla con la interfaz
const userDAO = new UserDAO(databaseConnection);
const userController = new UserController(userDAO);

// También se puede usar un mock para pruebas
const mockUserDAO = new MockUserDAO();
const testUserController = new UserController(mockUserDAO);
```

## Beneficios de aplicar SOLID

1. **Mantenibilidad**: Cambios en una clase no afectan a otras
2. **Testabilidad**: Facilita la creación de pruebas unitarias
3. **Reutilización**: Componentes pueden ser reutilizados fácilmente
4. **Escalabilidad**: El sistema puede crecer sin romper funcionalidades existentes
5. **Claridad**: Código más fácil de entender y mantener
6. **Flexibilidad**: Fácil de extender con nuevas funcionalidades

## Aplicación práctica en el proyecto

### En el controlador de usuarios:
```javascript
class UserController {
  constructor(userDAO, validator, errorHandler) {
    // Inyección de dependencias
    this.userDAO = userDAO;
    this.validator = validator;
    this.errorHandler = errorHandler;
  }
  
  // Cada método tiene una única responsabilidad
  async createUser(userData) {
    // Validación
    // Procesamiento
    // Acceso a datos
    // Manejo de errores
  }
}
```

### En el controlador de mascotas:
```javascript
class PetController {
  constructor(petDAO, validator, errorHandler) {
    // Inyección de dependencias
    this.petDAO = petDAO;
    this.validator = validator;
    this.errorHandler = errorHandler;
  }
  
  // Cada método tiene una única responsabilidad
  async createPet(petData) {
    // Validación
    // Procesamiento
    // Acceso a datos
    // Manejo de errores
  }
}
```

Este enfoque permite que cada clase sea fácil de mantener, testear y extender sin afectar al resto del sistema.