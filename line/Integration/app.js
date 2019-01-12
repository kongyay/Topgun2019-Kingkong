const bodyParser = require('body-parser')
const request = require('request')
const express = require('express')

const config = require('../config.json')
var carou = require('./carousel.json')
var predBox = require('./predictBox.json')
var about = require('./about.json')

var insideId = [

]

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
		  default:
			return null;
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
			}
		});
		
		if(event.beacon.type === 'enter' ) {
			if(insideId.indexOf(event.source.userId) < 0) {
				insideId.push(event.source.userId)
			} else {
				
			}
			
		} else if(event.beacon.type === 'leave' ) {
			let index = insideId.indexOf(event.source.userId);
			if(index > -1) {
				insideId.splice(index,1)
			} else {
				
			}
		}

		console.log(event.beacon.type === 'enter' ? '++++++++++':'----------',insideId.length,new Date(event.timestamp),`EVENT Beacon: ${JSON.stringify(event)}`);
		if(insideId.length>=2) {
			if(event.source.userId === config.userId)
				return push(`จำนวนคนเกิน กรุณาเชิญคนออกจากบริเวณ ${insideId.length}/2`);
			else
				return reply(event.replyToken,`จำนวนคนเกินกว่าที่อนุญาต กรุณาออกจากบริเวณ ${insideId.length}/2`);
		}

		return reply(event.replyToken, event.beacon.type === 'enter' ? 'สวัสดีครับบบบ :)':'ไว้เจอกันใหม่นะครับบบบ :)');
		
  
	  default:
		throw new Error(`EVENT Unknown: ${JSON.stringify(event)}`);
	}
}
  
function handleText(replyToken, message) {
	let msg = message.text.toLowerCase()
	console.log(msg)
	if(msg === 'admin_mon') {
		var options = {
      uri: `http://${config.serverIp}/api/getAdminMon`,
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
				let body = JSON.parse(res.body)
				console.log(body)
				if(body.status === 0) {
					let flex = carou
					flex.contents.contents[0].body.contents[0].text = `${body.Temperature} °C`
					flex.contents.contents[1].body.contents[0].text = `${body.Humidity} 	%`
					flex.contents.contents[2].body.contents[0].contents[1].text = `${body["P-IN"]}`
					flex.contents.contents[2].body.contents[1].contents[1].text = `${body["P-OUT"]}`

					return replyObj(replyToken,flex)
				} else {
					return reply(replyToken,"ไม่อนุญาตครับบบ")
				}
				
			}
    });

	   
	}

	else if(msg === 'beacon') {
	  return reply(replyToken,`${insideId.length}\n${insideId.join('\n')}`)
	}

	else if(msg === 'about') {
	  return replyObj(replyToken,about)
	}
	
	else if(msg === 'predict') {
		var options = {
      uri: `http://${config.serverIp}/api/predict`,
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
				let flex = predBox
				let body = JSON.parse(res.body)
				flex.contents.body.contents[0].text = body.number_of_tourist[0]
				flex.contents.body.contents[2].text = body.number_of_tourist[1]
				flex.contents.body.contents[4].text = body.number_of_tourist[2]
				return replyObj(replyToken,flex)
			}
    })

	   
	}
	  
	else
	  return null;
  }

app.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`)
})