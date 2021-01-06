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

async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  let reply = "";
  if (event.message.text === "test") {
    reply = "あああ";
  } else {
    reply = "うんこ";
  }

  return client.replyMessage(event.replyToken, {
    type: "text",
    text: reply,
  });
}

app.listen(PORT);
console.log(`STARTED! ${PORT}`);
