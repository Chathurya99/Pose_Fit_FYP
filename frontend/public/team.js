const socket = io('/');
const peer = new Peer();

let myVideoStream;
const videoGrid = document.getElementById('videoDiv');
const myVideo = document.createElement('video');
myVideo.muted = true;

const peers = {};

navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
  myVideoStream = stream;
  addVideo(myVideo, stream);

  peer.on('call', call => {
    const video = document.createElement('video');
    call.answer(stream);
    call.on('stream', userStream => addVideo(video, userStream));
    call.on('close', () => video.remove());
    peers[call.peer] = call;
  });

  socket.on('userJoined', id => {
    const call = peer.call(id, stream);
    const video = document.createElement('video');
    call.on('stream', userStream => addVideo(video, userStream));
    call.on('close', () => video.remove());
    peers[id] = call;
  });
});

peer.on('open', id => {
  socket.emit('newUser', id, roomID);
});

socket.on('userDisconnect', id => {
  if (peers[id]) peers[id].close();
});

function addVideo(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => video.play());
  videoGrid.append(video);
}