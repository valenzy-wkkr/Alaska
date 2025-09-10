<?php
require_once 'conexion.php';

if($_SERVER['REQUEST_METHOD']!=='POST'){
  header('Location: ../forgot_password.php');
  exit();
}

$token = isset($_POST['token'])? $_POST['token']:'';
$nueva = isset($_POST['nueva'])? $_POST['nueva']:'';
$confirmar = isset($_POST['confirmar'])? $_POST['confirmar']:'';

if(!$token || !$nueva || !$confirmar || $nueva !== $confirmar || strlen($nueva) < 6){
  header('Location: ../reset_password.php?token='.urlencode($token).'&error=invalid');
  exit();
}

$hash = hash('sha256', $token);
$sql = "SELECT pr.id, pr.user_id FROM password_resets pr WHERE pr.token_hash=? AND pr.used_at IS NULL AND pr.expires_at > NOW() LIMIT 1";
$stmt = $conexion->prepare($sql);
$stmt->bind_param('s',$hash);
$stmt->execute();
$res = $stmt->get_result();
$row = $res->fetch_assoc();
$stmt->close();

if(!$row){
  header('Location: ../reset_password.php?token='.urlencode($token).'&error=expired');
  exit();
}

$user_id = (int)$row['user_id'];
$hashPass = password_hash($nueva, PASSWORD_DEFAULT);

$stmt2 = $conexion->prepare('UPDATE usuarios SET clave=? WHERE id=?');
$stmt2->bind_param('si',$hashPass,$user_id);
$stmt2->execute();
$stmt2->close();

$stmt3 = $conexion->prepare('UPDATE password_resets SET used_at=NOW() WHERE id=?');
$stmt3->bind_param('i',$row['id']);
$stmt3->execute();
$stmt3->close();

header('Location: ../reset_password.php?done=1');
exit();
