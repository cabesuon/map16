<?php

//Make sure that it is a POST request.
if (strcasecmp($_SERVER['REQUEST_METHOD'], 'POST') != 0) {
  throw new Exception('Request method must be POST!');
}

//Make sure that the content type of the POST request has been set to application/json
$contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
if (strcasecmp($contentType, 'application/json') != 0) {
  throw new Exception('Content type must be: application/json');
}

//Receive the RAW post data.
$content = trim(file_get_contents("php://input"));

//Attempt to decode the incoming RAW post data from JSON.
$decoded = json_decode($content, true);

// If json_decode failed, the JSON is invalid.
if (!is_array($decoded)) {
    throw new Exception('Received content contained invalid JSON!');
}

// Process the JSON.

// Create connection
$servername = "db";
$username = "map16sqlsys";
$password = "map16sqlsys";
$dbname = "map16_sus_live_sensor_db";

$myConnection = mysqli_connect($servername, $username, $password, $dbname) or
  die("could not connect to mysql");

// data store

$app_id = $decoded['end_device_ids']['application_ids']['application_id'];
$device_id = $decoded['end_device_ids']['device_id'];
$gateway_id = $decoded['uplink_message']['rx_metadata'][0]['gateway_ids']['gateway_id'];
$last_seen = $decoded['received_at'];
$measure = $decoded['uplink_message']['decoded_payload']['measure'];
$voltage = $decoded['uplink_message']['decoded_payload']['voltage'];
$rssi = $decoded['uplink_message']['rx_metadata'][0]['rssi'];
$snr = $decoded['uplink_message']['rx_metadata'][0]['snr'];
$spread_factor = $decoded['uplink_message']['settings']['data_rate']['lora']['spreading_factor'];

$sqlCommand = "
INSERT INTO flood_sensor_data_store(
  app_id,
  device_id,
  gateway_id,
  date_id,
  measure,
  voltage,
  rssi,
  snr,
  spread_factor
) VALUES(
  '$app_id',
  '$device_id',
  '$gateway_id',
  '$last_seen',
  '$measure',
  '$voltage',
  '$rssi',
  '$snr',
  '$spread_factor'
)
";

$query = mysqli_query($myConnection, $sqlCommand) or
die(mysqli_error($myConnection));

// data live

$second_gateway_id =
$decoded['uplink_message']['rx_metadata'][1]['gateway_ids']['gateway_id'];
$third_gateway_id =
$decoded['uplink_message']['rx_metadata'][2]['gateway_ids']['gateway_id'];

$sqlCommand="
UPDATE
flood_sensor_data_live
SET
gateway_id = '$gateway_id',
second_gateway_id = '$second_gateway_id',
third_gateway_id = '$third_gateway_id',
date_id = '$last_seen',
measure = '$measure',
voltage = '$voltage',
rssi = '$rssi',
snr = '$snr',
spread_factor = '$spread_factor'
WHERE 
device_id = '$device_id' AND date_id <> '$last_seen'";

$query = mysqli_query($myConnection, $sqlCommand) or
  die(mysqli_error($myConnection));

?>
