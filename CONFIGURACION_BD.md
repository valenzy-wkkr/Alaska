# Configuración de Base de Datos - Alaska Dashboard

## Pasos para conectar el dashboard a phpMyAdmin

### 1. Crear las tablas en la base de datos

1. Abre phpMyAdmin en tu navegador: `http://localhost/phpmyadmin`
2. Selecciona tu base de datos `alaska`
3. Ve a la pestaña "SQL"
4. Ejecuta el archivo `php/crear_tablas.php` o copia y pega el siguiente SQL:

```sql
-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de mascotas
CREATE TABLE IF NOT EXISTS mascotas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    raza VARCHAR(100),
    edad DECIMAL(4,1),
    peso DECIMAL(5,2),
    estado_salud ENUM('healthy', 'attention', 'warning') DEFAULT 'healthy',
    ultima_revision DATE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear tabla de recordatorios
CREATE TABLE IF NOT EXISTS recordatorios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    mascota_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    fecha_recordatorio DATETIME NOT NULL,
    tipo ENUM('vacuna', 'cita', 'medicamento', 'alimentacion', 'paseo', 'otro') NOT NULL,
    notas TEXT,
    urgente BOOLEAN DEFAULT FALSE,
    completado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mascota_id) REFERENCES mascotas(id) ON DELETE CASCADE
);
```

### 2. Verificar la conexión

1. Asegúrate de que XAMPP esté ejecutándose
2. Verifica que MySQL esté activo
3. Abre `http://localhost/Alaska-6/php/crear_tablas.php` en tu navegador
4. Deberías ver mensajes de confirmación de que las tablas se crearon correctamente

### 3. Configurar el usuario de sesión

Para que funcione correctamente, necesitas configurar la sesión del usuario. Puedes hacer esto de dos maneras:

#### Opción A: Modificar temporalmente para pruebas
En `dashboard.php`, cambia esta línea:
```php
$usuario_id = $_SESSION['usuario']['id'] ?? 1;
```
Por:
```php
$usuario_id = 1; // Usuario de prueba
```

#### Opción B: Configurar el sistema de login
Asegúrate de que tu sistema de login esté guardando correctamente los datos del usuario en `$_SESSION['usuario']`.

### 4. Probar la funcionalidad

1. Abre `http://localhost/Alaska-6/dashboard.php`
2. Las estadísticas deberían mostrar 0 para todas las métricas inicialmente
3. Prueba agregar una mascota usando el botón "Agregar Mascota"
4. Prueba agregar un recordatorio usando el botón "Agregar" en la sección de recordatorios
5. Los datos deberían guardarse en la base de datos y mostrarse en el dashboard

### 5. Archivos creados/modificados

- `php/crear_tablas.php` - Script para crear las tablas
- `php/mascotas.php` - API para manejar mascotas
- `php/recordatorios.php` - API para manejar recordatorios
- `dashboard.php` - Modificado para conectar con la BD
- `js/dashboard.js` - Modificado para usar las APIs PHP

### 6. Estructura de la base de datos

- **usuarios**: Almacena información de los usuarios
- **mascotas**: Almacena información de las mascotas de cada usuario
- **recordatorios**: Almacena los recordatorios asociados a cada mascota

### 7. Solución de problemas

Si encuentras errores:

1. Verifica que XAMPP esté ejecutándose
2. Revisa que la base de datos `alaska` exista
3. Verifica las credenciales en `php/conexion.php`
4. Revisa la consola del navegador para errores de JavaScript
5. Verifica los logs de error de PHP en XAMPP

### 8. Próximos pasos

Una vez que todo funcione:
1. Implementa el sistema de autenticación completo
2. Agrega validaciones de seguridad
3. Implementa la funcionalidad de editar/eliminar mascotas y recordatorios
4. Agrega más funcionalidades al dashboard
