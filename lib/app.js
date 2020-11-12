const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server,
  { cors:{ origin:true } });

app.use(require('cors')());

app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.send({ name:'test' });
});

const users = [];
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('setSongUrl', (data) => {
    console.log(`setSongUrl ${data}`);
    io.emit('songEvent', { newSong:data });
  });

  socket.on('playChange', (data) => {
    console.log(`playing ${data}`);
    data ? io.emit('pause', { newSong:data }) : io.emit('play', { newSong:data });
    
  });
});

app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = server;
