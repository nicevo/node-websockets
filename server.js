'use strict';

const express = require('express');
const WebSockets = require('ws');
const SocketServer = WebSockets.Server;
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });

const data = {}

let teamsAvg = {
  "team1": 0,
  "team2": 0
}

const sum = xs=> xs.reduce((p, x)=> p+x, 0)
const avg = xs=> xs.length?sum(xs)/xs.length:0
const getAverage = (data, teamId)=> avg(data.filter(d => d.team == teamId).map(d=> d.tilt))


wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
  ws.on('message', function(msg){
    const obj = JSON.parse(msg)
    data[obj.userId]=obj
    let recent = Object.values(data).filter(d => d.timestamp > (Date.now() - 10000) )
    console.log('recent data'+JSON.stringify(recent))

    teamsAvg = {
      team1: getAverage(recent,1),
      team2: getAverage(recent,2)
    }
    console.log('avg', teamsAvg)
    // console.log('client tada!', ws.clients)
    wss.clients.forEach(function each(client) {
      let cnt = 0
      if (client !== ws && client.readyState === WebSockets.OPEN) {
        console.log('client tada!', cnt)
        cnt++
        client.send(JSON.stringify({teamsAvg}));
      }
    });
  });

});

setInterval(() => {
  wss.clients.forEach((client) => {
    client.send("helloMom"+new Date().toTimeString());
  });
}, 1000);
