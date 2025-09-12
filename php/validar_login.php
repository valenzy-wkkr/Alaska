<?php
session_start();
include_once('conexion.php');

// Configuración de seguridad
const MAX_ATTEMPTS = 5;            // Intentos antes de bloqueo
const LOCK_MINUTES = 5;            // Minutos de bloqueo
const INACTIVITY_TIMEOUT = 1800;   // 30 min

// Inicializar tracking de intentos
if (!isset($_SESSION['login_attempts'])) {
    $_SESSION['login_attempts'] = 0;
}
if (!isset($_SESSION['lock_until'])) {
    $_SESSION['lock_until'] = 0;
}

// Revisar bloqueo activo
if (time() < $_SESSION['lock_until']) {
    header('Location: ../login.php?error=lock');
    exit();
}

// Timeout de inactividad de sesión (si existiera previamente)
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > INACTIVITY_TIMEOUT) {
    session_unset();
    session_destroy();
    header('Location: ../login.php?error=timeout');
    exit();
}
$_SESSION['last_activity'] = time();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validar token CSRF
    if (empty($_POST['csrf_token']) || empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
        header('Location: ../login.php?error=csrf');
        exit();
    }
    // Validar que los campos no estén vacíos
    if (empty($_POST['correo']) || empty($_POST['clave'])) {
        header("Location: ../login.php?error=vacio");
        exit();
    }

    $correo = trim($_POST['correo']);
    $clave = $_POST['clave'];

    // Preparar la consulta para evitar inyección SQL
    $query = "SELECT id, correo, clave FROM usuarios WHERE correo = ? LIMIT 1";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("s", $correo);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $usuario = $result->fetch_assoc();
        
        // Verificar la contraseña
        if (password_verify($clave, $usuario['clave'])) {
            // Regenerar ID de sesión para prevenir fijación
            session_regenerate_id(true);
            // Reset intentos
            $_SESSION['login_attempts'] = 0;
            $_SESSION['lock_until'] = 0;
            // Establecer variables de sesión
            $_SESSION['usuario_id'] = (int)$usuario['id'];
            $_SESSION['usuario'] = $usuario['correo'];
            $_SESSION['authenticated_at'] = time();
            $_SESSION['last_activity'] = time();
            // Recordar correo (opcional)
            if (!empty($_POST['remember']) && $_POST['remember'] === '1') {
                setcookie('remember_email', $usuario['correo'], time() + 60*60*24*30, '/', '', false, true);
            } else {
                if (isset($_COOKIE['remember_email'])) setcookie('remember_email', '', time()-3600, '/');
            }
            header('Location: ../dashboard.php');
            exit();
        }
    }
    
    // Credenciales inválidas: incrementar intentos
    $_SESSION['login_attempts']++;
    if ($_SESSION['login_attempts'] >= MAX_ATTEMPTS) {
        $_SESSION['lock_until'] = time() + (LOCK_MINUTES * 60);
    }
    header('Location: ../login.php?error=credenciales');
    exit();
}

// Si se accede directamente a este archivo sin datos POST
header("Location: ../login.php");
exit();
?>
