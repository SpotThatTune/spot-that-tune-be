const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server,
  { cors:{ origin:true } });
const chance = require('chance').Chance();
app.use(require('cors')());

app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.send({ name:'test' });
});

const games = {};

io.sockets.on('connection', socket => {
  socket.on('CREATE', data => {
    let generatedGameId = chance.animal();
    while(games[generatedGameId]) generatedGameId = chance.animal();
    socket.emit('GAME', generatedGameId);
  });
  socket.on('JOIN', data => {
    console.log(data.gameId);
    socket.join(data.gameId);
    io.sockets.in(data.gameId).emit('JOIN_SUCCESS', data.gameId);
  });
});
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('changeTrack', (track) => {
    console.log(`changeTrack ${track.name}`);
    io.emit('changeTrack', track);
  });

  socket.on('playChange', (data) => {
    console.log(`playing ${data}`);
    data ? io.emit('pause', { newSong:data }) : io.emit('play', { newSong:data });
    
  });
});

app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = server;
