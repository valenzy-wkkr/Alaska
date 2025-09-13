<?php
header('Content-Type: text/html; charset=utf-8');

// Incluir archivo de conexión
require_once 'conexion.php';

// Función para verificar si una tabla existe
function tabla_existe($conexion, $tabla) {
    $resultado = mysqli_query($conexion, "SHOW TABLES LIKE '$tabla'");
    return mysqli_num_rows($resultado) > 0;
}

// Verificar conexión
echo "<h2>Verificación de conexión a la base de datos</h2>";

if ($conexion) {
    echo "<p style='color: green;'>✓ Conexión a la base de datos establecida correctamente.</p>";
    
    // Verificar tablas necesarias
    $tablas = ['usuarios', 'mascotas', 'recordatorios', 'blog_articulos'];
    $tablas_faltantes = [];
    
    echo "<h3>Verificación de tablas:</h3>";
    echo "<ul>";
    
    foreach ($tablas as $tabla) {
        if (tabla_existe($conexion, $tabla)) {
            echo "<li style='color: green;'>✓ Tabla '$tabla' existe.</li>";
        } else {
            echo "<li style='color: red;'>✗ Tabla '$tabla' no existe.</li>";
            $tablas_faltantes[] = $tabla;
        }
    }
    
    echo "</ul>";
    
    // Verificar datos en las tablas
    if (empty($tablas_faltantes)) {
        echo "<h3>Verificación de datos:</h3>";
        echo "<ul>";
        
        // Verificar usuarios
        $result = mysqli_query($conexion, "SELECT COUNT(*) as total FROM usuarios");
        $row = mysqli_fetch_assoc($result);
        echo "<li>Usuarios: {$row['total']} registros</li>";
        
        // Verificar mascotas
        $result = mysqli_query($conexion, "SELECT COUNT(*) as total FROM mascotas");
        $row = mysqli_fetch_assoc($result);
        echo "<li>Mascotas: {$row['total']} registros</li>";
        
        // Verificar recordatorios
        $result = mysqli_query($conexion, "SELECT COUNT(*) as total FROM recordatorios");
        $row = mysqli_fetch_assoc($result);
        echo "<li>Recordatorios: {$row['total']} registros</li>";
        
        // Verificar artículos
        $result = mysqli_query($conexion, "SELECT COUNT(*) as total FROM blog_articulos");
        $row = mysqli_fetch_assoc($result);
        echo "<li>Artículos del blog: {$row['total']} registros</li>";
        
        echo "</ul>";
    } else {
        echo "<p style='color: red;'>Es necesario crear las tablas faltantes. Por favor, sigue las instrucciones en el archivo sql/README.md para configurar la base de datos.</p>";
    }
    
} else {
    echo "<p style='color: red;'>✗ Error al conectar con la base de datos: " . mysqli_connect_error() . "</p>";
    echo "<p>Verifica la configuración en el archivo conexion.php:</p>";
    echo "<pre>";
    echo "\$servidor = \"localhost\";\n";
    echo "\$usuario = \"root\";\n";
    echo "\$clave = \"\";\n";
    echo "\$basedatos = \"alaska\";\n";
    echo "\$port = '3306';";
    echo "</pre>";
}

// Botón para volver al dashboard
echo "<p><a href='../dashboard.php' style='display: inline-block; padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;'>Volver al Dashboard</a></p>";
?>