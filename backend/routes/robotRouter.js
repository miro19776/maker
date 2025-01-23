const express = require("express");
const router = express.Router();
const robotController = require("../controllers/RobotControllers");
const leaderboardController = require("../controllers/leaderboardController");

router.get("/", robotController.getRobots);
router.post("/saveRobot", robotController.saveRobot);
router.get("/leaderboard", leaderboardController.getLeaderboard);
router.get("/:id", robotController.getRobotDetails);

module.exports = router;
