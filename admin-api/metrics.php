<?php
/**
 * Endpoint de métricas (etapa 1) usando datos reales mínimos desde DB.
 * NOTA: Ajusta nombres de tablas según tu esquema real (asume tablas: usuarios, mascotas, citas, posts, social_posts, social_comments)
 */
require_once __DIR__ . '/middleware.php';
$auth = auth_require(['admin','moderator','editor']);

function quick_count($tabla){
    global $conexion; $q = @mysqli_query($conexion, "SELECT COUNT(*) c FROM $tabla");
    if(!$q) return 0; $r = mysqli_fetch_assoc($q); return (int)$r['c'];
}

$resp = [
  'ok'=> true,
  'usersActive'=> quick_count('usuarios'),
  'pets'=> quick_count('mascotas'),
  'upcomingAppointments'=> quick_count('citas'),
  'blogPosts'=> quick_count('posts'),
  'socialPosts'=> quick_count('social_posts'),
  'socialComments'=> quick_count('social_comments'),
  // Datos mock para gráficas (puedes calcularlos verdaderamente luego)
  'trendUsers'=> [ ['day'=>'Lun','value'=>4],['day'=>'Mar','value'=>6],['day'=>'Mié','value'=>5],['day'=>'Jue','value'=>7],['day'=>'Vie','value'=>5],['day'=>'Sáb','value'=>9],['day'=>'Dom','value'=>3] ],
  'trendPosts'=> [ ['day'=>'Lun','blog'=>1,'social'=>4],['day'=>'Mar','blog'=>2,'social'=>5],['day'=>'Mié','blog'=>0,'social'=>3],['day'=>'Jue','blog'=>2,'social'=>6],['day'=>'Vie','blog'=>1,'social'=>4],['day'=>'Sáb','blog'=>2,'social'=>7],['day'=>'Dom','blog'=>1,'social'=>2] ]
];
admin_json(200,$resp);
