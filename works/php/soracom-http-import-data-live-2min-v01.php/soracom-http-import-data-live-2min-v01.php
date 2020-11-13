<?php
//Record - 0min - Measure1

//Make sure that it is a POST request.
if(strcasecmp($_SERVER['REQUEST_METHOD'], 'POST') != 0){
throw new Exception('Request method must be POST!');
}

//Make sure that the content type of the POST request has been set to application/json
$contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
if(strcasecmp($contentType, 'application/x-www-form-urlencoded') != 0){
throw new Exception('Content type must be: application/json');
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
$servername = "192.168.35.2";
$username = "map16sqlsys";
$password = "(oM8rQu7";
$dbname = "map16_sus_live_sensor_db";

$myConnection= mysqli_connect($servername,$username,$password,$dbname) or die ("could not connect to mysql"); 

$measure0 = $decoded['Data'][0]['Distance'];
$voltage0 = $decoded['Data'][0]['Battery'];
$measure1 = $decoded['Data'][1]['Distance'];
$voltage1 = $decoded['Data'][1]['Battery'];
$measure2 = $decoded['Data'][2]['Distance'];
$voltage2 = $decoded['Data'][2]['Battery'];
$measure3 = $decoded['Data'][3]['Distance'];
$voltage3 = $decoded['Data'][3]['Battery'];
$measure4 = $decoded['Data'][4]['Distance'];
$voltage4 = $decoded['Data'][4]['Battery'];
$measure5 = $decoded['Data'][5]['Distance'];
$voltage5 = $decoded['Data'][5]['Battery'];
$measure6 = $decoded['Data'][6]['Distance'];
$voltage6 = $decoded['Data'][6]['Battery'];
$measure7 = $decoded['Data'][7]['Distance'];
$voltage7 = $decoded['Data'][7]['Battery'];
$measure8 = $decoded['Data'][8]['Distance'];
$voltage8 = $decoded['Data'][8]['Battery'];
$measure9 = $decoded['Data'][9]['Distance'];
$voltage9 = $decoded['Data'][9]['Battery'];
$measure10 = $decoded['Data'][10]['Distance'];
$voltage10 = $decoded['Data'][10]['Battery'];
$measure11 = $decoded['Data'][11]['Distance'];
$voltage11= $decoded['Data'][11]['Battery'];
$measure12 = $decoded['Data'][12]['Distance'];
$voltage12 = $decoded['Data'][12]['Battery'];
$measure13 = $decoded['Data'][13]['Distance'];
$voltage13 = $decoded['Data'][13]['Battery'];
$measure14 = $decoded['Data'][14]['Distance'];
$voltage14 = $decoded['Data'][14]['Battery'];
$measure15 = $decoded['Data'][15]['Distance'];
$voltage15 = $decoded['Data'][15]['Battery'];
$measure16 = $decoded['Data'][16]['Distance'];
$voltage16 = $decoded['Data'][16]['Battery'];
$measure17 = $decoded['Data'][17]['Distance'];
$voltage17 = $decoded['Data'][17]['Battery'];
$measure18 = $decoded['Data'][18]['Distance'];
$voltage18 = $decoded['Data'][18]['Battery'];
$measure19 = $decoded['Data'][19]['Distance'];
$voltage19 = $decoded['Data'][19]['Battery'];
$measure20 = $decoded['Data'][20]['Distance'];
$voltage20 = $decoded['Data'][20]['Battery'];
$measure21 = $decoded['Data'][21]['Distance'];
$voltage21 = $decoded['Data'][21]['Battery'];
$measure22 = $decoded['Data'][22]['Distance'];
$voltage22 = $decoded['Data'][22]['Battery'];
$measure23 = $decoded['Data'][23]['Distance'];
$voltage23 = $decoded['Data'][23]['Battery'];
$measure24 = $decoded['Data'][24]['Distance'];
$voltage24 = $decoded['Data'][24]['Battery'];
$measure25 = $decoded['Data'][25]['Distance'];
$voltage25 = $decoded['Data'][25]['Battery'];
$measure26 = $decoded['Data'][26]['Distance'];
$voltage26 = $decoded['Data'][26]['Battery'];
$measure27 = $decoded['Data'][27]['Distance'];
$voltage27 = $decoded['Data'][27]['Battery'];
$measure28 = $decoded['Data'][28]['Distance'];
$voltage28 = $decoded['Data'][28]['Battery'];
$measure29 = $decoded['Data'][29]['Distance'];
$voltage29 = $decoded['Data'][29]['Battery'];
$rssi = $decoded['RSSI'];
$imei = $decoded['IMEI'];
$iccid = $decoded['ICCID'];
$network = $decoded['Network'];

$sqlCommand="
INSERT INTO 
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

VALUES
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'1',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 3527 SECOND),
'$measure0',
'$voltage0',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'2',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 3406 SECOND),
'$measure1',
'$voltage1',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'3',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 3285 SECOND),
'$measure2',
'$voltage2',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'4',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 3164 SECOND),
'$measure3',
'$voltage3',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'5',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 3043 SECOND),
'$measure4',
'$voltage4',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'6',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 2922 SECOND),
'$measure5',
'$voltage5',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'7',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 2801 SECOND),
'$measure6',
'$voltage6',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'8',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 2680 SECOND),
'$measure7',
'$voltage7',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'9',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 2559 SECOND),
'$measure8',
'$voltage8',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'10',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 2438 SECOND),
'$measure9',
'$voltage9',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'11',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 2317 SECOND),
'$measure10',
'$voltage10',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'12',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 2196 SECOND),
'$measure11',
'$voltage11',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'13',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 2075 SECOND),
'$measure12',
'$voltage12',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'14',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 1954 SECOND),
'$measure13',
'$voltage13',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'15',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 1833 SECOND),
'$measure14',
'$voltage14',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'16',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 1712 SECOND),
'$measure15',
'$voltage15',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'17',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 1591 SECOND),
'$measure16',
'$voltage16',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'18',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 1470 SECOND),
'$measure17',
'$voltage17',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'19',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 1349 SECOND),
'$measure18',
'$voltage18',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'20',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 1228 SECOND),
'$measure19',
'$voltage19',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'21',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 1107 SECOND),
'$measure20',
'$voltage20',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'22',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 986 SECOND),
'$measure21',
'$voltage21',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'23',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 865 SECOND),
'$measure22',
'$voltage22',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'24',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 744 SECOND),
'$measure23',
'$voltage23',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'25',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 623 SECOND),
'$measure24',
'$voltage24',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'26',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 502 SECOND),
'$measure25',
'$voltage25',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'27',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 381 SECOND),
'$measure26',
'$voltage26',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'28',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 260 SECOND),
'$measure27',
'$voltage27',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'29',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 139 SECOND),
'$measure28',
'$voltage28',
'$rssi',
'$network'),
(
'map16-uu-ultrasonic-live-4G',
'$imei',
'$iccid',
'30',
NOW(),
DATE_SUB(current_timestamp, INTERVAL 18 SECOND),
'$measure29',
'$voltage29',
'$rssi',
'$network')
";

