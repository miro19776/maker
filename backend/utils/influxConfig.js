require("dotenv").config({ path: "../.env" });
const { InfluxDB, Point } = require("@influxdata/influxdb-client");

console.log("INFLUX_URL:", process.env.INFLUXDB_URL);
console.log("INFLUX_TOKEN:", process.env.INFLUXDB_TOKEN);
console.log("INFLUX_ORG:", process.env.INFLUX_ORG);
console.log("INFLUX_BUCKET:", process.env.INFLUX_BUCKET);

const url = process.env.INFLUXDB_URL;
const token = process.env.INFLUXDB_TOKEN;
const org = process.env.INFLUX_ORG;
const bucket = process.env.INFLUX_BUCKET;
const measurement = process.env.INFLUX_MEASUREMENT;

const influxDB = new InfluxDB({ url, token });
const queryApi = influxDB.getQueryApi(org);
const writeApi = influxDB.getWriteApi(org, bucket);

module.exports = {
  writeApi,
  queryApi,
  bucket,
  measurement,
  Point,
};
