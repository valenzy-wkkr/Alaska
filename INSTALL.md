# Instrucciones de Instalación

## Requisitos del Sistema

- Node.js >= 14.0.0
- SQL Server 2019
- npm >= 6.0.0

## Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/alaska-pets.git
cd alaska-pets
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto con el siguiente contenido:

`
``env
# Configuración de base de datos
DB_SERVER=localhost
DB_NAME=AlaskaPets
DB_USER=sa
DB_PASSWORD=TuContraseñaSegura123

# Configuración de aplicación
NODE_ENV=development
PORT=3000
LOG_LEVEL=INFO
LOG_FILE=./logs/app.log

# Configuración de seguridad
JWT_SECRET=secreto_jwt_por_defecto
JWT_EXPIRATION=24h
BCRYPT_ROUNDS=10
``

Ajustar los valores según tu configuración local.

### 4. Crear la Base de Datos

#### 4.1. Ejecutar Scripts SQL

1. Abrir SQL Server Management Studio (SSMS)
2. Conectarse al servidor de base de datos
3. Ejecutar los siguientes scripts en orden:
   - `database/scripts/create-database.sql`
   - `database/scripts/stored-procedures.sql`
   - `database/scripts/seed-data.sql` (opcional, para datos de prueba)

#### 4.2. Configurar Permisos

Asegurarse de que el usuario especificado en las variables de entorno tenga permisos para:
- Crear y modificar tablas
- Ejecutar procedimientos almacenados
- Insertar, actualizar y eliminar datos

### 5. Crear Directorio de Logs

```bash
mkdir logs
```

### 6. Iniciar la Aplicación

#### Modo Desarrollo

```bash
npm run dev
```

#### Modo Producción

```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
alaska-pets/
├── models/                 # Modelos de datos
├── controllers/            # Controladores
├── views/                  # Vistas y componentes frontend
├── database/               # Acceso a datos y conexión
├── utils/                  # Utilidades comunes
├── config/                 # Configuración de la aplicación
├── public/                 # Archivos estáticos
├── logs/                   # Archivos de registro
├── __tests__/              # Pruebas unitarias
├── database/scripts/       # Scripts de base de datos
├── app.js                  # Archivo principal de la aplicación
├── server.js               # Servidor Express
├── package.json            # Dependencias y scripts
├── .env                    # Variables de entorno
└── .gitignore              # Archivos ignorados por Git
```

## Scripts Disponibles

- `npm start`: Inicia la aplicación en modo producción
- `npm run dev`: Inicia la aplicación en modo desarrollo con nodemon
- `npm test`: Ejecuta las pruebas unitarias
- `npm run test:watch`: Ejecuta las pruebas en modo watch

## Configuración Adicional

### Configuración de Logs

Los logs se guardan en el directorio `logs/`. Se puede configurar:
- `LOG_LEVEL`: Nivel de log (ERROR, WARN, INFO, DEBUG)
- `LOG_FILE`: Ruta al archivo de logs
- `LOG_MAX_SIZE`: Tamaño máximo de archivo de logs
- `LOG_MAX_FILES`: Número máximo de archivos de logs

### Configuración de Seguridad

- `JWT_SECRET`: Secreto para firmar tokens JWT
- `JWT_EXPIRATION`: Tiempo de expiración de tokens
- `BCRYPT_ROUNDS`: Número de rondas para hashear contraseñas

## Resolución de Problemas

### Error de Conexión a Base de Datos

1. Verificar que SQL Server esté corriendo
2. Verificar los parámetros de conexión en `.env`
3. Verificar que el usuario tenga permisos adecuados

### Error al Iniciar la Aplicación

1. Verificar que todas las dependencias estén instaladas
2. Verificar que el puerto no esté en uso
3. Verificar los permisos del directorio de logs

### Problemas con los Scripts SQL

1. Asegurarse de ejecutar los scripts en el orden correcto
2. Verificar que se tenga permisos suficientes en SQL Server
3. Revisar los mensajes de error específicos de SQL Server

## Mantenimiento

### Actualización de Dependencias

```bash
npm update
```

### Ejecución de Pruebas

```bash
npm test
```

### Limpieza de Logs

Los archivos de logs se rotan automáticamente cuando alcanzan el tamaño máximo configurado.

## Soporte

Para soporte adicional, contactar al equipo de desarrollo o crear un issue en el repositorio.