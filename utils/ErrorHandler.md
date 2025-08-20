# Clase ErrorHandler

La clase `ErrorHandler` maneja las excepciones y errores en la aplicación, proporcionando mensajes claros para el usuario y registrando información para depuración.

## Propiedades

- `logger`: Instancia del registrador de logs
- `isDevelopment`: Indica si la aplicación está en modo desarrollo

## Métodos

- `constructor()`: Inicializa el manejador de errores
- `handleError(error, context)`: Maneja un error específico
- `handleDatabaseError(error)`: Maneja errores de base de datos
- `handleValidationError(error)`: Maneja errores de validación
- `handleNetworkError(error)`: Maneja errores de red
- `showUserError(message)`: Muestra un error amigable al usuario
- `logError(error, context)`: Registra un error en el sistema
- `formatError(error)`: Formatea un error para mostrarlo
- `getErrorMessage(error)`: Obtiene un mensaje de error descriptivo
- `isOperationalError(error)`: Verifica si un error es operacional
- `sendErrorReport(error, context)`: Envía reporte de error (opcional)

## Ejemplo de Uso

```javascript
const errorHandler = new ErrorHandler();

try {
  // Código que puede generar un error
  await database.executeQuery(query, params);
} catch (error) {
  errorHandler.handleError(error, 'Database query execution');
}
```

## Características

- Manejo de diferentes tipos de errores (base de datos, validación, red, etc.)
- Mensajes amigables para el usuario
- Registro detallado de errores para depuración
- Diferenciación entre errores operacionales y errores de programación
- Integración con sistema de logging
- Prevención de fugas de información sensible en errores