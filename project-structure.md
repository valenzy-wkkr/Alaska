# Estructura del Proyecto

Este documento describe la estructura del proyecto y las clases que se implementarán siguiendo los principios de Programación Orientada a Objetos (POO) y SOLID.

## Estructura de Carpetas

```
/models/
/controllers/
/views/
/database/
/utils/
```

## Descripción de Clases

### 1. Modelos (models/)

#### User.js
Representa un usuario en el sistema con sus propiedades y métodos.

#### Pet.js
Representa una mascota en el sistema con sus propiedades y métodos.

### 2. Controladores (controllers/)

#### UserController.js
Controlador para manejar las operaciones CRUD de usuarios.

#### PetController.js
Controlador para manejar las operaciones CRUD de mascotas.

### 3. Vistas (views/)

#### MenuView.js
Clase para manejar la funcionalidad del menú de navegación.

#### ButtonView.js
Clase para manejar la funcionalidad de los botones.

#### FormView.js
Clase para manejar la funcionalidad de los formularios.

### 4. Base de Datos (database/)

#### DatabaseConnection.js
Módulo de conexión reutilizable a SQL Server 2019.

#### UserDAO.js
Objeto de acceso a datos para usuarios.

#### PetDAO.js
Objeto de acceso a datos para mascotas.

### 5. Utilidades (utils/)

#### Validator.js
Clase para validaciones de datos.

#### ErrorHandler.js
Clase para manejo de excepciones y errores.

#### Logger.js
Clase para registro de logs de errores.