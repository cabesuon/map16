<?php
header('Content-Type: application/json');

$conn = mysqli_connect("192.168.35.10","map16sqlsys","(oM8rQu7","map16_sus_live_sensor_db");


$id = $_GET['id'];

$sqlQuery = "SELECT date_id as 'x',water_level as 'y' FROM flood_sensor_timeline_live WHERE device_id = '".$id."' AND date_id > '2020-11-24 21:00:36' ORDER BY `flood_sensor_timeline_live`.`date_id` ASC";

$result = mysqli_query($conn,$sqlQuery);

$data = array();
foreach ($result as $row) {
	$data[] = $row;
}

mysqli_close($conn);

echo json_encode($data);
?>
