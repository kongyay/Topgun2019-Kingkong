const bodyParser = require('body-parser')
const request = require('request')
const express = require('express')

const config = require('../config.json')
var carou = require('./carousel.json')

const app = express()
const port = process.env.PORT || 8080
const hostname = 'localhost'
const HEADERS = {
	'Content-Type': 'application/json',
	'Authorization': 'Bearer ' + config.channelAccessToken
}

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Push
app.get('/webhook', (req, res) => {
	// push block
	let msg = "hello TESA"
	push(msg)
	res.send(msg)
})

// Reply
app.post('/webhook', (req, res) => {
	// reply block
	if (!Array.isArray(req.body.events)) {
		return res.status(500).end();
	}
	// handle events separately
	Promise.all(req.body.events.map(event => {
		// check verify webhook event
		return handleEvent(event);
	}))
	.then(() => res.end())
	.catch((err) => {
		console.error(err);
		res.status(500).end();
	});
})

function push(msg) {
	let body = JSON.stringify({
	to: config.userId,
	messages: [{
		type: 'text',
		text: msg
	}]
  })
  curl('push',body)
}

function reply(reply_token,msg) {
	let body = JSON.stringify({
	replyToken: reply_token,
	messages: [{
		type: 'text',
		text: msg
	}]
  })
  curl('reply',body)
}

function replyObj(reply_token,obj) {
	let body = JSON.stringify({
	replyToken: reply_token,
	messages: [obj]
  })
  curl('reply',body)
}

function curl(method, body) {
	request.post({
		url: 'https://api.line.me/v2/bot/message/' + method,
		headers: HEADERS,
		body: body
	}, (err, res, body) => {
		console.log('status = ' + res.statusCode)
	})
}

// callback function to handle a single event
function handleEvent(event) {
	switch (event.type) {
	  case 'message':
		const message = event.message;
		switch (message.type) {
		  case 'text':
			return handleText( event.replyToken, message);
		  case 'image':
			return handleImage( event.replyToken, message);
		  case 'video':
			return handleVideo( event.replyToken, message);
		  case 'audio':
			return handleAudio( event.replyToken, message);
		  case 'location':
			return handleLocation( event.replyToken, message);
		  case 'sticker':
			return handleSticker( event.replyToken, message);
		  default:
			throw new Error(`Unknown message: ${JSON.stringify(message)}`);
		}
  
	  case 'follow':
		return reply(event.replyToken, 'EVENT Follow');
  
	  case 'unfollow':
		return console.log(`EVENT Unfollow: ${JSON.stringify(event)}`);
  
	  case 'join':
		return reply(event.replyToken, `EVENT Join: ${event.source.type}`);
  
	  case 'leave':
		return console.log(`EVENT Leave: ${JSON.stringify(event)}`);
  
	  case 'postback':
		let data = event.postback.data;
		return reply(event.replyToken, `EVENT Postback: ${data}`);
  
	  case 'beacon':
		console.log(event.beacon.type === 'enter' ? '++++++++++':'----------',new Date(event.timestamp),`EVENT Beacon: ${JSON.stringify(event)}`);
		let payload = {
			"beacon": {
				"datetime": new Date(event.timestamp).toISOString(),
				"status": event.beacon.type
			}
		}

		var options = {
      uri: `http://${config.serverIp}/api/putSanam`,
      body: JSON.stringify(payload),
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      }
		}
		
    request(options,  function (error, response) {
			if(error) {
				console.log(error.message)
			} else {
				console.log(response.body)
				if(false===false)
					return reply(event.replyToken, 'จำนวนคนเกิน กรุณาเชิญคนออกจากบริเวณ');
			}
    });

		return reply(event.replyToken, event.beacon.type === 'enter' ? 'สวัสดีครับบบบ :)':'ไว้เจอกันใหม่นะครับบบบ :)');
		
  
	  default:
		throw new Error(`EVENT Unknown: ${JSON.stringify(event)}`);
	}
}
  
  function handleText(replyToken, message) {
	let msg = message.text.toLowerCase()
	if(message.text === 'Admin_Mon') {
		var options = {
      uri: `${config.serverIp}/getAdminMon`,
      body: {},
      method: 'GET',
      headers: {
				'Content-Type': 'application/json',
				'X-Bot-Auth' : 'D26oztwqXtn6uBGB'
      }
    }
    request(options,  function (error, res) {
			if(error) {
				return reply(replyToken,error.message)
			} else {
				if(res.status === 0) {
					let flex = carou
					flex.contents.contents[0].body.contents[0].text = `${res.temp} °C`
					flex.contents.contents[1].body.contents[0].text = `${res.humidity} 	%`
					flex.contents.contents[2].body.contents[0].contents[1].text = `${res["P-IN"]}`
					flex.contents.contents[2].body.contents[1].contents[1].text = `${res["P-OUT"]}`

					return replyObj(replyToken,flex)
				} else {
					return reply(replyToken,"ไม่อนุญาตครับบบ")
				}
				
			}
    });

	   
	}
	  
	else
	  return null;
  }
  
  function handleImage(message, replyToken) {
	return reply(replyToken, 'Got Image');
  }
  
  function handleVideo(message, replyToken) {
	return reply(replyToken, 'Got Video');
  }
  
  function handleAudio(message, replyToken) {
	return reply(replyToken, 'Got Audio');
  }
  
  function handleLocation(message, replyToken) {
	return reply(replyToken, 'Got Location');
  }
  
  function handleSticker(message, replyToken) {
	return reply(replyToken, 'Got Sticker');
  }
  

app.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`)
})