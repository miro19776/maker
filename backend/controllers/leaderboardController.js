const leaderboardModel = require("../models/leaderboardModel");

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await leaderboardModel.Leaderboard();
    res.json(leaderboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
};
