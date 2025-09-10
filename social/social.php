<?php
session_start();
if(!isset($_SESSION['usuario'])){ header('Location: ../login.php?redir=social'); exit; }
require_once __DIR__ . '/../php/conexion.php';
// Simple user reference
$userEmail = $_SESSION['usuario'];
$initials = strtoupper(substr($userEmail,0,1));
?>
<!DOCTYPE html>
<html lang="es" data-theme="">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Red Social Mascotas - Alaska</title>
<link rel="stylesheet" href="../style.css" />
<link rel="stylesheet" href="social.css" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
<link rel="shortcut icon" href="../img/alaska-ico.ico" type="image/x-icon">
</head>
<body>
<header class="cabecera-principal">
  <div class="contenedor contenedor-cabecera">
    <div class="logo">
      <div class="contenedor-logo">
        <div class="contenedor-imagen-logo">
          <img src="../img/logo.jpg" alt="Logo Alaska" class="img-logo" />
        </div>
        <h1>ALASKA</h1>
      </div>
    </div>
    <nav class="navegacion-principal">
      <button class="boton-menu-movil" aria-label="Abrir menú"><i class="fas fa-bars"></i></button>
      <ul class="lista-navegacion">
        <li><a href="../index.html">Inicio</a></li>
        <li><a href="../citas.html">Citas</a></li>
        <li><a href="../agenda.html">Agenda</a></li>
        <li><a href="../blog/index.php">Blog</a></li>
        <li><a href="social.php" class="activo">Social</a></li>
        <li><a href="../logout.php" class="boton-nav">Salir</a></li>
      </ul>
    </nav>
  </div>
</header>
<main class="social-main">
  <aside class="social-sidebar-left">
    <div class="widget-box">
      <h3>Perfil</h3>
      <div style="display:flex;align-items:center;gap:.75rem;">
        <div class="avatar" aria-hidden="true"><?=$initials?></div>
        <div style="display:flex;flex-direction:column;">
          <strong style="font-size:.85rem;">Usuario</strong>
          <span style="font-size:.65rem;opacity:.7;"> <?=$userEmail?> </span>
        </div>
      </div>
    </div>
    <div class="widget-box">
      <h3>Etiquetas populares</h3>
      <div class="trending-tags" id="trendingTags"></div>
    </div>
  </aside>
  <section class="social-feed">
    <div class="social-card post-composer" id="composerCard">
      <form id="composerForm">
        <textarea name="content" id="composerContent" placeholder="Comparte algo útil sobre el cuidado animal..." maxlength="1000" required></textarea>
        <div class="post-composer-actions">
          <div class="left">
            <label class="icon-btn" style="cursor:pointer;">
              <i class="fa-solid fa-image"></i>
              <input type="file" name="image" id="composerImage" accept="image/*" style="display:none;">
              <span>Imagen</span>
            </label>
            <input type="text" name="tags" id="composerTags" placeholder="#etiquetas (coma)" style="padding:.55rem .6rem;border:1px solid var(--color-borde);border-radius:10px;font-size:.7rem;min-width:140px;" />
          </div>
          <button type="submit" class="publish-btn" id="publishBtn" disabled>Publicar</button>
        </div>
      </form>
    </div>
    <div class="feed" id="feedContainer" aria-live="polite"></div>
  </section>
  <aside class="social-sidebar-right">
    <div class="widget-box">
      <h3>Reciente</h3>
      <div id="recentMini"></div>
    </div>
    <div class="widget-box">
      <h3>Acerca</h3>
      <p style="margin:0;font-size:.7rem;line-height:1.4;">Este espacio permite compartir información verificada sobre el bienestar animal. Evita contenido ofensivo o engañoso.</p>
    </div>
  </aside>
</main>
<script src="../views/MenuView.js"></script>
<script src="../js/theme-toggle.js"></script>
<script src="social.js" defer></script>
</body>
</html>
