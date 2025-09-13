<?php
header('Content-Type: application/json');
require_once 'conexion.php';

// Obtener el método HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Obtener datos del usuario desde la sesión (simulado por ahora)
$usuario_id = 1; // En producción, esto vendría de la sesión

switch ($method) {
    case 'GET':
        // Obtener todas las mascotas del usuario
        $sql = "SELECT * FROM mascotas WHERE usuario_id = ? ORDER BY fecha_creacion DESC";
        $stmt = mysqli_prepare($conexion, $sql);
        mysqli_stmt_bind_param($stmt, "i", $usuario_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        $mascotas = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $mascotas[] = [
                'id' => $row['id'],
                'name' => $row['nombre'],
                'species' => $row['especie'],
                'breed' => $row['raza'],
                'age' => floatval($row['edad']),
                'weight' => floatval($row['peso']),
                'healthStatus' => $row['estado_salud'],
                'lastCheckup' => $row['ultima_revision']
            ];
        }
        
        echo json_encode($mascotas);
        break;
        
    case 'POST':
        // Crear nueva mascota
        $data = json_decode(file_get_contents('php://input'), true);
        
        $nombre = $data['name'] ?? '';
        $especie = $data['species'] ?? '';
        $raza = $data['breed'] ?? '';
        $edad = $data['age'] ?? 0;
        $peso = $data['weight'] ?? 0;
        $estado_salud = $data['healthStatus'] ?? 'healthy';
        $ultima_revision = $data['lastCheckup'] ?? date('Y-m-d');
        
        $sql = "INSERT INTO mascotas (usuario_id, nombre, especie, raza, edad, peso, estado_salud, ultima_revision) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = mysqli_prepare($conexion, $sql);
        mysqli_stmt_bind_param($stmt, "isssddss", $usuario_id, $nombre, $especie, $raza, $edad, $peso, $estado_salud, $ultima_revision);
        
        if (mysqli_stmt_execute($stmt)) {
            $nueva_mascota = [
                'id' => mysqli_insert_id($conexion),
                'name' => $nombre,
                'species' => $especie,
                'breed' => $raza,
                'age' => floatval($edad),
                'weight' => floatval($peso),
                'healthStatus' => $estado_salud,
                'lastCheckup' => $ultima_revision
            ];
            echo json_encode(['success' => true, 'mascota' => $nueva_mascota]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Error al crear la mascota']);
        }
        break;
        
    case 'PUT':
        // Actualizar mascota
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? 0;
        
        $nombre = $data['name'] ?? '';
        $especie = $data['species'] ?? '';
        $raza = $data['breed'] ?? '';
        $edad = $data['age'] ?? 0;
        $peso = $data['weight'] ?? 0;
        $estado_salud = $data['healthStatus'] ?? 'healthy';
        $ultima_revision = $data['lastCheckup'] ?? date('Y-m-d');
        
        $sql = "UPDATE mascotas SET nombre = ?, especie = ?, raza = ?, edad = ?, peso = ?, estado_salud = ?, ultima_revision = ? 
                WHERE id = ? AND usuario_id = ?";
        
        $stmt = mysqli_prepare($conexion, $sql);
        mysqli_stmt_bind_param($stmt, "sssddssii", $nombre, $especie, $raza, $edad, $peso, $estado_salud, $ultima_revision, $id, $usuario_id);
        
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode(['success' => true, 'message' => 'Mascota actualizada correctamente']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Error al actualizar la mascota']);
        }
        break;
        
    case 'DELETE':
        // Eliminar mascota
        $id = $_GET['id'] ?? 0;
        
        $sql = "DELETE FROM mascotas WHERE id = ? AND usuario_id = ?";
        $stmt = mysqli_prepare($conexion, $sql);
        mysqli_stmt_bind_param($stmt, "ii", $id, $usuario_id);
        
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode(['success' => true, 'message' => 'Mascota eliminada correctamente']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Error al eliminar la mascota']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        break;
}

mysqli_close($conexion);
?>
