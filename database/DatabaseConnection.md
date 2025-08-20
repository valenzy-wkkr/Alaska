# Clase DatabaseConnection

La clase `DatabaseConnection` maneja la conexión reutilizable a SQL Server 2019, siguiendo principios de seguridad y buenas prácticas.

## Propiedades

- `connectionString`: Cadena de conexión a la base de datos
- `pool`: Pool de conexiones para reutilización
- `config`: Configuración de la conexión

## Métodos

- `constructor()`: Inicializa la configuración de conexión
- `connect()`: Establece una conexión a la base de datos
- `disconnect()`: Cierra la conexión a la base de datos
- `executeQuery(query, params)`: Ejecuta una consulta con parámetros
- `executeStoredProcedure(procName, params)`: Ejecuta un procedimiento almacenado
- `beginTransaction()`: Inicia una transacción
- `commitTransaction()`: Confirma una transacción
- `rollbackTransaction()`: Revierte una transacción
- `handleError(error)`: Maneja errores de conexión

## Configuración

La clase utiliza variables de entorno para la configuración:
- `DB_SERVER`: Servidor de la base de datos
- `DB_NAME`: Nombre de la base de datos
- `DB_USER`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña de la base de datos

## Ejemplo de Uso

```javascript
const db = new DatabaseConnection();
await db.connect(); // Establece conexión
const result = await db.executeQuery('SELECT * FROM Users WHERE id = ?', [1]);
await db.disconnect(); // Cierra conexión
```

## Características

- Conexión segura con SQL Server 2019
- Uso de pool de conexiones para mejor rendimiento
- Manejo de transacciones para operaciones ACID
- Prevención de inyección SQL mediante consultas parametrizadas
- Manejo de errores robusto con logging
- Reutilización de conexiones para eficiencia