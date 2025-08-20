# Clase Validator

La clase `Validator` maneja las validaciones de datos en todos los puntos de entrada de la aplicación, incluyendo formularios y APIs.

## Propiedades

- `rules`: Reglas de validación definidas
- `errors`: Errores de validación acumulados

## Métodos

- `constructor()`: Inicializa el validador
- `validate(data, rules)`: Valida datos según reglas especificadas
- `validateEmail(email)`: Valida formato de correo electrónico
- `validatePassword(password)`: Valida fortaleza de contraseña
- `validateName(name)`: Valida formato de nombre
- `validateUsername(username)`: Valida formato de nombre de usuario
- `validateAddress(address)`: Valida formato de dirección
- `validateAge(age)`: Valida rango de edad
- `validateWeight(weight)`: Valida rango de peso
- `isRequired(value)`: Verifica si un valor es requerido
- `isLengthValid(value, min, max)`: Verifica longitud de valor
- `isNumeric(value)`: Verifica si un valor es numérico
- `addError(field, message)`: Agrega un error de validación
- `getErrors()`: Obtiene todos los errores de validación
- `clearErrors()`: Limpia los errores de validación
- `isValid()`: Verifica si la validación fue exitosa

## Ejemplo de Uso

```javascript
const validator = new Validator();
const userData = {
  name: "Juan Pérez",
  email: "juan@example.com",
  password: "password123",
  username: "juanp",
  address: "Calle 123"
};

const rules = {
  name: ['required', 'name'],
  email: ['required', 'email'],
  password: ['required', 'password'],
  username: ['required', 'username'],
  address: ['required', 'address']
};

const isValid = validator.validate(userData, rules);
if (!isValid) {
  console.log(validator.getErrors());
}
```

## Características

- Validaciones comunes para datos de usuarios y mascotas
- Extensible para agregar nuevas reglas de validación
- Manejo de errores descriptivos
- Validación en tiempo real para formularios
- Prevención de inyección de datos maliciosos
- Verificación de tipos de datos y límites