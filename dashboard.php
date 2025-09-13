<?php
session_start();
require_once 'php/conexion.php';

if (!isset($_SESSION['usuario'])) {
    header('Location: index.html');
    exit();
}

// Obtener datos del usuario
$usuario_id = $_SESSION['usuario']['id'] ?? 1;
$nombre = $_SESSION['usuario']['nombre'] ?? 'Usuario';

// Obtener estadísticas del dashboard
$sql_stats = "SELECT 
    (SELECT COUNT(*) FROM mascotas WHERE usuario_id = ?) as total_mascotas,
    (SELECT COUNT(*) FROM recordatorios WHERE usuario_id = ? AND completado = 0) as total_recordatorios,
    (SELECT COUNT(*) FROM recordatorios WHERE usuario_id = ? AND fecha_recordatorio >= NOW() AND completado = 0) as proximas_citas";

$stmt = mysqli_prepare($conexion, $sql_stats);
mysqli_stmt_bind_param($stmt, "iii", $usuario_id, $usuario_id, $usuario_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$stats = mysqli_fetch_assoc($result);

// Obtener recordatorios próximos
$sql_recordatorios = "SELECT r.*, m.nombre as mascota_nombre 
                FROM recordatorios r 
                LEFT JOIN mascotas m ON r.mascota_id = m.id 
                WHERE r.usuario_id = ? AND r.completado = 0 
                ORDER BY r.fecha_recordatorio ASC 
                LIMIT 5";

$stmt_recordatorios = mysqli_prepare($conexion, $sql_recordatorios);
mysqli_stmt_bind_param($stmt_recordatorios, "i", $usuario_id);
mysqli_stmt_execute($stmt_recordatorios);
$result_recordatorios = mysqli_stmt_get_result($stmt_recordatorios);
$recordatorios = [];
while ($row = mysqli_fetch_assoc($result_recordatorios)) {
    $recordatorios[] = $row;
}

// Obtener mascotas del usuario
$sql_mascotas = "SELECT * FROM mascotas WHERE usuario_id = ? ORDER BY fecha_creacion DESC";
$stmt_mascotas = mysqli_prepare($conexion, $sql_mascotas);
mysqli_stmt_bind_param($stmt_mascotas, "i", $usuario_id);
mysqli_stmt_execute($stmt_mascotas);
$result_mascotas = mysqli_stmt_get_result($stmt_mascotas);
$mascotas = [];
while ($row = mysqli_fetch_assoc($result_mascotas)) {
    $mascotas[] = $row;
}

// Obtener últimos artículos del blog
$sql_blog = "SELECT * FROM blog_articulos ORDER BY fecha_publicacion DESC LIMIT 3";
$result_blog = mysqli_query($conexion, $sql_blog);
$articulos = [];
while ($row = mysqli_fetch_assoc($result_blog)) {
    $articulos[] = $row;
}

// Obtener actividad reciente
$sql_actividad = "SELECT 'recordatorio' as tipo, titulo as descripcion, fecha_recordatorio as fecha FROM recordatorios WHERE usuario_id = ? 
                UNION 
                SELECT 'mascota' as tipo, CONCAT('Mascota ', nombre, ' registrada') as descripcion, fecha_creacion as fecha FROM mascotas WHERE usuario_id = ? 
                ORDER BY fecha DESC LIMIT 5";
$stmt_actividad = mysqli_prepare($conexion, $sql_actividad);
mysqli_stmt_bind_param($stmt_actividad, "ii", $usuario_id, $usuario_id);
mysqli_stmt_execute($stmt_actividad);
$result_actividad = mysqli_stmt_get_result($stmt_actividad);
$actividades = [];
while ($row = mysqli_fetch_assoc($result_actividad)) {
    $actividades[] = $row;
}







?>
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Panel de Control - Alaska</title>
    <link rel="stylesheet" href="style.css" />
    <link rel="stylesheet" href="dashboard.css" />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
    />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <link rel="shortcut icon" href="img/alaska-ico.ico" type="image/x-icon">
  </head>
  <body>
    <!-- Header -->
    <header class="cabecera-principal">
      <div class="contenedor contenedor-cabecera">
        <div class="logo">
            <div class="contenedor-logo">
                <div class="contenedor-imagen-logo">
                    <img src="img/logo.jpg" alt="Logo Alaska" class="img-logo" />
                </div>
                <h1>ALASKA</h1>
            </div>
        </div>
        <nav class="navegacion-principal">
            <button class="boton-menu-movil" aria-label="Abrir menú">
                <i class="fas fa-bars"></i>
            </button>
            <ul class="lista-navegacion">
                <li><a href="index.html">Inicio</a></li>
                <!-- <li><a href="dashboard.html" class="activo">Dashboard</a></li> -->
                <li><a href="citas.html">Citas</a></li>
                <li><a href="blog.html">Blog</a></li>
                <li><a href="contacto.html">Contacto</a></li>
                <li><a href="#" class="boton-nav" id="btnCerrarSesion">Cerrar Sesión</a></li>
            </ul>
        </nav>
      </div>
    </header>

    <main class="dashboard-main">
        <div class="contenedor">
            <!-- Header del Dashboard -->
            <div class="dashboard-header">
                <div class="dashboard-welcome">
                    <h1>¡Bienvenido de vuelta!</h1>
                    <p id="userName"><?php echo $nombre; ?></p>
                </div>
                <div class="dashboard-stats">
                    <div class="stat-card">
                        <i class="fas fa-paw"></i>
                        <div class="stat-info">
                            <span class="stat-number" id="totalPets"><?php echo $stats['total_mascotas'] ?? 0; ?></span>
                            <span class="stat-label">Mascotas</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-calendar-check"></i>
                        <div class="stat-info">
                            <span class="stat-number" id="upcomingAppointments"><?php echo $stats['proximas_citas'] ?? 0; ?></span>
                            <span class="stat-label">Próximas Citas</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-bell"></i>
                        <div class="stat-info">
                            <span class="stat-number" id="totalReminders"><?php echo $stats['total_recordatorios'] ?? 0; ?></span>
                            <span class="stat-label">Recordatorios</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contenido Principal del Dashboard -->
            <div class="dashboard-content">
                <!-- Columna Izquierda -->
                <div class="dashboard-left">
                    <!-- Recordatorios -->
                    <section class="dashboard-section">
                        <div class="section-header">
                            <h2><i class="fas fa-bell"></i> Próximos Recordatorios</h2>
                            <button class="btn-add" id="btnAddReminder">
                                <i class="fas fa-plus"></i> Agregar
                            </button>
                        </div>
                        <div class="reminders-container" id="remindersContainer">
                            <?php if (empty($recordatorios)): ?>
                                <div class="empty-state">
                                    <p>No tienes recordatorios próximos</p>
                                </div>
                            <?php else: ?>
                                <?php foreach ($recordatorios as $recordatorio): ?>
                                    <div class="reminder-card" data-id="<?php echo $recordatorio['id']; ?>">
                                        <div class="reminder-icon">
                                            <?php if ($recordatorio['tipo'] == 'vacuna'): ?>
                                                <i class="fas fa-syringe"></i>
                                            <?php elseif ($recordatorio['tipo'] == 'cita'): ?>
                                                <i class="fas fa-stethoscope"></i>
                                            <?php elseif ($recordatorio['tipo'] == 'medicamento'): ?>
                                                <i class="fas fa-pills"></i>
                                            <?php elseif ($recordatorio['tipo'] == 'alimentacion'): ?>
                                                <i class="fas fa-utensils"></i>
                                            <?php elseif ($recordatorio['tipo'] == 'paseo'): ?>
                                                <i class="fas fa-walking"></i>
                                            <?php else: ?>
                                                <i class="fas fa-bell"></i>
                                            <?php endif; ?>
                                        </div>
                                        <div class="reminder-info">
                                            <h4><?php echo htmlspecialchars($recordatorio['titulo']); ?></h4>
                                            <p class="reminder-date">
                                                <i class="far fa-calendar"></i> 
                                                <?php echo date('d/m/Y H:i', strtotime($recordatorio['fecha_recordatorio'])); ?>
                                            </p>
                                            <?php if (!empty($recordatorio['mascota_nombre'])): ?>
                                                <p class="reminder-pet">
                                                    <i class="fas fa-paw"></i> 
                                                    <?php echo htmlspecialchars($recordatorio['mascota_nombre']); ?>
                                                </p>
                                            <?php endif; ?>
                                            <?php if (!empty($recordatorio['notas'])): ?>
                                                <p class="reminder-notes"><?php echo htmlspecialchars($recordatorio['notas']); ?></p>
                                            <?php endif; ?>
                                        </div>
                                        <div class="reminder-actions">
                                            <button class="btn-complete" data-id="<?php echo $recordatorio['id']; ?>">
                                                <i class="fas fa-check"></i>
                                            </button>
                                            <button class="btn-edit" data-id="<?php echo $recordatorio['id']; ?>">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn-delete" data-id="<?php echo $recordatorio['id']; ?>">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </div>
                    </section>

                    <!-- Estado de Salud de Mascotas -->
                    <section class="dashboard-section">
                        <div class="section-header">
                            <h2><i class="fas fa-heartbeat"></i> Estado de Salud</h2>
                            <button class="btn-add" id="btnAddPet">
                                <i class="fas fa-plus"></i> Agregar Mascota
                            </button>
                        </div>
                        <div class="pets-health-container" id="petsHealthContainer">
                            <?php if (empty($mascotas)): ?>
                                <div class="empty-state">
                                    <p>No tienes mascotas registradas</p>
                                </div>
                            <?php else: ?>
                                <?php foreach ($mascotas as $mascota): ?>
                                    <div class="pet-card" data-id="<?php echo $mascota['id']; ?>">
                                        <div class="pet-icon">
                                            <?php if ($mascota['especie'] == 'perro'): ?>
                                                <i class="fas fa-dog"></i>
                                            <?php elseif ($mascota['especie'] == 'gato'): ?>
                                                <i class="fas fa-cat"></i>
                                            <?php elseif ($mascota['especie'] == 'ave'): ?>
                                                <i class="fas fa-dove"></i>
                                            <?php elseif ($mascota['especie'] == 'roedor'): ?>
                                                <i class="fas fa-rabbit"></i>
                                            <?php else: ?>
                                                <i class="fas fa-paw"></i>
                                            <?php endif; ?>
                                        </div>
                                        <div class="pet-info">
                                            <h4><?php echo htmlspecialchars($mascota['nombre']); ?></h4>
                                            <p class="pet-breed">
                                                <?php echo htmlspecialchars($mascota['raza']); ?>
                                            </p>
                                            <div class="pet-details">
                                                <span class="pet-age">
                                                    <i class="fas fa-birthday-cake"></i> 
                                                    <?php echo $mascota['edad']; ?> años
                                                </span>
                                                <span class="pet-weight">
                                                    <i class="fas fa-weight"></i> 
                                                    <?php echo $mascota['peso']; ?> kg
                                                </span>
                                            </div>
                                            <div class="pet-health-status <?php echo $mascota['estado_salud']; ?>">
                                                <i class="fas fa-heartbeat"></i> 
                                                <?php 
                                                    $estado = 'Saludable';
                                                    if ($mascota['estado_salud'] == 'warning') $estado = 'Atención';
                                                    if ($mascota['estado_salud'] == 'danger') $estado = 'Cuidado';
                                                    echo $estado;
                                                ?>
                                            </div>
                                            <p class="pet-last-checkup">
                                                <i class="far fa-calendar-check"></i> 
                                                Última revisión: <?php echo date('d/m/Y', strtotime($mascota['ultima_revision'])); ?>
                                            </p>
                                        </div>
                                        <div class="pet-actions">
                                            <button class="btn-edit" data-id="<?php echo $mascota['id']; ?>">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn-delete" data-id="<?php echo $mascota['id']; ?>">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </div>
                    </section>
                </div>

                <!-- Columna Derecha -->
                <div class="dashboard-right">
                    <!-- Últimos Artículos del Blog -->
                    <section class="dashboard-section">
                        <div class="section-header">
                            <h2><i class="fas fa-newspaper"></i> Últimos Artículos</h2>
                            <a href="blog.html" class="btn-view-all">Ver Todos</a>
                        </div>
                        <div class="blog-articles-container" id="blogArticlesContainer">
                            <?php if (empty($articulos)): ?>
                                <div class="empty-state">
                                    <p>No hay artículos disponibles</p>
                                </div>
                            <?php else: ?>
                                <?php foreach ($articulos as $articulo): ?>
                                    <div class="article-card">
                                        <?php if (!empty($articulo['imagen'])): ?>
                                            <div class="article-image">
                                                <img src="<?php echo htmlspecialchars($articulo['imagen']); ?>" alt="<?php echo htmlspecialchars($articulo['titulo']); ?>">
                                            </div>
                                        <?php endif; ?>
                                        <div class="article-content">
                                            <h4><?php echo htmlspecialchars($articulo['titulo']); ?></h4>
                                            <p class="article-date">
                                                <i class="far fa-calendar-alt"></i> 
                                                <?php echo date('d/m/Y', strtotime($articulo['fecha_publicacion'])); ?>
                                            </p>
                                            <p class="article-excerpt"><?php echo htmlspecialchars(substr($articulo['contenido'], 0, 100)) . '...'; ?></p>
                                            <a href="blog.html?id=<?php echo $articulo['id']; ?>" class="btn-read-more">Leer más</a>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </div>
                    </section>

                    <!-- Actividad Reciente -->
                    <section class="dashboard-section">
                        <div class="section-header">
                            <h2><i class="fas fa-clock"></i> Actividad Reciente</h2>
                        </div>
                        <div class="recent-activity-container" id="recentActivityContainer">
                            <?php if (empty($actividades)): ?>
                                <div class="empty-state">
                                    <p>No hay actividad reciente</p>
                                </div>
                            <?php else: ?>
                                <?php foreach ($actividades as $actividad): ?>
                                    <div class="activity-item">
                                        <div class="activity-icon">
                                            <?php if ($actividad['tipo'] == 'recordatorio'): ?>
                                                <i class="fas fa-bell"></i>
                                            <?php elseif ($actividad['tipo'] == 'mascota'): ?>
                                                <i class="fas fa-paw"></i>
                                            <?php else: ?>
                                                <i class="fas fa-history"></i>
                                            <?php endif; ?>
                                        </div>
                                        <div class="activity-content">
                                            <p><?php echo htmlspecialchars($actividad['descripcion']); ?></p>
                                            <span class="activity-date">
                                                <?php echo date('d/m/Y H:i', strtotime($actividad['fecha'])); ?>
                                            </span>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </main>

    <!-- Modales -->
    <!-- Modal para Agregar Recordatorio -->
    <div class="modal" id="reminderModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Agregar Recordatorio</h3>
                <button class="modal-close" id="closeReminderModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="reminderForm">
                <div class="form-group">
                    <label for="reminderTitle">Título</label>
                    <input type="text" id="reminderTitle" name="title" required>
                </div>
                <div class="form-group">
                    <label for="reminderDate">Fecha</label>
                    <input type="datetime-local" id="reminderDate" name="date" required>
                </div>
                <div class="form-group">
                    <label for="reminderType">Tipo</label>
                    <select id="reminderType" name="type" required>
                        <option value="">Seleccionar tipo</option>
                        <option value="vacuna">Vacuna</option>
                        <option value="cita">Cita Veterinaria</option>
                        <option value="medicamento">Medicamento</option>
                        <option value="alimentacion">Alimentación</option>
                        <option value="paseo">Paseo</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="reminderPet">Mascota</label>
                    <input type="text" id="reminderPet" name="petName" placeholder="Ingresa el nombre de la mascota" required>
                </div>
                <div class="form-group">
                    <label for="reminderNotes">Notas</label>
                    <textarea id="reminderNotes" name="notes" rows="3"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" id="cancelReminder">Cancelar</button>
                    <button type="submit" class="btn-primary">Guardar</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal para Agregar Mascota -->
    <div class="modal" id="petModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Agregar Mascota</h3>
                <button class="modal-close" id="closePetModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="petForm">
                <div class="form-group">
                    <label for="petName">Nombre</label>
                    <input type="text" id="petName" name="name" required>
                </div>
                <div class="form-group">
                    <label for="petSpecies">Especie</label>
                    <select id="petSpecies" name="species" required>
                        <option value="">Seleccionar especie</option>
                        <option value="perro">Perro</option>
                        <option value="gato">Gato</option>
                        <option value="ave">Ave</option>
                        <option value="roedor">Roedor</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="petBreed">Raza</label>
                    <input type="text" id="petBreed" name="breed">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="petAge">Edad (años)</label>
                        <input type="number" id="petAge" name="age" min="0" step="0.1">
                    </div>
                    <div class="form-group">
                        <label for="petWeight">Peso (kg)</label>
                        <input type="number" id="petWeight" name="weight" min="0" step="0.1">
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" id="cancelPet">Cancelar</button>
                    <button type="submit" class="btn-primary">Guardar</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Scripts -->
    <script src="js/dashboard.js"></script>
  </body>
</html>
