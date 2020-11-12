const app = require('./lib/app');
const pool = require('./lib/utils/pool');

const PORT = process.env.PORT || 7890;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Started on ${PORT}`);
});

process.on('exit', () => {
  console.log('Goodbye!');
  pool.end();
});

// const http = require('http').createServer();

// const io = require('socket.io')(http);
 
// let count = 0;
 
// io.on('connection', socket => {
//   socket.emit('UPDATED_COUNT', count);
 
//   socket.on('INCREMENT', () => {
//     count++;
//     socket.emit('UPDATED_COUNT', count);
//     socket.broadcast.emit('UPDATED_COUNT', count);
//   });
 
//   socket.on('DECREMENT', () => {
//     count--;
//     socket.emit('UPDATED_COUNT', count);
//     socket.broadcast.emit('UPDATED_COUNT', count);
//   });
// });
 
// http.listen(7890);
