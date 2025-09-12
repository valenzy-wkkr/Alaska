<?php

session_start();
// Requisito de autenticación
if (!isset($_SESSION['usuario'])) {
    header('Location: login.php');
    exit();
}
// Timeout de inactividad (30 min)
$INACTIVITY = 1800; // 1800s = 30min
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > $INACTIVITY) {
    session_unset();
    session_destroy();
    header('Location: login.php?error=timeout');
    exit();
}
$_SESSION['last_activity'] = time();
// Regenerar ID cada 10 min para mitigar fijación de sesión
if (!isset($_SESSION['last_regen'])) { $_SESSION['last_regen'] = time(); }
if (time() - $_SESSION['last_regen'] > 600) { session_regenerate_id(true); $_SESSION['last_regen'] = time(); }

// Definir nombre de usuario mostrado (si en el futuro se guarda otro campo)
$nombre = isset($_SESSION['nombre']) ? htmlspecialchars($_SESSION['nombre'], ENT_QUOTES, 'UTF-8') : htmlspecialchars($_SESSION['usuario'], ENT_QUOTES, 'UTF-8');










?>
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Panel de Control - Alaska</title>
    <script>/* Pre-aplicar tema para evitar FOUC */(function(){try{var k='theme';var s=localStorage.getItem(k);if(!s&&window.matchMedia('(prefers-color-scheme: dark)').matches){s='dark';}if(s){document.documentElement.setAttribute('data-theme',s);} }catch(e){}})();</script>
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
                    <ul class="lista-navegacion">
                        <li><a href="index.html">Inicio</a></li>
                        <li><a href="citas.html">Citas</a></li>
                        <li><a href="blog.html">Blog</a></li>
                        <li><a href="contacto.html">Contacto</a></li>
                        <li><a href="#" id="btnCerrarSesion">Cerrar Sesión</a></li>
                    </ul>
                </nav>
            </div>
        </header>

        <main class="dashboard-main">
            <div class="contenedor">
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

                <div class="dashboard-content">
                    <div class="dashboard-left">
                        <section class="dashboard-section">
                            <div class="section-header">
                                <h2><i class="fas fa-bell"></i> Próximos Recordatorios</h2>
                                <button class="btn-add" id="btnAddReminder"><i class="fas fa-plus"></i> Agregar</button>
                            </div>
                            <div class="reminders-container" id="remindersContainer"></div>
                        </section>

                        <section class="dashboard-section">
                            <div class="section-header">
                                <h2><i class="fas fa-heartbeat"></i> Estado de Salud</h2>
                                <button class="btn-add" id="btnAddPet"><i class="fas fa-plus"></i> Agregar Mascota</button>
                            </div>
                            <div class="pets-health-container" id="petsHealthContainer"></div>
                        </section>
                    </div>

                    <div class="dashboard-right">
                        <section class="dashboard-section">
                            <div class="section-header">
                                <h2><i class="fas fa-newspaper"></i> Últimos Artículos</h2>
                                <a class="btn-view-all" href="blog.html">Ver Todos</a>
                            </div>
                            <div class="blog-articles-container" id="blogArticlesContainer"></div>
                        </section>

                        <section class="dashboard-section">
                            <div class="section-header">
                                <h2><i class="fas fa-clock"></i> Actividad Reciente</h2>
                            </div>
                            <div class="recent-activity-container" id="recentActivityContainer"></div>
                        </section>
                    </div>
                </div>
            </div>
        </main>

        <!-- Modales -->
        <div class="modal" id="reminderModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Agregar Recordatorio</h3>
                    <button class="modal-close" id="closeReminderModal"><i class="fas fa-times"></i></button>
                </div>
                <form id="reminderForm">
                    <div class="form-group">
                        <label for="reminderTitle">Título</label>
                        <input type="text" id="reminderTitle" name="title" required />
                    </div>
                    <div class="form-group">
                        <label for="reminderDate">Fecha</label>
                        <input type="datetime-local" id="reminderDate" name="date" required />
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

        <div class="modal" id="petModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Agregar Mascota</h3>
                    <button class="modal-close" id="closePetModal"><i class="fas fa-times"></i></button>
                </div>
                <form id="petForm">
                    <div class="form-group">
                        <label for="petName">Nombre</label>
                        <input type="text" id="petName" name="name" required />
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
                        <input type="text" id="petBreed" name="breed" />
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="petAge">Edad (años)</label>
                            <input type="number" id="petAge" name="age" min="0" step="0.1" />
                        </div>
                        <div class="form-group">
                            <label for="petWeight">Peso (kg)</label>
                            <input type="number" id="petWeight" name="weight" min="0" step="0.1" />
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" id="cancelPet">Cancelar</button>
                        <button type="submit" class="btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Scripts externos -->
        <script src="utils/theme.js"></script>
        <script src="utils/chatbot.js"></script>
        <script src="js/dashboard.js"></script>
    </body>
</html>
