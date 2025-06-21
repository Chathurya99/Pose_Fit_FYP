// === backend/index.js ===
const express = require('express');
const session = require('express-session');
const app = express();
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const conn = require('./config/db');
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, '../frontend/public')));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// DB Connect
conn.connectDB();

// PeerJS
const peerServer = ExpressPeerServer(server, { debug: true });
app.use('/peerjs', peerServer);

// Routes
app.get('/', (req, res) => res.send('API Running'));

app.get('/test_api', async function (req, res) {
  await connection.query('SELECT * from users', async function (error, results) {
    if (error) {
      res.status(500).send(error.code);
    } else {
      res.status(200).json(results);
    }
  });
});

app.get('/create-room', (req, res) => {
  const roomId = uuidv4();
  res.json({ roomId });
});

app.get('/:room', (req, res) => {
  res.render('class', { RoomId: req.params.room });
});

app.use('/api', require('./routes/UserRoute'));
app.use('/exercise', require('./routes/ExerciseRoute'));
app.use('/email', require('./routes/EmailRoute'));

// Socket.IO
io.on('connection', socket => {
  socket.on('newUser', (userId, roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('userJoined', userId);

    socket.on('disconnect', () => {
      socket.to(roomId).emit('userDisconnect', userId);
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));