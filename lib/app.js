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
      round: 0,
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

  socket.on('CHANGE_TRACK', (track, gameId) => {
    console.log(`CHANGE_TRACK ${track.name} in game: ${gameId}`);
    io.to(gameId).emit('CHANGE_TRACK', track);
  });

  socket.on('PLAY_CHANGE', (playing, gameId) => {
    io.to(gameId).emit(playing ? 'PAUSE' : 'PLAY');
  });

  socket.on('GUESS', ({ userGuess, user, gameId, playerId }) => {
    console.log(userGuess,);
    io.to(gameId).emit('PAUSE');
    io.to(gameId).emit('GUESS', { userGuess, user, playerId });
  }
  );
  socket.on('CORRECT', ({ playerId, gameId }) => {
    const newPlayers = games[gameId].players.map(player => {
      if(player.id === playerId) player.score++;
      return player;
    });

    games[gameId].players = newPlayers;
    games[gameId].host = newPlayers.find(player => player.id === playerId);

    io.to(gameId).emit('CORRECT');
    if(games[gameId].round < 5) {
      games[gameId].round = games[gameId].round + 1;
    } else {
      io.to(gameId).emit('WINNER');
    }
    io.to(gameId).emit('GAME_INFO', { gameId, game:games[gameId] });
  });
  socket.on('disconnect', () => {
    console.log(socket.id + ' disconnected');
    
    for(const game in games){
      console.log(games[game]);
      if(games[game]){
        const currentPlayers = games[game].players.filter(player => player.id !== socket.id);
        if(currentPlayers.length === 0) {
          delete games[game];
        } else {
          if(games[game].host.id === socket.id) games[game].host = currentPlayers[0];
          games[game].players = currentPlayers;
          io.to(game).emit('GAME_INFO', { gameId:game, game:games[game] });
        }
        
      }
      
      console.log(games);
    }

  });
});

app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = server;
