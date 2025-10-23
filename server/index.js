// server/index.js
const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  const rooms = {};

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] New connection: ${socket.id}`);

    // This is now the single, unified handler for anyone joining a room.
    socket.on('join-room', ({ roomId, playerName, isHost }) => {
      
      // --- THE DEFINITIVE FIX IS HERE ---
      // 1. If the user is the host and the room doesn't exist yet, CREATE IT.
      if (isHost && !rooms[roomId]) {
        rooms[roomId] = { players: [] };
        console.log(`[Socket.IO] Room ${roomId} created by host ${playerName}`);
      }

      // 2. NOW, check if the room exists. For a host, it will always exist.
      // For a joining player, this is the validation step.
      if (!rooms[roomId]) {
        console.log(`[Socket.IO] Join failed: Room ${roomId} not found.`);
        socket.emit('error', 'Room not found');
        return; // Stop execution if room doesn't exist
      }

      // 3. Add the player to the room if they are not already in it.
      const playerExists = rooms[roomId].players.some(p => p.id === socket.id);
      if (!playerExists) {
        rooms[roomId].players.push({ id: socket.id, name: playerName });
        console.log(`[Socket.IO] Player ${playerName} (${socket.id}) joined room ${roomId}`);
      }
      
      socket.join(roomId);
      // 4. Always broadcast the latest, correct player list to everyone.
      io.to(roomId).emit('update-players', rooms[roomId].players);
    });

    socket.on('chat-message', (payload) => {
      if (payload && payload.roomId) {
        io.to(payload.roomId).emit('new-chat-message', payload);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Connection closed: ${socket.id}`);
      for (const roomId in rooms) {
        const playerIndex = rooms[roomId].players.findIndex(p => p.id === socket.id);
        if (playerIndex !== -1) {
          rooms[roomId].players.splice(playerIndex, 1);
          io.to(roomId).emit('update-players', rooms[roomId].players);
          if (rooms[roomId].players.length === 0) {
            delete rooms[roomId];
          }
          break;
        }
      }
    });
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});