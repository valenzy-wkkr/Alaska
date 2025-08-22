<?php
session_start();
require_once 'conexion.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Validar que los campos no estén vacíos
    if (empty($_POST['correo']) || empty($_POST['contrasena'])) {
        header("Location: ../login.php?error=vacio");
        exit();
    }

    $correo = trim($_POST['correo']);
    $contrasena = $_POST['contrasena'];

    // Preparar la consulta para evitar inyección SQL
    $query = "SELECT id, email, password, name, username FROM Users WHERE email = ?";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("s", $correo);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $usuario = $result->fetch_assoc();
        
        // Verificar la contraseña
        if (password_verify($contrasena, $usuario['password'])) {
            // Iniciar sesión
            $_SESSION['usuario_id'] = $usuario['id'];
            $_SESSION['usuario'] = $usuario['email'];
            $_SESSION['nombre'] = $usuario['name'];
            $_SESSION['username'] = $usuario['username'];
            
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
