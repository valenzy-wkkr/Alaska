# Clase UserDAO

La clase `UserDAO` (Data Access Object) maneja el acceso a los datos de usuarios en la base de datos, proporcionando una interfaz limpia para las operaciones CRUD.

## Propiedades

- `db`: Instancia de la conexión a la base de datos
- `errorHandler`: Instancia del manejador de errores

## Métodos

- `constructor(databaseConnection)`: Inicializa el DAO con la conexión a la base de datos
- `create(user)`: Crea un nuevo usuario en la base de datos
- `findById(id)`: Busca un usuario por ID
- `findByEmail(email)`: Busca un usuario por email
- `update(id, userData)`: Actualiza un usuario existente
- `delete(id)`: Elimina un usuario
- `findAll()`: Obtiene todos los usuarios
- `authenticate(email, password)`: Autentica un usuario
- `hashPassword(password)`: Hashea una contraseña
- `comparePassword(password, hash)`: Compara una contraseña con su hash
- `mapRowToUser(row)`: Mapea una fila de la base de datos a un objeto User
- `validateUserExists(id)`: Valida que un usuario exista

## Consultas SQL

Las consultas utilizan parámetros para prevenir inyección SQL:

- `INSERT`: `INSERT INTO Users (name, email, username, address, password) VALUES (?, ?, ?, ?, ?)`
- `SELECT`: `SELECT * FROM Users WHERE id = ?`
- `UPDATE`: `UPDATE Users SET name = ?, email = ?, username = ?, address = ? WHERE id = ?`
- `DELETE`: `DELETE FROM Users WHERE id = ?`

## Ejemplo de Uso

```javascript
const db = new DatabaseConnection();
await db.connect();
const userDAO = new UserDAO(db);

// Crear un nuevo usuario
const newUser = new User(null, "Juan Pérez", "juan@example.com", "juanp", "Calle 123", "password123");
const createdUser = await userDAO.create(newUser);

// Buscar un usuario por ID
const user = await userDAO.findById(1);

// Actualizar un usuario
const updatedData = { name: "Juan Pérez López", email: "juanlopez@example.com" };
await userDAO.update(1, updatedData);

await db.disconnect();
```

## Características

- Consultas parametrizadas para prevenir inyección SQL
- Manejo de conexiones a la base de datos
- Mapeo de objetos entre la base de datos y el modelo
- Manejo de errores específico para operaciones de base de datos
- Uso de procedimientos almacenados cuando sea posible