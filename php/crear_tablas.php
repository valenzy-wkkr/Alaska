<?php
require_once 'conexion.php';

// Crear tabla de mascotas
$sql_mascotas = "CREATE TABLE IF NOT EXISTS mascotas (
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
)";

// Crear tabla de recordatorios
$sql_recordatorios = "CREATE TABLE IF NOT EXISTS recordatorios (
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
)";

// Crear tabla de usuarios (si no existe)
$sql_usuarios = "CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

try {
    // Crear tabla de usuarios
    if (mysqli_query($conexion, $sql_usuarios)) {
        echo "Tabla 'usuarios' creada exitosamente.<br>";
    } else {
        echo "Error creando tabla 'usuarios': " . mysqli_error($conexion) . "<br>";
    }

    // Crear tabla de mascotas
    if (mysqli_query($conexion, $sql_mascotas)) {
        echo "Tabla 'mascotas' creada exitosamente.<br>";
    } else {
        echo "Error creando tabla 'mascotas': " . mysqli_error($conexion) . "<br>";
    }

    // Crear tabla de recordatorios
    if (mysqli_query($conexion, $sql_recordatorios)) {
        echo "Tabla 'recordatorios' creada exitosamente.<br>";
    } else {
        echo "Error creando tabla 'recordatorios': " . mysqli_error($conexion) . "<br>";
    }

    echo "<br>¡Todas las tablas han sido creadas correctamente!";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}

mysqli_close($conexion);
?>
