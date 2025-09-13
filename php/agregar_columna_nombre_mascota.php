<?php
require_once 'conexion.php';

// Agregar columna nombre_mascota a la tabla citas
$sql = "ALTER TABLE citas ADD COLUMN nombre_mascota VARCHAR(100) AFTER tipo_mascota";

try {
    if (mysqli_query($conexion, $sql)) {
        echo "Columna 'nombre_mascota' agregada exitosamente a la tabla 'citas'.<br>";
    } else {
        echo "Error agregando columna 'nombre_mascota': " . mysqli_error($conexion) . "<br>";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}

mysqli_close($conexion);
?>