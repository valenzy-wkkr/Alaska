# Guía de Instalación y Configuración

Esta guía describe los pasos necesarios para instalar y configurar la aplicación de cuidado de mascotas.

## Requisitos del Sistema

### Software requerido:
- Node.js (versión 14 o superior)
- SQL Server 2019
- npm (administrador de paquetes de Node.js)
- Git (opcional, para control de versiones)

### Dependencias del proyecto:
- sql-server (para conexión a SQL Server)
- express (para el servidor web)
- dotenv (para variables de entorno)
- bcrypt (para hashing de contraseñas)

## Pasos de Instalación

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd Alaska-1
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear un archivo `.env` en la raíz del proyecto con la siguiente configuración:

```env
# Configuración de base de datos
DB_SERVER=localhost
DB_NAME=AlaskaPets
DB_USER=sa
DB_PASSWORD=TuContraseñaSegura123

# Configuración de aplicación
NODE_ENV=development
PORT=3000
```

### 4. Crear la base de datos
Ejecutar los scripts SQL proporcionados para crear la estructura de la base de datos:

```sql
-- Ejecutar el script de creación de tablas
-- El script se encuentra en database/DatabaseSchema.sql
```

### 5. Crear procedimientos almacenados
Ejecutar los scripts SQL para crear los procedimientos almacenados:

```sql
-- Ejecutar el script de creación de procedimientos almacenados
-- El script se encuentra en database/StoredProcedures.sql
```

## Estructura del Proyecto

```
Alaska-1/
├── models/              # Modelos de datos
│   ├── User.js
│   └── Pet.js
├── controllers/         # Controladores
│   ├── UserController.js
│   └── PetController.js
├── views/               # Vistas y componentes de UI
│   ├── MenuView.js
│   ├── ButtonView.js
│   └── FormView.js
├── database/            # Acceso a datos y conexión
│   ├── DatabaseConnection.js
│   ├── UserDAO.js
│   └── PetDAO.js
├── utils/               # Utilidades
│   ├── Validator.js
│   ├── ErrorHandler.js
│   └── Logger.js
├── public/              # Archivos estáticos
│   ├── css/
│   ├── js/
│   └── images/
├── routes/              # Rutas de la aplicación
├── config/              # Configuración
└── .env                 # Variables de entorno
```

## Configuración de Base de Datos

### Creación de la base de datos
1. Abrir SQL Server Management Studio (SSMS)
2. Conectarse al servidor SQL Server
3. Ejecutar el script de creación de base de datos:
```sql
CREATE DATABASE AlaskaPets;
GO
USE AlaskaPets;
GO
-- Ejecutar el script de creación de tablas y procedimientos almacenados
```

### Configuración de usuarios
Crear un usuario específico para la aplicación:
```sql
CREATE LOGIN AlaskaAppUser WITH PASSWORD = 'TuContraseñaSegura123';
CREATE USER AlaskaAppUser FOR LOGIN AlaskaAppUser;
GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::dbo TO AlaskaAppUser;
```

## Ejecución de la Aplicación

### Modo de desarrollo
```bash
npm run dev
```

### Modo de producción
```bash
npm start
```

## Estructura de Carpetas Detallada

### models/
Contiene las clases que representan las entidades del dominio:
- `User.js`: Representa un usuario del sistema
- `Pet.js`: Representa una mascota registrada

### controllers/
Contiene las clases que manejan la lógica de negocio:
- `UserController.js`: Controlador para operaciones de usuarios
- `PetController.js`: Controlador para operaciones de mascotas

### views/
Contiene las clases que manejan la interfaz de usuario:
- `MenuView.js`: Funcionalidad del menú de navegación
- `ButtonView.js`: Funcionalidad de botones
- `FormView.js`: Funcionalidad de formularios

### database/
Contiene las clases para el acceso a datos:
- `DatabaseConnection.js`: Conexión reutilizable a SQL Server
- `UserDAO.js`: Acceso a datos para usuarios
- `PetDAO.js`: Acceso a datos para mascotas

### utils/
Contiene utilidades comunes:
- `Validator.js`: Validaciones de datos
- `ErrorHandler.js`: Manejo de errores
- `Logger.js`: Registro de logs

## Variables de Entorno

El archivo `.env` debe contener:
- `DB_SERVER`: Dirección del servidor SQL Server
- `DB_NAME`: Nombre de la base de datos
- `DB_USER`: Usuario de base de datos
- `DB_PASSWORD`: Contraseña de base de datos
- `NODE_ENV`: Entorno de ejecución (development/production)
- `PORT`: Puerto del servidor web

## Pruebas

Para ejecutar pruebas:
```bash
npm test
```

## Despliegue

Para desplegar en producción:
1. Configurar el entorno de producción
2. Ejecutar `npm run build` para compilar
3. Configurar el servidor web (Apache/Nginx)
4. Configurar el proxy inverso si es necesario
5. Ejecutar `npm start` para iniciar la aplicación

## Solución de Problemas Comunes

### Problema: No se puede conectar a la base de datos
- Verificar que SQL Server esté corriendo
- Verificar las credenciales en el archivo `.env`
- Verificar que el servidor esté configurado para aceptar conexiones remotas

### Problema: Errores de permisos
- Verificar que el usuario de base de datos tenga los permisos necesarios
- Verificar que la base de datos exista y sea accesible

### Problema: Errores de validación
- Verificar que los datos ingresados cumplan con los requisitos
- Verificar que los formularios estén correctamente configurados