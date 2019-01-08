'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const config = require('../config.json');
const replyObject = require('./reply.json');
var bodyParser = require('body-parser');
const uuid = require('uuid');
const client = new line.Client(config);
const app = express();

const sessionId = uuid.v4();

var request = require('request')

app.get('/push', function (req, res) {
  let msg = req.params.msg;
  client.pushMessage(config.userId,{
		type: 'text',
		text: msg
	})
  res.send(msg);
});


// webhook callback
app.post('/webhook', line.middleware(config), (req, res) => {
  // req.body.events should be an array of events
  if (!Array.isArray(req.body.events)) {
    return res.status(500).end();
  }
  // handle events separately
  Promise.all(req.body.events.map(event => {
    console.log('event', event);
    // check verify webhook event
    if (event.replyToken === '00000000000000000000000000000000' ||
      event.replyToken === 'ffffffffffffffffffffffffffffffff') {
      return;
    }
    return handleEvent(event);
  }))
    .then(() => res.end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// simple reply function
const replyText = (token, texts) => {
  texts = Array.isArray(texts) ? texts : [texts];
  return client.replyMessage(
    token,
    texts.map((text) => ({ type: 'text', text }))
  );
};
const replyObj = (token, obj) => {
  return client.replyMessage(
    token,
    obj
  );
};


// callback function to handle a single event
function handleEvent(event) {
  switch (event.type) {
    case 'message':
      const message = event.message;
      switch (message.type) {
        case 'text':
          return handleText(message, event.replyToken);
        case 'image':
          return handleImage(message, event.replyToken);
        case 'video':
          return handleVideo(message, event.replyToken);
        case 'audio':
          return handleAudio(message, event.replyToken);
        case 'location':
          return handleLocation(message, event.replyToken);
        case 'sticker':
          return handleSticker(message, event.replyToken);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }

    case 'follow':
      return replyText(event.replyToken, 'EVENT Follow');

    case 'unfollow':
      return console.log(`EVENT Unfollow: ${JSON.stringify(event)}`);

    case 'join':
      return replyText(event.replyToken, `EVENT Join: ${event.source.type}`);

    case 'leave':
      return console.log(`EVENT Leave: ${JSON.stringify(event)}`);

    case 'postback':
      let data = event.postback.data;
      return replyText(event.replyToken, `EVENT Postback: ${data}`);

    case 'beacon':
      const dm = `${Buffer.from(event.beacon.dm || '', 'hex').toString('utf8')}`;
      return replyText(event.replyToken, `EVENT Beacon: ${event.beacon.type} beacon hwid : ${event.beacon.hwid} with device message = ${dm}`);

    default:
      throw new Error(`EVENT Unknown: ${JSON.stringify(event)}`);
  }
}

function handleText(message, replyToken) {
  let msg = message.text.toLowerCase()
  if(message.text.toLowerCase().match(/(บอท|Bot)/)) {
    msg = msg.replace(/(บอท|Bot)/,"");
    console.log("MESSAGE FOR DF:",msg)
    var clientServerOptions = {
      uri: 'https://api.dialogflow.com/v1/query',
      body: JSON.stringify({
          "query": msg,
          "sessionId": sessionId,
          "lang": "th-TH"
      }),
      method: 'POST',
      headers: {
          'Content-Type': 'application/json;charset=utf-8',
          'Authorization': 'Bearer ' + config.clientAccess
      }
    }
    request(clientServerOptions, function (error, response) {
        let body = JSON.parse(response.body);
        return replyObj(replyToken, replyObject[body.result.action] || { 'type':'text','text':body.result.speech });
    });
    
  }
    
  else
    return null;
}

function handleImage(message, replyToken) {
  return replyText(replyToken, 'Got Image');
}

function handleVideo(message, replyToken) {
  return replyText(replyToken, 'Got Video');
}

function handleAudio(message, replyToken) {
  return replyText(replyToken, 'Got Audio');
}

function handleLocation(message, replyToken) {
  return replyText(replyToken, 'Got Location');
}

function handleSticker(message, replyToken) {
  return replyText(replyToken, 'Got Sticker');
}

const port = config.port;

app.use(bodyParser.json())
app.listen(port, () => {
  console.log(`=== LINE Bot on port: ${port} ===`);
});
