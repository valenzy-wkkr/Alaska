<?php
// Procesa la solicitud de recuperación
require_once 'conexion.php';

// Respuesta genérica para evitar enumeración
$genericRedirect = '../forgot_password.php?status=sent';
if($_SERVER['REQUEST_METHOD'] !== 'POST'){
  header('Location: '.$genericRedirect);
  exit();
}

$correo = isset($_POST['correo']) ? trim($_POST['correo']) : '';
if($correo===''){
  header('Location: '.$genericRedirect);
  exit();
}

// Asegurar tabla password_resets
$conexion->query("CREATE TABLE IF NOT EXISTS password_resets (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  user_id INT NOT NULL,\n  token_hash CHAR(64) NOT NULL,\n  expires_at DATETIME NOT NULL,\n  used_at DATETIME NULL,\n  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n  INDEX(token_hash),\n  FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// Buscar usuario
$stmt = $conexion->prepare('SELECT id FROM usuarios WHERE correo = ? LIMIT 1');
$stmt->bind_param('s', $correo);
$stmt->execute();
$res = $stmt->get_result();
$user = $res->fetch_assoc();
$stmt->close();

if($user){
  // Generar token
  try { $token = bin2hex(random_bytes(32)); } catch(Exception $e){ $token = bin2hex(openssl_random_pseudo_bytes(32)); }
  $tokenHash = hash('sha256', $token);
  $expires = date('Y-m-d H:i:s', time()+3600); // 1 hora
  $user_id = (int)$user['id'];

  // Invalidar tokens anteriores no usados (opcional)
  $conexion->query("UPDATE password_resets SET used_at=NOW() WHERE user_id=$user_id AND used_at IS NULL AND expires_at < NOW()");

  $stmt2 = $conexion->prepare('INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?,?,?)');
  $stmt2->bind_param('iss', $user_id, $tokenHash, $expires);
  $stmt2->execute();
  $stmt2->close();

  // En un entorno real se enviaría email. Como fallback mostramos link (solo desarrollo)
  // Guardamos el enlace en sesión para mostrarlo en la página de confirmación sin exponer enumeración en la URL
  session_start();
  $_SESSION['dev_reset_link'] = '../reset_password.php?token='.$token;
}

header('Location: '.$genericRedirect);
exit();
