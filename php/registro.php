<?php
session_start();
// Habilitar visualización de errores
error_reporting(E_ALL);
ini_set('display_errors', 1);

include('conexion.php'); // SIEMPRE incluir la conexión, no solo si hay sesión

// Depuración: Verificar si se recibió el método POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    error_log('Método POST recibido');
    // Validar que todos los campos existen antes de usarlos
    if (
        isset($_POST['nombre'], $_POST['apodo'], $_POST['correo'], 
              $_POST['direccion'], $_POST['clave'])
    ) {
        $nombre = $_POST['nombre'];
        $apodo = $_POST['apodo'];
        $correo = $_POST['correo'];
        $direccion = $_POST['direccion'];
        $clave = password_hash($_POST['clave'], PASSWORD_DEFAULT);

        $consulta = "INSERT INTO usuarios (nombre, apodo, correo, direccion, clave)
                     VALUES ('$nombre', '$apodo', '$correo', '$direccion', '$clave')";

        if (mysqli_query($conexion, $consulta)) {
            // Configurar la sesión del usuario
            $_SESSION['usuario'] = $correo;
            $_SESSION['nombre'] = $nombre;
            
            error_log('Registro exitoso, redirigiendo a dashboard.php');
            // Forzar la salida del buffer y enviar encabezados
            if (ob_get_level()) ob_end_clean();
            header("Location: ../dashboard.php");
            exit();
        } else {
            echo "❌ Error al registrar al usuario: " . mysqli_error($conexion);
        }
    }
}
include('./botonera.php'); 

mysqli_close($conexion);
?>
