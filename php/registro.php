<?php
session_start();
include('conexion.php'); // SIEMPRE incluir la conexión, no solo si hay sesión

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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
            header("Location: ../dashboard.html"); 
            exit();
        } else {
            echo "❌ Error al registrar al usuario: " . mysqli_error($conexion);
        }
    }
}

mysqli_close($conexion);
?>
