<?php

error_log(
  implode(
    " ",
    array_merge(
      ["xxxxx"],
      array_map(
        function($v) { return "$v:$_SERVER[$v]"; },
        [
          "REQUEST_TIME",
          "QUERY_STRING",
          "CONTENT_TYPE",
          "REMOTE_ADDR",
          "REMOTE_HOST",
          "REMOTE_PORT"
        ]
      )
    )
  )
);

//Make sure that it is a POST request.
if(strcasecmp($_SERVER['REQUEST_METHOD'], 'POST') != 0){
  error_log("xxxxx ERROR: Request method must be POST");
  exit(1);
}

//Make sure that the content type of the POST request has been set to application/json
$contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
if(strcasecmp($contentType, 'application/json') != 0){
  error_log("xxxxx ERROR: Content type must be: application/json");
  exit(1);
}

//Receive the RAW post data.
$content = trim(file_get_contents("php://input"));

error_log(
  sprintf("xxxxx REQUEST_CONTENT: %s", preg_replace('/\s+/', '', file_get_contents("php://input")))
);

//Attempt to decode the incoming RAW post data from JSON.
$decoded = json_decode($content, true);

//If json_decode failed, the JSON is invalid.
// if(!is_object($decoded)){
  // throw new Exception('Received content contained invalid JSON');
  // error_log("xxxxx ERROR: Received content contained invalid JSON");
  // exit(1);
// }

//Process the JSON.
// Create connection
$servername = "db";
$username = "map16sqlsys";
$password = "map16sqlsys";
$dbname = "map16_sus_live_sensor_db";

$myConnection = mysqli_connect($servername,$username,$password,$dbname)
or die ("xxxxx ERROR: Could not connect to mysql"); 

/* check connection */
if (mysqli_connect_errno()) {
  error_log(
    sprintf("xxxxx ERROR: Connect failed: %s", mysqli_connect_error())
  );
  exit(1);
}

if (empty($decoded['Data'])) {
  error_log(
    sprintf("xxxxx ERROR: Received content is empty - ICCID: %s", $decoded['ICCID'])
  );
  exit(1);
}

// fixed values
$samplingInterval = isset($decoded['Sampling Interval']) ? $decoded['Sampling Interval'] : '';
$rssi = isset($decoded['RSSI']) ? $decoded['RSSI'] : '';
$imei = isset($decoded['IMEI']) ? $decoded['IMEI'] : '';
$iccid = isset($decoded['ICCID']) ? $decoded['ICCID'] : '';
$network = isset($decoded['Network']) ? $decoded['Network'] : '';
$count = count($decoded['Data']);
$values = [];
$NETWORK_DELAY = 18;

$subSeconds = $count * $samplingInterval + $NETWORK_DELAY;

for ($i = 0; $i < $count; $i++) {
  if (!isset($decoded['Data'][$i])) {
    error_log(
      sprintf("xxxxx ERROR: Data row %d is empty", $i)
    );
    continue;
  }

  if (!isset($decoded['Data'][$i]['Distance'])) {
    error_log(
      sprintf("xxxxx ERROR: Distance in data row %d is empty", $i)
    );
    continue;
  }

  if (!isset($decoded['Data'][$i]['Battery'])) {
    error_log(
      sprintf("xxxxx ERROR: Battery in data row %d is empty", $i)
    );
    continue;
  }

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

$query=mysqli_query($myConnection, $sqlCommand);

if (!$query) {
  error_log(
    sprintf("xxxxx ERROR: Could not insert values to store table: %s", mysqli_error($myConnection))
  );
  exit(1);
}

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

$query = mysqli_query($myConnection, $sqlCommand);

if (!$query) {
  error_log(
    sprintf("xxxxx ERROR: Could not udpate values to live table: %s", mysqli_error($myConnection))
  );
  exit(1);
}

/* close connection */
mysqli_close($myConnection);

?>
