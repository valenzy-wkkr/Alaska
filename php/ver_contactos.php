<?php
session_start();
include('conexion.php');

// Verificar si hay una sesión activa (opcional, para seguridad)
// if (!isset($_SESSION['usuario'])) {
//     header("Location: ../login.php");
//     exit();
// }

$consulta = "SELECT * FROM contactos ORDER BY fecha_envio DESC";
$resultado = mysqli_query($conexion, $consulta);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mensajes de Contacto - Alaska</title>
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="../style/usuario.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="shortcut icon" href="../img/alaska-ico.ico" type="image/x-icon">
    <style>
        .container-mensajes {
            max-width: 1200px;
            margin: 20px auto;
            padding: 20px;
        }
        .mensaje-item {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-left: 4px solid #007bff;
        }
        .mensaje-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .mensaje-info h3 {
            margin: 0;
            color: #333;
        }
        .mensaje-info p {
            margin: 5px 0;
            color: #666;
        }
        .mensaje-fecha {
            color: #999;
            font-size: 0.9em;
        }
        .mensaje-contenido {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-top: 10px;
        }
        .estado-badge {
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 0.8em;
            font-weight: bold;
        }
        .estado-nuevo {
            background: #d4edda;
            color: #155724;
        }
        .estado-leido {
            background: #cce5ff;
            color: #004085;
        }
        .estado-respondido {
            background: #d1ecf1;
            color: #0c5460;
        }
        .sin-mensajes {
            text-align: center;
            padding: 50px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container-mensajes">
        <h1><i class="fas fa-envelope"></i> Mensajes de Contacto</h1>
        
        <?php if (mysqli_num_rows($resultado) > 0): ?>
            <?php while ($fila = mysqli_fetch_assoc($resultado)): ?>
                <div class="mensaje-item">
                    <div class="mensaje-header">
                        <div class="mensaje-info">
                            <h3><?php echo htmlspecialchars($fila['nombre']); ?></h3>
                            <p><i class="fas fa-envelope"></i> <?php echo htmlspecialchars($fila['email']); ?></p>
                            <?php if (!empty($fila['telefono'])): ?>
                                <p><i class="fas fa-phone"></i> <?php echo htmlspecialchars($fila['telefono']); ?></p>
                            <?php endif; ?>
                        </div>
                        <div>
                            <span class="estado-badge estado-<?php echo $fila['estado']; ?>">
                                <?php echo ucfirst($fila['estado']); ?>
                            </span>
                            <p class="mensaje-fecha">
                                <i class="fas fa-clock"></i> 
                                <?php echo date('d/m/Y H:i', strtotime($fila['fecha_envio'])); ?>
                            </p>
                        </div>
                    </div>
                    
                    <div class="mensaje-contenido">
                        <h4><i class="fas fa-tag"></i> <?php echo htmlspecialchars($fila['asunto']); ?></h4>
                        <p><?php echo nl2br(htmlspecialchars($fila['mensaje'])); ?></p>
                    </div>
                </div>
            <?php endwhile; ?>
        <?php else: ?>
            <div class="sin-mensajes">
                <i class="fas fa-inbox" style="font-size: 3em; margin-bottom: 20px;"></i>
                <h3>No hay mensajes de contacto</h3>
                <p>Los mensajes enviados desde el formulario de contacto aparecerán aquí.</p>
            </div>
        <?php endif; ?>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="../contacto.html" class="boton-primario">
                <i class="fas fa-plus"></i> Nuevo Mensaje
            </a>
            <a href="../dashboard.php" class="boton-primario" style="background: #6c757d;">
                <i class="fas fa-arrow-left"></i> Volver al Dashboard
            </a>
        </div>
    </div>
</body>
</html>

<?php
mysqli_close($conexion);
?>
