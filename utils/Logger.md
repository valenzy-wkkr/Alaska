# Clase Logger

La clase `Logger` maneja el registro de logs de errores en un archivo o base de datos para depuración y monitoreo.

## Propiedades

- `logFile`: Ruta al archivo de logs
- `maxFileSize`: Tamaño máximo del archivo de logs
- `currentLogLevel`: Nivel actual de logging

## Métodos

- `constructor(logFile)`: Inicializa el registrador con archivo de destino
- `log(message, level, context)`: Registra un mensaje con nivel y contexto
- `error(message, context)`: Registra un error
- `warn(message, context)`: Registra una advertencia
- `info(message, context)`: Registra información
- `debug(message, context)`: Registra mensaje de depuración
- `rotateLogFile()`: Rota el archivo de logs cuando alcanza el tamaño máximo
- `formatLogEntry(message, level, timestamp, context)`: Formatea una entrada de log
- `writeToFile(entry)`: Escribe una entrada en el archivo de logs
- `sendToDatabase(entry)`: Envía una entrada a la base de datos (opcional)
- `setLogLevel(level)`: Establece el nivel de logging
- `shouldLog(level)`: Verifica si un mensaje debería ser registrado según su nivel

## Niveles de Log

- `ERROR`: Errores críticos que detienen la ejecución
- `WARN`: Advertencias que no detienen la ejecución
- `INFO`: Información general sobre el funcionamiento
- `DEBUG`: Información detallada para depuración

## Ejemplo de Uso

```javascript
const logger = new Logger('./logs/app.log');

logger.info('Application started', 'Startup');
logger.warn('Deprecated function used', 'API');
logger.error('Database connection failed', 'Database');
logger.debug('User data validation passed', 'Validation');
```

## Características

- Registro de logs en archivo con rotación automática
- Diferentes niveles de log para filtrar información
- Formato consistente de entradas de log
- Timestamps precisos para cada entrada
- Contexto adicional para facilitar la depuración
- Manejo seguro de escritura en archivos