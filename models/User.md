# Clase User

La clase `User` representa un usuario en el sistema de cuidado de mascotas.

## Propiedades

- `id`: Identificador único del usuario
- `name`: Nombre completo del usuario
- `email`: Correo electrónico del usuario
- `username`: Nombre de usuario
- `address`: Dirección del usuario
- `password`: Contraseña del usuario (almacenada de forma segura)

## Métodos

- `constructor(id, name, email, username, address, password)`: Inicializa un nuevo usuario
- `validate()`: Valida los datos del usuario
- `hashPassword()`: Hashea la contraseña del usuario
- `toJSON()`: Convierte el objeto a formato JSON para su serialización

## Ejemplo de Uso

```javascript
const user = new User(1, "Juan Pérez", "juan@example.com", "juanp", "Calle 123", "password123");
user.validate(); // Valida los datos del usuario
user.hashPassword(); // Hashea la contraseña
console.log(user.toJSON()); // Muestra el usuario en formato JSON