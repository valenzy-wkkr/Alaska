# Alaska - Aplicación de Cuidado de Mascotas

Esta aplicación está diseñada para ayudar a los dueños de mascotas a ser responsables y atender las necesidades de sus compañeros peludos.

## Características

- Registro de datos veterinarios
- Recordatorios personalizados
- Plan de alimentación y ejercicio
- Entrenamiento y socialización
- Localización y seguridad
- Comunidad de dueños de mascotas
- Información legal y responsabilidades

## Arquitectura

La aplicación sigue una arquitectura basada en principios SOLID utilizando Programación Orientada a Objetos (POO). La estructura del proyecto está organizada de la siguiente manera:

```
alaska-pets/
├── models/
├── controllers/
├── views/
├── database/
├── utils/
├── config/
├── public/
├── logs/
├── app.js
├── server.js
├── package.json
└── .env
```

## Tecnologías

- Node.js
- Express.js
- SQL Server 2019
- HTML5
- CSS3
- JavaScript (ES6+)

## Instalación

1. Clonar el repositorio:
   ```
   git clone https://github.com/tu-usuario/alaska-pets.git
   ```

2. Instalar dependencias:
   ```
   npm install
   ```

3. Configurar variables de entorno:
   Crear un archivo `.env` basado en `.env.example` y configurar los valores apropiados.

4. Crear la base de datos:
   Ejecutar los scripts SQL en `database/scripts/` para crear la base de datos y tablas.

## Configuración

### Base de datos
Configurar las siguientes variables de entorno en el archivo `.env`:

```
DB_SERVER=localhost
DB_NAME=AlaskaPets
DB_USER=sa
DB_PASSWORD=TuContraseñaSegura123
```

### Aplicación
```
NODE_ENV=development
PORT=3000
LOG_LEVEL=INFO
LOG_FILE=./logs/app.log
```

### Seguridad
```
JWT_SECRET=secreto_jwt_por_defecto
JWT_EXPIRATION=24h
BCRYPT_ROUNDS=10
```

## Uso

1. Iniciar el servidor en modo desarrollo:
   ```
   npm run dev
   ```

2. Iniciar el servidor en modo producción:
   ```
   npm start
   ```

3. Acceder a la aplicación en el navegador:
   ```
   http://localhost:3000
   ```

## Scripts de base de datos

Los scripts para crear la base de datos se encuentran en `database/scripts/`:

- `create-database.sql`: Crea la base de datos
- `create-tables.sql`: Crea las tablas de usuarios y mascotas
- `stored-procedures.sql`: Crea los procedimientos almacenados para operaciones CRUD

## Validaciones

La aplicación implementa validaciones de datos en todos los puntos de entrada:

- Validación de formato de email
- Validación de longitud de contraseña (mínimo 8 caracteres)
- Validación de campos requeridos
- Validación de tipos de datos
- Validación de límites (edad, peso, etc.)

## Manejo de errores

La aplicación incluye un sistema robusto de manejo de errores:

- Validaciones de datos con mensajes claros para el usuario
- Manejo de excepciones con bloques try/catch
- Logs de errores en archivo
- Prevención de inyección SQL usando procedimientos almacenados

## Contribución

1. Crear un fork del repositorio
2. Crear una rama para la nueva funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Hacer commit de los cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Hacer push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un nuevo Pull Request

## Licencia

Este proyecto está licenciado bajo la licencia MIT.