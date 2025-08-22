<?php
session_start();
require_once 'conexion.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Validar que los campos no estén vacíos
    if (empty($_POST['usuario']) || empty($_POST['contrasena'])) {
        header("Location: ../login.php?error=vacio");
        exit();
    }

    $usuario = trim($_POST['usuario']);
    $contrasena = $_POST['contrasena'];

    // Preparar la consulta para evitar inyección SQL
    $query = "SELECT id, usuario, contrasena, nombre FROM usuarios WHERE usuario = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $usuario);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $usuario = $result->fetch_assoc();
        
        // Verificar la contraseña
        if (password_verify($contrasena, $usuario['contrasena'])) {
            // Iniciar sesión
            $_SESSION['usuario_id'] = $usuario['id'];
            $_SESSION['usuario'] = $usuario['usuario'];
            $_SESSION['nombre'] = $usuario['nombre'];
            
            // Redirigir al dashboard
            header("Location: ../dashboard.php");
            exit();
        }
    }
    
    // Si llegamos aquí, las credenciales son incorrectas
    header("Location: ../login.php?error=credenciales");
    exit();
}

// Si se accede directamente a este archivo sin datos POST
header("Location: ../login.php");
exit();
?>
