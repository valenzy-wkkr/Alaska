<?php
session_start();
include_once('conexion.php');

// Migraciones silenciosas mínimas
@mysqli_query($conexion, "ALTER TABLE usuarios ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user'");
@mysqli_query($conexion, "ALTER TABLE usuarios ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active'");
@mysqli_query($conexion, "ALTER TABLE usuarios ADD COLUMN last_login DATETIME NULL");

// Si ya hay sesión y se accede con GET, redirigir directamente
if($_SERVER['REQUEST_METHOD'] !== 'POST' && isset($_SESSION['usuario'])) {
    header('Location: ../dashboard.php');
    exit();
}

// Si el usuario está logueado pero intenta iniciar otra sesión con POST diferente correo -> cerrar y continuar
if($_SERVER['REQUEST_METHOD']==='POST' && isset($_SESSION['usuario']) && isset($_POST['correo']) && $_POST['correo'] !== $_SESSION['usuario']) {
    // Reset mínima para evitar fijación de sesión
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time()-42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
    session_start();
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Validar que los campos no estén vacíos
    if (empty($_POST['correo']) || empty($_POST['clave'])) {
        header("Location: ../login.php?error=vacio");
        exit();
    }

    $correo = trim($_POST['correo']);
    $clave = $_POST['clave'];

    // Si se quiere forzar que solo un correo/clave específico acceda (administrador fijo)
    $correoAdmin = 'davidfrancoflo@gmail.com';
    $claveAdminPlano = 'lupita.2609'; // NOTA: Para producción, guardarla hasheada en DB, no en texto plano.

    // Preparar la consulta para evitar inyección SQL (compat: algunas instalaciones usan 'clave' otras 'password')
    $query = "SELECT id, correo, COALESCE(password, clave) AS clave, nombre, apodo, direccion, role, status FROM usuarios WHERE correo = ? LIMIT 1";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("s", $correo);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $usuario = $result->fetch_assoc();
        
        // Verificar la contraseña
        // Validar credenciales normales
        $credencialesCorrectas = password_verify($clave, $usuario['clave']);

        // Si coincide el correo del admin forzado, exigir además la clave exacta definida
        if ($usuario['correo'] === $correoAdmin) {
            if ($clave !== $claveAdminPlano) {
                // Clave no coincide con la clave fija; negar acceso
                header("Location: ../login.php?error=credenciales");
                exit();
            }
            // Forzar rol admin
            $usuario['role'] = 'admin';
            $credencialesCorrectas = true; // ya validado
        }

        if ($credencialesCorrectas) {
            // Iniciar sesión con datos de perfil
            $_SESSION['usuario_id'] = (int)$usuario['id'];
            $_SESSION['usuario'] = $usuario['correo'];
            if(!empty($usuario['nombre'])) $_SESSION['nombre'] = $usuario['nombre'];
            if(!empty($usuario['apodo'])) $_SESSION['apodo'] = $usuario['apodo'];
            if(!empty($usuario['direccion'])) $_SESSION['direccion'] = $usuario['direccion'];
            $_SESSION['role'] = $usuario['role'] ?? 'user';
            session_regenerate_id(true);

            // Registrar último acceso
            $upd = $conexion->prepare("UPDATE usuarios SET last_login = NOW() WHERE id = ?");
            $upd->bind_param('i', $_SESSION['usuario_id']);
            $upd->execute();
            $upd->close();

            // Redirigir: si es admin forzado, a panel admin; si no, dashboard normal
            if($usuario['correo'] === $correoAdmin) {
                header("Location: ../admin/index.php");
            } else {
                header("Location: ../dashboard.php");
            }
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
