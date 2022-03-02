const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");

let sockets = {};

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.static(path.join(__dirname + "/videos")));

app.get("/", (req, res) => {
  res.send("HELLoo");
});

io.on("connection", (socket) => {
  socket.on("new-socket", (data) => {
    if (!sockets[socket.id]) {
      sockets[socket.id] = {
        socketId: socket.id,
        userId: data.id,
        blobs: [],
      };
      // fs se folder create karna hai user ki Id pe on connect
      console.log(sockets);
      fs.mkdirSync("videos/" + data.id);
    }
  });

  socket.on("disconnect", () => {
    const userId = Object.values(sockets).map((eachSocketValues) => {
      if (eachSocketValues.socketId === socket.id) {
        return sockets[socket.id];
      }
    });
    delete sockets[socket.id];
    console.log(sockets);
  });

  socket.on("take-blob", (data) => {
    // yaha pe user id bhi ajayga
    // write file sync m User id ko as a folder leke
    fs.writeFileSync(
      `videos/${data.userId}/video-${socket.id}-${Date.now()}.mp4`,
      data.blob
    );
  });
});

server.listen(8000, () => console.log("Socket server listening on port 8000"));
