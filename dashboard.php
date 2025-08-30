<?php

session_start();

if (!isset($_SESSION['usuario'])) {
    header('Location: index.html');
    exit();
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
                            <span class="stat-number" id="totalPets">0</span>
                            <span class="stat-label">Mascotas</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-calendar-check"></i>
                        <div class="stat-info">
                            <span class="stat-number" id="upcomingAppointments">0</span>
                            <span class="stat-label">Próximas Citas</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-bell"></i>
                        <div class="stat-info">
                            <span class="stat-number" id="totalReminders">0</span>
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
                            <!-- Los recordatorios se cargarán dinámicamente -->
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
                            <!-- El estado de salud se cargará dinámicamente -->
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
                            <!-- Los artículos se cargarán dinámicamente -->
                        </div>
                    </section>

                    <!-- Actividad Reciente -->
                    <section class="dashboard-section">
                        <div class="section-header">
                            <h2><i class="fas fa-clock"></i> Actividad Reciente</h2>
                        </div>
                        <div class="recent-activity-container" id="recentActivityContainer">
                            <!-- La actividad reciente se cargará dinámicamente -->
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
                    <select id="reminderPet" name="petId" required>
                        <option value="">Seleccionar mascota</option>
                    </select>
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
