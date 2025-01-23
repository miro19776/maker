const fs = require("fs");
const path = require("path");

exports.Leaderboard = async () => {
  const filePath = path.join(__dirname, "../data/SavedRobots.json");

  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        return reject(err);
      }

      try {
        const result = JSON.parse(data);
        const roundOne = result.roundOne || {};
        const roundTwo = result.roundTwo || {};
        resolve({ roundOne, roundTwo });
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
};
