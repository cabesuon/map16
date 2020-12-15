<?php
//Record - 0min - Measure1

$requestMethod = $_SERVER['REQUEST_METHOD'];
//Make sure that it is a POST request.
if(strcasecmp($_SERVER['REQUEST_METHOD'], 'POST') != 0){
  throw new Exception("Request method must be POST! (not $requestMethod)");
}

//Make sure that the content type of the POST request has been set to application/json
$contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
if(strcasecmp($contentType, 'application/json') != 0){
  throw new Exception("Content type must be: application/json (not $contentType)");
}

//Receive the RAW post data.
$content = trim(file_get_contents("php://input"));

//Attempt to decode the incoming RAW post data from JSON.
$decoded = json_decode($content, true);

//If json_decode failed, the JSON is invalid.
if(!is_array($decoded)){
  throw new Exception('Received content contained invalid JSON!');
}

//Process the JSON.
// Create connection
$servername = "db";
$username = "map16sqlsys";
$password = "map16sqlsys";
$dbname = "map16_sus_live_sensor_db";

$myConnection = mysqli_connect($servername,$username,$password,$dbname) or die ("could not connect to mysql"); 

/* check connection */
if (mysqli_connect_errno()) {
  printf("Connect failed: %s\n", mysqli_connect_error());
  exit();
}

if (empty($decoded['Data'])) {
  throw new Exception('Received content is empty!');
}

// fixed values
$samplingInterval = $decoded['Sampling Interval'];
$rssi = $decoded['RSSI'];
$imei = $decoded['IMEI'];
$iccid = $decoded['ICCID'];
$network = $decoded['Network'];
$count = count($decoded['Data']);
$values = [];
$NETWORK_DELAY = 18;

$subSeconds = $count * $samplingInterval + $NETWORK_DELAY;

for ($i = 0; $i < $count; $i++) {
  $measure = $decoded['Data'][$i]['Distance'];
  $voltage = $decoded['Data'][$i]['Battery'];
  $subSeconds -= $samplingInterval;
  $values[] = "(
    'map16-uu-ultrasonic-live-4G',
    '$imei',
    '$iccid',
    $i + 1,
    NOW(),
    DATE_SUB(current_timestamp, INTERVAL $subSeconds SECOND),
    $measure,
    $voltage,
    '$rssi',
    '$network'
  )";
}

$sqlInsertTable = "
4g_flood_sensor_data_store(
  app_id,
  imei,
  iccid,
  packet_number,
  data_send_time,
  date_id,
  measure,
  voltage,
  rssi,
  network)
" ;

$sqlInsertValues = implode(',', $values);

$sqlCommand = "
INSERT INTO 
$sqlInsertTable
VALUES
$sqlInsertValues
";

// store data

# print($sqlCommand);

$query=mysqli_query($myConnection, $sqlCommand) or
  die(
    sprintf("could not insert values to store table: %s", mysqli_error($myConnection))
  );

// live data

// last values
$measure = $decoded['Data'][$count - 1]['Distance'];
$voltage = $decoded['Data'][$count - 1]['Battery'];

$sqlCommand="
UPDATE
4g_flood_sensor_data_live
SET
imei = '$imei',
date_id = NOW(),
measure = $measure,
voltage = $voltage,
rssi = '$rssi',
network = '$network'
WHERE iccid = '$iccid' AND date_id <> NOW()
";

$query = mysqli_query($myConnection, $sqlCommand) or 
  die(
    sprintf("could not udpate values to live table: %s", mysqli_error($myConnection))
  ) 

/* close connection */
mysqli_close($myConnection);

?>
