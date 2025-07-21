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

// Store active rooms and their workout plans
const activeRooms = new Map();

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

// New route for team workout with specific workout plan
app.get('/team/:room/:workoutPlan', (req, res) => {
  const { room, workoutPlan } = req.params;
  res.render('team-workout', { 
    RoomId: room, 
    WorkoutPlan: workoutPlan 
  });
});

app.use('/api', require('./routes/UserRoute'));
app.use('/exercise', require('./routes/ExerciseRoute'));
app.use('/email', require('./routes/EmailRoute'));
app.use('/challenge', require('./routes/ChallengeRoute'));

// Socket.IO with enhanced workout plan support
io.on('connection', socket => {
  socket.on('newUser', (userId, roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('userJoined', userId);

    socket.on('disconnect', () => {
      socket.to(roomId).emit('userDisconnect', userId);
    });
  });

  // Handle workout plan synchronization
  socket.on('joinWorkoutRoom', (userId, roomId, workoutPlan) => {
    socket.join(roomId);
    
    // Store room info
    if (!activeRooms.has(roomId)) {
      activeRooms.set(roomId, {
        workoutPlan,
        participants: new Set(),
        workoutState: {
          isStarted: false,
          currentExercise: 0,
          timer: null,
          count: 0
        }
      });
    }
    
    const room = activeRooms.get(roomId);
    room.participants.add(userId);
    
    // Notify others in the room
    socket.to(roomId).emit('userJoinedWorkout', userId, workoutPlan);
    
    // Send current room state to the new user
    socket.emit('roomState', room.workoutState, workoutPlan);
    
    socket.on('disconnect', () => {
      if (room.participants.has(userId)) {
        room.participants.delete(userId);
        socket.to(roomId).emit('userDisconnect', userId);
        
        // Clean up room if empty
        if (room.participants.size === 0) {
          activeRooms.delete(roomId);
        }
      }
    });
  });

  // Handle workout control events
  socket.on('startWorkout', (roomId) => {
    const room = activeRooms.get(roomId);
    if (room) {
      room.workoutState.isStarted = true;
      room.workoutState.currentExercise = 0;
      room.workoutState.count = 0;
      io.to(roomId).emit('workoutStarted', room.workoutState);
    }
  });

  socket.on('pauseWorkout', (roomId) => {
    const room = activeRooms.get(roomId);
    if (room) {
      room.workoutState.isStarted = false;
      io.to(roomId).emit('workoutPaused', room.workoutState);
    }
  });

  // Only the server advances the exercise for all
  socket.on('nextExercise', (roomId) => {
    const room = activeRooms.get(roomId);
    if (room) {
      room.workoutState.currentExercise++;
      io.to(roomId).emit('exerciseChanged', room.workoutState);
    }
  });
  socket.on('prevExercise', (roomId) => {
    const room = activeRooms.get(roomId);
    if (room) {
      if (room.workoutState.currentExercise > 0) {
        room.workoutState.currentExercise--;
        io.to(roomId).emit('exerciseChanged', room.workoutState);
      }
    }
  });

  socket.on('updateCount', (roomId, count) => {
    const room = activeRooms.get(roomId);
    if (room) {
      room.workoutState.count = count;
      socket.to(roomId).emit('countUpdated', count);
    }
  });

  // Handle pose estimation results
  socket.on('poseResult', (roomId, poseData) => {
    socket.to(roomId).emit('poseResult', socket.id, poseData);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));