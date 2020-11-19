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
    let generatedGameId = chance.animal().toLowerCase();

    while(games[generatedGameId] || generatedGameId.split(' ').length > 1){
      generatedGameId = chance.animal().toLowerCase();
    } 
    socket.emit('GAME', generatedGameId);
    //create game object
    games[generatedGameId] = {
      id: generatedGameId,
      host: { id: socket.id, user: data.user },
      players: [{ id:socket.id, user: data.user, score: 0,  }],
      round: 0
    };
    socket.join(generatedGameId);
    io.sockets.in(generatedGameId).emit('GAME_INFO', { gameId:generatedGameId, game:games[generatedGameId] });
    console.log(games);
    
  });
  socket.on('JOIN', ({ gameId, user }) => {
    
    console.log(gameId);
    socket.join(gameId);
    const currentPlayers = games[gameId].players;
    currentPlayers.push({ id:socket.id, user, score:0 });
    console.log(games[gameId]);
    io.sockets.in(gameId).emit('GAME_INFO', { gameId, game:games[gameId] });
  });
  socket.on('changeTrack', (track, gameId) => {
    console.log(`changeTrack ${track.name} in game: ${gameId}`);
    io.to(gameId).emit('changeTrack', track);
  });
});

io.on('connection', (socket) => {
  console.log(`A user connected on socket ${socket.id}`);
  // socket.on('changeTrack', (track, gameId) => {
  //   console.log(`changeTrack ${track.name} in game: ${gameId}`);
  //   io.sockets.in(gameId).emit('changeTrack', track);
  // });

  socket.on('playChange', (data) => {
    console.log(`playing ${data}`);
    data ? io.emit('pause', { newSong:data }) : io.emit('play', { newSong:data });
    
  });
});

app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = server;
