// Team Workout JavaScript - 6 workout plans, each a sequence of exercises
class TeamWorkoutHandler {
    constructor() {
        this.socket = io('/');
        this.peer = new Peer();
        this.myVideoStream = null;
        this.poseDetector = null;
        this.isWorkoutStarted = false;
        this.currentExerciseIndex = 0;
        this.participants = new Map();
        this.peers = {};
        this.roomID = null;
        this.workoutPlan = null;
        this.currentPlan = null;
        this.timer = null;
        this.count = 0;
        // 6 workout plans, each a sequence of your selected exercises
        this.workoutPlans = {
            'plan1': {
                name: 'Lower Body & Upper Mix',
                exercises: [
                    { name: 'Lunges', duration: 3, unit: 'min' },
                    { name: 'Push Ups', duration: 4, unit: 'min' },
                    { name: 'Hammer Curl', duration: 4, unit: 'min' }
                ]
            },
            'plan2': {
                name: 'Cardio & Arms',
                exercises: [
                    { name: 'Jumping Jacks', duration: 3, unit: 'min' },
                    { name: 'Dumbbell High Curl', duration: 4, unit: 'min' },
                    { name: 'Push Ups', duration: 4, unit: 'min' }
                ]
            },
            'plan3': {
                name: 'Full Body Strength',
                exercises: [
                    { name: 'Squats', duration: 3, unit: 'min' },
                    { name: 'Hammer Curl', duration: 4, unit: 'min' },
                    { name: 'Push Ups', duration: 4, unit: 'min' }
                ]
            },
            'plan4': {
                name: 'Endurance & Coordination',
                exercises: [
                    { name: 'Toy Robot Side', duration: 3, unit: 'min' },
                    { name: 'Lunges', duration: 4, unit: 'min' },
                    { name: 'Jumping Jacks', duration: 4, unit: 'min' }
                ]
            },
            'plan5': {
                name: 'Classic Combo',
                exercises: [
                    { name: 'Squats', duration: 3, unit: 'min' },
                    { name: 'Lunges', duration: 4, unit: 'min' },
                    { name: 'Dumbbell High Curl', duration: 4, unit: 'min' }
                ]
            },
            'plan6': {
                name: 'Power Mix',
                exercises: [
                    { name: 'Hammer Curl', duration: 3, unit: 'min' },
                    { name: 'Push Ups', duration: 4, unit: 'min' },
                    { name: 'Toy Robot Side', duration: 4, unit: 'min' }
                ]
            }
        };
    }
    async initialize(roomID, workoutPlan) {
        this.roomID = roomID;
        this.workoutPlan = workoutPlan;
        this.currentPlan = this.workoutPlans[workoutPlan] || this.workoutPlans['plan1'];
        await this.initializePoseDetection();
        this.setupSocketListeners();
        this.setupPeerListeners();
        this.updateExerciseDisplay();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            this.myVideoStream = stream;
            const myVideo = document.createElement('video');
            myVideo.muted = true;
            this.addVideo(myVideo, stream, 'me');
            this.participants.set('me', 'You');
            this.updateParticipantList();
        } catch (err) {
            alert('Unable to access camera/microphone. Please check permissions.');
        }
    }
    async initializePoseDetection() {
        try {
            const detectorConfig = {
                modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
            };
            this.poseDetector = await poseDetection.createDetector(
                poseDetection.SupportedModels.MoveNet,
                detectorConfig
            );
        } catch (error) {
            alert('Error initializing pose detector');
        }
    }
    setupSocketListeners() {
        this.peer.on('open', id => {
            this.socket.emit('joinWorkoutRoom', id, this.roomID, this.workoutPlan);
        });
        this.socket.on('userJoinedWorkout', (userId, plan) => {
            this.participants.set(userId, `Participant ${this.participants.size + 1}`);
            this.updateParticipantList();
        });
        this.socket.on('userDisconnect', (userId) => {
            if (this.peers[userId]) {
                this.peers[userId].close();
                delete this.peers[userId];
            }
            this.participants.delete(userId);
            this.updateParticipantList();
        });
        this.socket.on('roomState', (state, plan) => {
            this.isWorkoutStarted = state.isStarted;
            this.currentExerciseIndex = state.currentExercise;
            this.updateExerciseDisplay();
            this.updateControlButtons();
        });
        this.socket.on('workoutStarted', (state) => {
            this.isWorkoutStarted = true;
            this.currentExerciseIndex = state.currentExercise;
            this.updateExerciseDisplay();
            this.updateControlButtons();
            this.startTimer();
        });
        this.socket.on('workoutPaused', (state) => {
            this.isWorkoutStarted = false;
            this.updateControlButtons();
            this.pauseTimer();
        });
        this.socket.on('exerciseChanged', (state) => {
            this.currentExerciseIndex = state.currentExercise;
            this.updateExerciseDisplay();
            this.resetTimer();
            if (this.isWorkoutStarted) this.startTimer();
        });
        this.socket.on('countUpdated', (count) => {
            this.updateCount(count);
        });
        this.socket.on('poseResult', (userId, poseData) => {
            // Optionally handle pose data from other participants
        });
    }
    setupPeerListeners() {
        this.peer.on('call', call => {
            const video = document.createElement('video');
            call.answer(this.myVideoStream);
            call.on('stream', userStream => {
                this.addVideo(video, userStream, call.peer);
            });
            call.on('close', () => video.remove());
            this.peers[call.peer] = call;
        });
        this.socket.on('userJoined', id => {
            const call = this.peer.call(id, this.myVideoStream);
            const video = document.createElement('video');
            call.on('stream', userStream => {
                this.addVideo(video, userStream, id);
            });
            call.on('close', () => video.remove());
            this.peers[id] = call;
        });
    }
    addVideo(video, stream, userId) {
        video.srcObject = stream;
        video.addEventListener('loadedmetadata', () => {
            video.play();
            const container = document.createElement('div');
            container.className = 'video-container';
            const canvas = document.createElement('canvas');
            canvas.className = 'pose-canvas';
            canvas.width = 640;
            canvas.height = 480;
            const poseStatus = document.createElement('div');
            poseStatus.className = 'pose-status';
            poseStatus.textContent = 'Pose Detection Active';
            container.appendChild(video);
            container.appendChild(canvas);
            container.appendChild(poseStatus);
            document.getElementById('videoGrid').appendChild(container);
            this.processPose(video, canvas, userId);
        });
    }
    async processPose(video, canvas, userId) {
        if (!this.poseDetector || video.paused || video.ended) return;
        try {
            const poses = await this.poseDetector.estimatePoses(video);
            if (poses.length > 0) {
                const pose = poses[0];
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                pose.keypoints.forEach(keypoint => {
                    if (keypoint.score > 0.3) {
                        ctx.beginPath();
                        ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
                        ctx.fillStyle = '#00ff00';
                        ctx.fill();
                    }
                });
                this.socket.emit('poseResult', this.roomID, {
                    userId: userId,
                    keypoints: pose.keypoints,
                    score: pose.score
                });
                if (this.isWorkoutStarted) {
                    this.count++;
                    this.socket.emit('updateCount', this.roomID, this.count);
                    this.updateCount(this.count);
                }
            }
        } catch (error) {}
        requestAnimationFrame(() => this.processPose(video, canvas, userId));
    }
    updateExerciseDisplay() {
        const exercise = this.currentPlan.exercises[this.currentExerciseIndex];
        if (exercise) {
            document.getElementById('currentExercise').textContent = `${exercise.name} - ${exercise.duration} ${exercise.unit}`;
        }
    }
    updateControlButtons() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        if (this.isWorkoutStarted) {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            nextBtn.disabled = this.currentExerciseIndex >= this.currentPlan.exercises.length - 1;
            prevBtn.disabled = this.currentExerciseIndex <= 0;
        } else {
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            nextBtn.disabled = true;
            prevBtn.disabled = true;
        }
    }
    updateParticipantList() {
        const list = document.getElementById('participantList');
        if (this.participants.size === 0) {
            list.innerHTML = '<div class="loading">No participants yet...</div>';
            return;
        }
        let html = '';
        this.participants.forEach((name, id) => {
            html += `<div class="d-flex justify-content-between align-items-center mb-2">
                <span>${name}</span>
                <span class="badge bg-success">Online</span>
            </div>`;
        });
        list.innerHTML = html;
    }
    updateCount(count) {
        document.getElementById('count').textContent = `${count} reps`;
    }
    startTimer() {
        const exercise = this.currentPlan.exercises[this.currentExerciseIndex];
        if (!exercise) return;
        const duration = exercise.duration * 60;
        let timeLeft = duration;
        this.timer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            document.getElementById('timer').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            if (timeLeft <= 0) {
                clearInterval(this.timer);
                this.nextExercise();
            }
            timeLeft--;
        }, 1000);
    }
    pauseTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    resetTimer() {
        this.pauseTimer();
        document.getElementById('timer').textContent = '00:00';
        this.count = 0;
        this.updateCount(this.count);
    }
    startWorkout() {
        this.socket.emit('startWorkout', this.roomID);
    }
    pauseWorkout() {
        this.socket.emit('pauseWorkout', this.roomID);
    }
    nextExercise() {
        if (this.currentExerciseIndex < this.currentPlan.exercises.length - 1) {
            this.currentExerciseIndex++;
            this.socket.emit('nextExercise', this.roomID);
        }
    }
    prevExercise() {
        if (this.currentExerciseIndex > 0) {
            this.currentExerciseIndex--;
            this.socket.emit('prevExercise', this.roomID);
        }
    }
}
let teamWorkoutHandler;
document.addEventListener('DOMContentLoaded', async () => {
    const roomID = document.querySelector('meta[name="room-id"]')?.content;
    const workoutPlan = document.querySelector('meta[name="workout-plan"]')?.content;
    if (roomID && workoutPlan) {
        teamWorkoutHandler = new TeamWorkoutHandler();
        await teamWorkoutHandler.initialize(roomID, workoutPlan);
    }
});
function startWorkout() { if (teamWorkoutHandler) { teamWorkoutHandler.startWorkout(); } }
function pauseWorkout() { if (teamWorkoutHandler) { teamWorkoutHandler.pauseWorkout(); } }
function nextExercise() { if (teamWorkoutHandler) { teamWorkoutHandler.nextExercise(); } }
function prevExercise() { if (teamWorkoutHandler) { teamWorkoutHandler.prevExercise(); } }
function copyURL() { navigator.clipboard.writeText(location.href).then(() => { alert("Link copied to clipboard!"); }); } 