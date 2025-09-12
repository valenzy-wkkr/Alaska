<?php
session_start();
// Habilitar visualización de errores para desarrollo
error_reporting(E_ALL);
ini_set('display_errors', 1);

include('conexion.php');

// Verificar que se recibió el método POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Validar que todos los campos requeridos existen
    if (isset($_POST['nombre-contacto'], $_POST['email-contacto'], 
              $_POST['asunto-contacto'], $_POST['mensaje-contacto'])) {
        
        // Sanitizar y validar los datos
        $nombre = mysqli_real_escape_string($conexion, trim($_POST['nombre-contacto']));
        $email = mysqli_real_escape_string($conexion, trim($_POST['email-contacto']));
        $telefono = isset($_POST['telefono-contacto']) ? 
                   mysqli_real_escape_string($conexion, trim($_POST['telefono-contacto'])) : '';
        $asunto = mysqli_real_escape_string($conexion, trim($_POST['asunto-contacto']));
        $mensaje = mysqli_real_escape_string($conexion, trim($_POST['mensaje-contacto']));
        
        // Validaciones básicas
        $errores = [];
        
        if (empty($nombre)) {
            $errores[] = "El nombre es requerido";
        }
        
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errores[] = "El email es requerido y debe ser válido";
        }
        
        if (empty($asunto)) {
            $errores[] = "El asunto es requerido";
        }
        
        if (empty($mensaje)) {
            $errores[] = "El mensaje es requerido";
        }
        
        // Si no hay errores, insertar en la base de datos
        if (empty($errores)) {
            $consulta = "INSERT INTO contactos (nombre, email, telefono, asunto, mensaje) 
                        VALUES ('$nombre', '$email', '$telefono', '$asunto', '$mensaje')";
            
            if (mysqli_query($conexion, $consulta)) {
                // Mensaje de éxito
                $mensaje_exito = "¡Mensaje enviado correctamente! Te responderemos pronto.";
                
                // Opcional: Enviar email de confirmación
                // mail($email, "Confirmación de contacto - Alaska", 
                //      "Hola $nombre,\n\nHemos recibido tu mensaje: '$asunto'\n\nTe responderemos pronto.\n\nSaludos,\nEquipo Alaska");
                
            } else {
                $errores[] = "Error al enviar el mensaje: " . mysqli_error($conexion);
            }
        }
        
    } else {
        $errores[] = "Todos los campos requeridos deben ser completados";
    }
    
} else {
    // Si no es POST, redirigir al formulario
    header("Location: ../contacto.html");
    exit();
}

// Cerrar conexión
mysqli_close($conexion);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resultado del Contacto - Alaska</title>
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="../style/usuario.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="shortcut icon" href="../img/alaska-ico.ico" type="image/x-icon">
    <style>
        .resultado-container {
            max-width: 600px;
            margin: 50px auto;
            padding: 30px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            text-align: center;
        }
        .mensaje-exito {
            color: #28a745;
            font-size: 1.2em;
            margin-bottom: 20px;
        }
        .mensaje-error {
            color: #dc3545;
            font-size: 1.1em;
            margin-bottom: 20px;
        }
        .lista-errores {
            text-align: left;
            background: #f8d7da;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .boton-volver {
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            transition: background 0.3s;
        }
        .boton-volver:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <div class="resultado-container">
        <?php if (isset($mensaje_exito)): ?>
            <div class="mensaje-exito">
                <i class="fas fa-check-circle"></i>
                <?php echo $mensaje_exito; ?>
            </div>
        <?php endif; ?>
        
        <?php if (!empty($errores)): ?>
            <div class="mensaje-error">
                <i class="fas fa-exclamation-triangle"></i>
                Se encontraron los siguientes errores:
            </div>
            <div class="lista-errores">
                <ul>
                    <?php foreach ($errores as $error): ?>
                        <li><?php echo $error; ?></li>
                    <?php endforeach; ?>
                </ul>
            </div>
        <?php endif; ?>
        
        <a href="../contacto.html" class="boton-volver">
            <i class="fas fa-arrow-left"></i> Volver al formulario
        </a>
    </div>
</body>
</html>