$query=mysqli_query($myConnection, $sqlCommand) or die(mysql_error()) 

?>

<?php

//Make sure that it is a POST request.
if(strcasecmp($_SERVER['REQUEST_METHOD'], 'POST') != 0){
    throw new Exception('Request method must be POST!');
}
 
//Make sure that the content type of the POST request has been set to application/json
$contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
if(strcasecmp($contentType, 'application/x-www-form-urlencoded') != 0){
    throw new Exception('Content type must be: application/json');
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
$servername = "192.168.35.2";
$username = "map16sqlsys";
$password = "(oM8rQu7";
$dbname = "map16_sus_live_sensor_db";

$myConnection= mysqli_connect($servername,$username,$password,$dbname) or die ("could not connect to mysql"); 

$measure = $decoded['Data'][0]['Distance'];
$voltage = $decoded['Data'][0]['Battery'];
$rssi = $decoded['RSSI'];
$imei = $decoded['IMEI'];
$iccid = $decoded['ICCID'];
$network = $decoded['Network'];

$sqlCommand="
UPDATE
4g_flood_sensor_data_live
SET
imei = '$imei',
date_id = now(),
measure = '$measure',
voltage = '$voltage',
rssi = '$rssi',
network = '$network'
WHERE 
iccid = '$iccid' AND date_id <> now()

";

$query=mysqli_query($myConnection, $sqlCommand) or die(mysql_error()) 

?>

