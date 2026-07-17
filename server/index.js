const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

const server = http.createServer(app);

app.use(cors());

const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "rooms.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load persisted room data
let rooms = {};
try {
  if (fs.existsSync(DATA_FILE)) {
    const fileContent = fs.readFileSync(DATA_FILE, "utf8");
    const persistedData = JSON.parse(fileContent || "{}");
    Object.keys(persistedData).forEach((roomName) => {
      rooms[roomName] = {
        elements: persistedData[roomName] || [],
        users: {},
      };
    });
    console.log("Whiteboard data loaded successfully.");
  }
} catch (error) {
  console.error("Error loading persisted whiteboard data:", error);
}

const saveWhiteboards = () => {
  try {
    const dataToSave = {};
    Object.keys(rooms).forEach((roomName) => {
      // Only save elements, exclude active users
      dataToSave[roomName] = rooms[roomName].elements;
    });
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2), "utf8");
  } catch (error) {
    console.error("Error saving whiteboard data:", error);
  }
};

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  let currentRoom = null;

  socket.on("join-room", ({ room, nickname, color }) => {
    if (!room || !nickname) return;
    
    currentRoom = room;
    socket.join(room);
    
    // Initialize room if it doesn't exist
    if (!rooms[room]) {
      rooms[room] = {
        elements: [],
        users: {},
      };
    }
    
    // Add user details
    rooms[room].users[socket.id] = { nickname, color };
    console.log(`User ${nickname} (${socket.id}) joined room: ${room}`);

    // 1. Emit current board state to the newly joined user
    socket.emit("whiteboard-state", rooms[room].elements);

    // 2. Broadcast updated collaborator list to all users in room
    io.to(room).emit("collaborator-list", rooms[room].users);
  });

  socket.on("element-update", (elementData) => {
    if (!currentRoom || !rooms[currentRoom]) return;
    
    updateElementInRoom(currentRoom, elementData);

    // Broadcast only to other users in the room
    socket.to(currentRoom).emit("element-update", elementData);
    
    // Save state
    saveWhiteboards();
  });

  socket.on("whiteboard-clear", () => {
    if (!currentRoom || !rooms[currentRoom]) return;
    
    rooms[currentRoom].elements = [];
    socket.to(currentRoom).emit("whiteboard-clear");
    
    saveWhiteboards();
  });

  socket.on("cursor-position", (cursorData) => {
    if (!currentRoom) return;
    
    socket.to(currentRoom).emit("cursor-position", {
      ...cursorData,
      userId: socket.id,
    });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    
    if (currentRoom && rooms[currentRoom]) {
      // Remove from room's user list
      delete rooms[currentRoom].users[socket.id];
      
      // Notify other users in room
      io.to(currentRoom).emit("collaborator-list", rooms[currentRoom].users);
      socket.to(currentRoom).emit("user-disconnected", socket.id);
    }
  });
});

const updateElementInRoom = (room, elementData) => {
  const elements = rooms[room].elements;
  const index = elements.findIndex((element) => element.id === elementData.id);

  if (index === -1) {
    elements.push(elementData);
  } else {
    elements[index] = elementData;
  }
};

app.get("/", (req, res) => {
  res.send("Hello, Collaborative Whiteboard Server is working!");
});

const PORT = process.env.PORT || 3003;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
