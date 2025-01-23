require("dotenv").config({ path: "../.env" });
const { writeApi, Point } = require("../utils/influxConfig.js");
const { v4: uuidv4 } = require("uuid");

writeApi.useDefaultTags({ source: "nodejs-client" });

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

writeApi.useDefaultTags({ source: "nodejs-client" });

const filePath = path.join(__dirname, "../data/leaderboard.csv");

const readCSVFile = async () => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        console.log("CSV file successfully processed");
        console.log(results);
        resolve(results);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};
console.log("Reading CSV file...");

const processCSVData = async () => {
  try {
    const data = await readCSVFile();
    data.forEach((row, index) => {
      const fields = {
        robot_ID: parseInt(index + 1),
        leader_name: row.Leader_name,
        robot_name: row.Robot_name,
        score: parseInt(row.Max_Points, 10),
        weight: parseInt(row.Weight, 10),
        TotalHomPoints: parseInt(row.TotalHomPoint, 10),
        challenge1: parseInt(0),
        challenge2: parseInt(0),
        challenge3: parseInt(0),
        challenge4: parseInt(0),
        challenge5: parseInt(0),
        fin: parseInt(0),
        disqualified: parseInt(0),
        tempfinale: parseInt(row.Time, 10),
      };

      console.log(`Processing row with ID: ${index}`);
      console.log(fields);
      const point = new Point(process.env.INFLUX_MEASUREMENT)
        .tag("robot_ID", fields.robot_ID)
        .stringField("leader_name", fields.leader_name)
        .stringField("robot_name", fields.robot_name)
        .intField("score", fields.score)
        .intField("weight", fields.weight)
        .intField("TotalHomPoints", fields.TotalHomPoints)
        .intField("challenge1", fields.challenge1)
        .intField("challenge2", fields.challenge2)
        .intField("challenge3", fields.challenge3)
        .intField("challenge4", fields.challenge4)
        .intField("challenge5", fields.challenge5)
        .intField("fin", fields.fin)
        .intField("disqualified", fields.disqualified)
        .intField("tempfinale", fields.tempfinale)
        .timestamp(new Date());
      writeApi.writePoint(point);
    });
    await writeApi
      .flush()
      .then(() => {
        console.log("All points flushed to InfluxDB.");
      })
      .catch((err) => {
        console.error("Error flushing points:", err);
      })
      .finally(() => {
        writeApi.close().then(() => {
          console.log("Write API closed successfully.");
        });
      });
  } catch (error) {
    console.error("Error processing CSV data:", error);
  }
};

processCSVData();
