<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'conexion.php';

// Función para enviar respuesta JSON
function enviarRespuesta($exito, $mensaje, $datos = null) {
    echo json_encode([
        'exito' => $exito,
        'mensaje' => $mensaje,
        'datos' => $datos
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// Función para validar datos de entrada
function validarDatosCita($datos) {
    $errores = [];
    
    if (empty($datos['petId'])) {
        $errores[] = 'El tipo de mascota es requerido';
    }
    
    if (empty($datos['petName'])) {
        $errores[] = 'El nombre de la mascota es requerido';
    }
    
    if (empty($datos['appointmentDate'])) {
        $errores[] = 'La fecha y hora de la cita es requerida';
    } else {
        $fecha = DateTime::createFromFormat('Y-m-d\TH:i', $datos['appointmentDate']);
        if (!$fecha || $fecha < new DateTime()) {
            $errores[] = 'La fecha debe ser válida y futura';
        }
    }
    
    if (empty($datos['reason'])) {
        $errores[] = 'El motivo de la cita es requerido';
    }
    
    return $errores;
}

// Función para escapar datos
function escaparDatos($conexion, $datos) {
    return array_map(function($valor) use ($conexion) {
        return mysqli_real_escape_string($conexion, $valor);
    }, $datos);
}

$metodo = $_SERVER['REQUEST_METHOD'];

try {
    switch ($metodo) {
        case 'POST':
            // Crear nueva cita
            $datos = json_decode(file_get_contents('php://input'), true);
            
            if (!$datos) {
                $datos = $_POST;
            }
            
            // Validar datos
            $errores = validarDatosCita($datos);
            if (!empty($errores)) {
                enviarRespuesta(false, 'Datos inválidos: ' . implode(', ', $errores));
            }
            
            // Escapar datos
            $datos = escaparDatos($conexion, $datos);
            
            // Insertar cita
            $sql = "INSERT INTO citas (tipo_mascota, nombre_mascota, fecha_cita, motivo, notas, estado, fecha_creacion) 
                    VALUES ('{$datos['petId']}', '{$datos['petName']}', '{$datos['appointmentDate']}', '{$datos['reason']}', 
                            '{$datos['notes']}', 'programada', NOW())";
            
            if (mysqli_query($conexion, $sql)) {
                $id_cita = mysqli_insert_id($conexion);
                enviarRespuesta(true, 'Cita creada exitosamente', ['id' => $id_cita]);
            } else {
                enviarRespuesta(false, 'Error al crear la cita: ' . mysqli_error($conexion));
            }
            break;
            
        case 'GET':
            // Obtener citas
            $filtro_mascota = isset($_GET['mascota']) ? mysqli_real_escape_string($conexion, $_GET['mascota']) : '';
            
            $sql = "SELECT * FROM citas WHERE 1=1";
            
            if (!empty($filtro_mascota) && $filtro_mascota !== 'todas') {
                $sql .= " AND tipo_mascota = '$filtro_mascota'";
            }
            
            $sql .= " ORDER BY fecha_cita DESC";
            
            $resultado = mysqli_query($conexion, $sql);
            
            if (!$resultado) {
                enviarRespuesta(false, 'Error al consultar las citas: ' . mysqli_error($conexion));
            }
            
            $citas = [];
            while ($fila = mysqli_fetch_assoc($resultado)) {
                $citas[] = [
                    'id' => $fila['id'],
                    'tipo_mascota' => $fila['tipo_mascota'],
                    'nombre_mascota' => $fila['nombre_mascota'] ?? '',
                    'fecha_cita' => $fila['fecha_cita'],
                    'motivo' => $fila['motivo'],
                    'notas' => $fila['notas'],
                    'estado' => $fila['estado'],
                    'diagnostico' => $fila['diagnostico'] ?? '',
                    'tratamiento' => $fila['tratamiento'] ?? '',
                    'veterinario' => $fila['veterinario'] ?? '',
                    'fecha_creacion' => $fila['fecha_creacion']
                ];
            }
            
            enviarRespuesta(true, 'Citas obtenidas exitosamente', $citas);
            break;
            
        case 'PUT':
            // Actualizar cita
            $datos = json_decode(file_get_contents('php://input'), true);
            
            if (!$datos || !isset($datos['id'])) {
                enviarRespuesta(false, 'ID de cita requerido');
            }
            
            $id = mysqli_real_escape_string($conexion, $datos['id']);
            
            // Construir query de actualización
            $campos = [];
            if (isset($datos['tipo_mascota'])) {
                $campos[] = "tipo_mascota = '" . mysqli_real_escape_string($conexion, $datos['tipo_mascota']) . "'";
            }
            if (isset($datos['fecha_cita'])) {
                $campos[] = "fecha_cita = '" . mysqli_real_escape_string($conexion, $datos['fecha_cita']) . "'";
            }
            if (isset($datos['motivo'])) {
                $campos[] = "motivo = '" . mysqli_real_escape_string($conexion, $datos['motivo']) . "'";
            }
            if (isset($datos['notas'])) {
                $campos[] = "notas = '" . mysqli_real_escape_string($conexion, $datos['notas']) . "'";
            }
            if (isset($datos['estado'])) {
                $campos[] = "estado = '" . mysqli_real_escape_string($conexion, $datos['estado']) . "'";
            }
            if (isset($datos['diagnostico'])) {
                $campos[] = "diagnostico = '" . mysqli_real_escape_string($conexion, $datos['diagnostico']) . "'";
            }
            if (isset($datos['tratamiento'])) {
                $campos[] = "tratamiento = '" . mysqli_real_escape_string($conexion, $datos['tratamiento']) . "'";
            }
            if (isset($datos['veterinario'])) {
                $campos[] = "veterinario = '" . mysqli_real_escape_string($conexion, $datos['veterinario']) . "'";
            }
            
            if (empty($campos)) {
                enviarRespuesta(false, 'No hay campos para actualizar');
            }
            
            $sql = "UPDATE citas SET " . implode(', ', $campos) . " WHERE id = '$id'";
            
            if (mysqli_query($conexion, $sql)) {
                if (mysqli_affected_rows($conexion) > 0) {
                    enviarRespuesta(true, 'Cita actualizada exitosamente');
                } else {
                    enviarRespuesta(false, 'No se encontró la cita o no hubo cambios');
                }
            } else {
                enviarRespuesta(false, 'Error al actualizar la cita: ' . mysqli_error($conexion));
            }
            break;
            
        case 'DELETE':
            // Eliminar cita
            $id = isset($_GET['id']) ? mysqli_real_escape_string($conexion, $_GET['id']) : '';
            
            if (empty($id)) {
                enviarRespuesta(false, 'ID de cita requerido');
            }
            
            $sql = "DELETE FROM citas WHERE id = '$id'";
            
            if (mysqli_query($conexion, $sql)) {
                if (mysqli_affected_rows($conexion) > 0) {
                    enviarRespuesta(true, 'Cita eliminada exitosamente');
                } else {
                    enviarRespuesta(false, 'No se encontró la cita');
                }
            } else {
                enviarRespuesta(false, 'Error al eliminar la cita: ' . mysqli_error($conexion));
            }
            break;
            
        default:
            enviarRespuesta(false, 'Método no permitido');
    }
    
} catch (Exception $e) {
    enviarRespuesta(false, 'Error interno del servidor: ' . $e->getMessage());
} finally {
    mysqli_close($conexion);
}
?>
