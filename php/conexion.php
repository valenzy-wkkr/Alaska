<?php
/**
 * -------------------------------------------------------------
 * conexión.php
 * -------------------------------------------------------------
 * Punto único de creación de conexión MySQL (extensión mysqli).
 * Centralizar la conexión facilita:
 *  - Reutilizar el handler $conexion en cualquier script mediante include/require
 *  - Cambiar credenciales o motor en un solo lugar
 *  - Agregar mejoras (charset, modo estricto, logging) sin tocar cada archivo
 *
 * NOTAS / BUENAS PRÁCTICAS PENDIENTES:
 *  - Extraer credenciales a variables de entorno (.env) para producción
 *  - Activar SSL si el servidor MySQL lo permite
 *  - Implementar un pool o migrar a PDO si se requieren características avanzadas
 *  - Definir el charset explícitamente (utf8mb4) para soportar emojis y acentos
 * -------------------------------------------------------------
 */

// Credenciales básicas (en producción: NO hardcodear)
$servidor  = "localhost";   // Hostname o IP del servidor MySQL
$usuario   = "root";        // Usuario con permisos adecuados
$clave     = "";            // Contraseña del usuario
$basedatos = "alaska";      // Nombre de la base de datos principal
$port      = '3306';         // Puerto (por defecto 3306)

// Crear conexión
$conexion = mysqli_connect($servidor, $usuario, $clave, $basedatos, $port);

// Verificar errores de conexión inmediatamente
if (!$conexion) {
    die("Error al conectar con la base de datos: " . mysqli_connect_error());
}

// Establecer charset a utf8mb4 (soporte completo multilenguaje / emojis)
@mysqli_set_charset($conexion, 'utf8mb4');

// Opcional: Forzar modo SQL seguro / estricto (silencioso si no aplica)
@mysqli_query($conexion, "SET sql_mode = 'STRICT_ALL_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'");