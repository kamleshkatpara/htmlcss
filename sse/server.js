const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(bodyParser.json());
app.use(cors());

let clients = [];
let messages = [];  // Store message history

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res
  };

  clients.push(newClient);

  // Send message history to the newly connected client
  messages.forEach(message => res.write(`data: ${JSON.stringify(message)}\n\n`));

  req.on('close', () => {
    clients = clients.filter(client => client.id !== clientId);
  });
});

app.post('/message', (req, res) => {
  const { username, message } = req.body;
  const messageData = { username, message };
  messages.push(messageData); // Add new message to history
  clients.forEach(client => client.res.write(`data: ${JSON.stringify(messageData)}\n\n`));
  res.status(200).send();
});

app.listen(8080, () => {
  console.log('Server running on http://localhost:8080');
});
