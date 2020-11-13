USE soracom;
CREATE TABLE 4g_flood_sensor_data_store (
    app_id VARCHAR (100),
    imei VARCHAR (100),
    iccid VARCHAR (100),
    packet_number INTEGER,
    data_send_time DATETIME,
    date_id TIMESTAMP,
    measure FLOAT,
    voltage FLOAT,
    rssi VARCHAR (100),
    network VARCHAR (100)
);

CREATE TABLE 4g_flood_sensor_data_live (
    app_id VARCHAR (100),
    imei VARCHAR (100),
    iccid VARCHAR (100),
    packet_number INTEGER,
    data_send_time DATETIME,
    date_id TIMESTAMP,
    measure FLOAT,
    voltage FLOAT,
    rssi INTEGER,
    network VARCHAR (100)
)

INSERT INTO 4g_flood_sensor_data_live (
    app_id,
    iccid,
    network
)
VALUES (
    'map16-uu-ultrasonic-live-4G',
    '8942310220000538243F',
    'HSPA+TE'
)
