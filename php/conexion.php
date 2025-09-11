<?php
$servidor = "localhost";
$usuario = "root";
$clave = "";
$basedatos = "alaska";
$port = '3306';

$conexion = mysqli_connect($servidor, $usuario, $clave, $basedatos, $port);

if (!$conexion) {
    die("Error al conectar con la base de datos: " . mysqli_connect_error());
}