# Clase PetDAO

La clase `PetDAO` (Data Access Object) maneja el acceso a los datos de mascotas en la base de datos, proporcionando una interfaz limpia para las operaciones CRUD.

## Propiedades

- `db`: Instancia de la conexión a la base de datos
- `errorHandler`: Instancia del manejador de errores

## Métodos

- `constructor(databaseConnection)`: Inicializa el DAO con la conexión a la base de datos
- `create(pet)`: Crea una nueva mascota en la base de datos
- `findById(id)`: Busca una mascota por ID
- `findByUserId(userId)`: Busca todas las mascotas de un usuario
- `update(id, petData)`: Actualiza una mascota existente
- `delete(id)`: Elimina una mascota
- `findAll()`: Obtiene todas las mascotas
- `mapRowToPet(row)`: Mapea una fila de la base de datos a un objeto Pet
- `validatePetExists(id)`: Valida que una mascota exista
- `validateUserOwnsPet(petId, userId)`: Valida que un usuario sea dueño de una mascota

## Consultas SQL

Las consultas utilizan parámetros para prevenir inyección SQL:

- `INSERT`: `INSERT INTO Pets (name, species, breed, age, weight, userId) VALUES (?, ?, ?, ?, ?, ?)`
- `SELECT`: `SELECT * FROM Pets WHERE id = ?`
- `SELECT by user`: `SELECT * FROM Pets WHERE userId = ?`
- `UPDATE`: `UPDATE Pets SET name = ?, species = ?, breed = ?, age = ?, weight = ? WHERE id = ?`
- `DELETE`: `DELETE FROM Pets WHERE id = ?`

## Ejemplo de Uso

```javascript
const db = new DatabaseConnection();
await db.connect();
const petDAO = new PetDAO(db);

// Crear una nueva mascota
const newPet = new Pet(null, "Firulais", "perro", "Labrador", 3, 25.5, 1);
const createdPet = await petDAO.create(newPet);

// Buscar una mascota por ID
const pet = await petDAO.findById(1);

// Buscar todas las mascotas de un usuario
const userPets = await petDAO.findByUserId(1);

// Actualizar una mascota
const updatedData = { name: "Firulais López", age: 4 };
await petDAO.update(1, updatedData);

await db.disconnect();
```

## Características

- Consultas parametrizadas para prevenir inyección SQL
- Manejo de conexiones a la base de datos
- Mapeo de objetos entre la base de datos y el modelo
- Manejo de errores específico para operaciones de base de datos
- Validación de propiedad de mascotas por usuarios
- Uso de procedimientos almacenados cuando sea posible