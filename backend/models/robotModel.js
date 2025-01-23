const {
  writeApi,
  queryApi,
  bucket,
  measurement,
  Point,
} = require("../utils/influxConfig");

exports.getRobots = async () => {
  const query = `from(bucket: "${bucket}") 
  |> range(start: -3d) 
  |> filter(fn: (r) => r._measurement == "${measurement}")
  |> filter(fn: (r) => r._field == "leader_name"or r._field == "robot_name" or r._field == "score" or r._field == "tempfinale")
  |> group(columns: ["robot_ID", "_field"])`;

  const result = {};

  return new Promise((resolve, reject) => {
    queryApi.queryRows(query, {
      next(row, tableMeta) {
        const rowObject = tableMeta.toObject(row);
        const robotId = rowObject.robot_ID;
        if (!result[robotId]) {
          result[robotId] = {};
        }
        result[robotId][rowObject._field] = rowObject._value;
      },
      error(error) {
        reject(error);
      },
      complete() {
        console.log("Final Result:", result);
        resolve(result);
      },
    });
  });
};

exports.getRobotById = async (id) => {
  const query = `from(bucket: "${bucket}") 
  |> range(start: -1s)
  |> filter(fn: (r) => r._measurement == "${measurement}" and r.robot_ID == "${id}")
  |> filter(fn: (r) => r._field == "score" or r._field == "challenge1" or r._field == "challenge2" or r._field == "challenge3" or r._field == "challenge4" or r._field == "challenge5" or r._field == "fin" or r._field == "disqualified" or r._field == "tempfinale")
  |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")`;

  const result = {};

  return new Promise((resolve, reject) => {
    queryApi.queryRows(query, {
      next(row, tableMeta) {
        const rowObject = tableMeta.toObject(row);
        console.log("Row Object:", rowObject);
        Object.assign(result, rowObject);
      },
      error(error) {
        console.error("Query Error:", error);
        reject(error);
      },
      complete() {
        console.log("Final Result:", result);
        resolve(result);
      },
    });
  });
};
