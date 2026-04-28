<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);

$host = "localhost";
$user = "root";
$pass = "";
$db = "sistema_produtos";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die(json_encode(["erro" => "Erro na conexão"]));
}
?>