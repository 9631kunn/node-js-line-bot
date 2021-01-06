"use strict";
require("dotenv").config();

const express = require("express");
const line = require("@line/bot-sdk");
const env = process.env;
const PORT = env.PORT || 3000;

const config = {
  channelSecret: env.LINE_BOT_CHANNEL_SECRET,
  channelAccessToken: env.LINE_BOT_CHANNEL_ACCESS_TOKEN,
};

const app = express();

app.get("/", (req, res) => {
  res.send("HELLO, LINEBOT");
});
app.get("/webhook", (req, res) => {
  res.send("/webhook");
});
app.post("/webhook", line.middleware(config), (req, res) => {
  // CONSOLE USER ID
  if (req.body.destination) {
    console.log("Destination User ID: " + req.body.destination);
  }

  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((error) => {
      console.log(error);
      res.status(500).end;
    });
});

const client = new line.Client(config);

function handleEvent(event) {
  if (event.replyToken && event.replyToken.match(/^(.)\1*$/)) {
    return console.log("TEST HOOK RECEIVED: " + JSON.stringify(event.message));
  }

  switch (event.type) {
    case "message":
      const message = event.message;
      switch (message.type) {
        case "text":
          return handleText(message, event.replyToken, event.source);
        default:
          throw new Error(`UNKNOWN MESSAGE: ${JSON.stringify(message)}`);
      }
    default:
      throw new Error(`UNKNOWN MESSAGE: ${JSON.stringify(event)}`);
  }
}

function handleText(message, replyToken, source) {
  switch (message.text) {
    case "あああ":
      return client.replyMessage({
        type: "text",
        text: "あ〜ん",
      });
  }
}

app.listen(PORT);
console.log(`STARTED! ${PORT}`);
