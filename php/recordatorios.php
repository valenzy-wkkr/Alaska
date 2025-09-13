<?php
header('Content-Type: application/json');
require_once 'conexion.php';

// Obtener el método HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Obtener datos del usuario desde la sesión (simulado por ahora)
$usuario_id = 1; // En producción, esto vendría de la sesión

switch ($method) {
    case 'GET':
        // Obtener todos los recordatorios del usuario
        $sql = "SELECT r.*, m.nombre as mascota_nombre 
                FROM recordatorios r 
                JOIN mascotas m ON r.mascota_id = m.id 
                WHERE r.usuario_id = ? 
                ORDER BY r.fecha_recordatorio ASC";
        $stmt = mysqli_prepare($conexion, $sql);
        mysqli_stmt_bind_param($stmt, "i", $usuario_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        $recordatorios = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $recordatorios[] = [
                'id' => $row['id'],
                'title' => $row['titulo'],
                'date' => $row['fecha_recordatorio'],
                'type' => $row['tipo'],
                'petId' => $row['mascota_id'],
                'petName' => $row['mascota_nombre'],
                'notes' => $row['notas'],
                'urgent' => (bool)$row['urgente'],
                'completed' => (bool)$row['completado']
            ];
        }
        
        echo json_encode($recordatorios);
        break;
        
    case 'POST':
        // Crear nuevo recordatorio
        $data = json_decode(file_get_contents('php://input'), true);
        
        $titulo = $data['title'] ?? '';
        $fecha_recordatorio = $data['date'] ?? '';
        $tipo = $data['type'] ?? '';
        $mascota_id = $data['petId'] ?? 0;
        $notas = $data['notes'] ?? '';
        $urgente = $data['urgent'] ?? false;
        
        $sql = "INSERT INTO recordatorios (usuario_id, mascota_id, titulo, fecha_recordatorio, tipo, notas, urgente) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = mysqli_prepare($conexion, $sql);
        mysqli_stmt_bind_param($stmt, "iissssi", $usuario_id, $mascota_id, $titulo, $fecha_recordatorio, $tipo, $notas, $urgente);
        
        if (mysqli_stmt_execute($stmt)) {
            $nuevo_recordatorio = [
                'id' => mysqli_insert_id($conexion),
                'title' => $titulo,
                'date' => $fecha_recordatorio,
                'type' => $tipo,
                'petId' => $mascota_id,
                'petName' => $data['petName'] ?? '',
                'notes' => $notas,
                'urgent' => $urgente,
                'completed' => false
            ];
            echo json_encode(['success' => true, 'recordatorio' => $nuevo_recordatorio]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Error al crear el recordatorio']);
        }
        break;
        
    case 'PUT':
        // Actualizar recordatorio
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? 0;
        
        $titulo = $data['title'] ?? '';
        $fecha_recordatorio = $data['date'] ?? '';
        $tipo = $data['type'] ?? '';
        $mascota_id = $data['petId'] ?? 0;
        $notas = $data['notes'] ?? '';
        $urgente = $data['urgent'] ?? false;
        $completado = $data['completed'] ?? false;
        
        $sql = "UPDATE recordatorios SET titulo = ?, fecha_recordatorio = ?, tipo = ?, mascota_id = ?, notas = ?, urgente = ?, completado = ? 
                WHERE id = ? AND usuario_id = ?";
        
        $stmt = mysqli_prepare($conexion, $sql);
        mysqli_stmt_bind_param($stmt, "ssssisii", $titulo, $fecha_recordatorio, $tipo, $mascota_id, $notas, $urgente, $completado, $id, $usuario_id);
        
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode(['success' => true, 'message' => 'Recordatorio actualizado correctamente']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Error al actualizar el recordatorio']);
        }
        break;
        
    case 'DELETE':
        // Eliminar recordatorio
        $id = $_GET['id'] ?? 0;
        
        $sql = "DELETE FROM recordatorios WHERE id = ? AND usuario_id = ?";
        $stmt = mysqli_prepare($conexion, $sql);
        mysqli_stmt_bind_param($stmt, "ii", $id, $usuario_id);
        
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode(['success' => true, 'message' => 'Recordatorio eliminado correctamente']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Error al eliminar el recordatorio']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        break;
}

mysqli_close($conexion);
?>
