const { Server } = require("socket.io");
const { getRobotById } = require("./models/robotModel");
let io;

const initSocket = (server) => {
  io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("getRobotDetails", async (robotId) => {
      try {
        console.log(`Fetching details for robot ID: ${robotId}`);
        const robotDetails = await getRobotById(robotId);
        socket.emit("robotDetails", robotDetails);
        console.log(`Sent details for robot ID: ${robotId}`);
      } catch (error) {
        console.error(`Error fetching robot details for ${robotId}:`, error);
        socket.emit("error", { message: "Error fetching robot details" });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

const emitUpdate = (event, data) => {
  if (io) {
    console.log(`Emitting event: ${event}`);
    io.emit(event, data);
  }
};

module.exports = { initSocket, emitUpdate };
