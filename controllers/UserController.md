# Clase UserController

La clase `UserController` maneja las operaciones CRUD para usuarios, actuando como intermediario entre la vista y el modelo.

## Propiedades

- `userDAO`: Instancia del objeto de acceso a datos de usuarios
- `validator`: Instancia del validador de datos
- `errorHandler`: Instancia del manejador de errores

## Métodos

- `constructor()`: Inicializa el controlador
- `createUser(userData)`: Crea un nuevo usuario
- `getUserById(id)`: Obtiene un usuario por ID
- `getUserByEmail(email)`: Obtiene un usuario por email
- `updateUser(id, userData)`: Actualiza un usuario existente
- `deleteUser(id)`: Elimina un usuario
- `getAllUsers()`: Obtiene todos los usuarios
- `authenticateUser(email, password)`: Autentica un usuario
- `validateUserData(userData)`: Valida los datos de un usuario
- `hashUserPassword(password)`: Hashea la contraseña de un usuario
- `handleCreateUser(request, response)`: Maneja la solicitud de creación de usuario
- `handleGetUser(request, response)`: Maneja la solicitud de obtención de usuario
- `handleUpdateUser(request, response)`: Maneja la solicitud de actualización de usuario
- `handleDeleteUser(request, response)`: Maneja la solicitud de eliminación de usuario

## Ejemplo de Uso

```javascript
const userController = new UserController();

// Crear un nuevo usuario
const newUser = {
  name: "Juan Pérez",
  email: "juan@example.com",
  username: "juanp",
  address: "Calle 123",
  password: "password123"
};

userController.createUser(newUser)
  .then(result => console.log('Usuario creado:', result))
  .catch(error => console.error('Error al crear usuario:', error));
```

## Características

- Implementación completa de operaciones CRUD
- Validación de datos antes de operaciones
- Manejo seguro de contraseñas
- Integración con capa de acceso a datos
- Manejo de errores robusto
- Seguimiento de principios SOLID