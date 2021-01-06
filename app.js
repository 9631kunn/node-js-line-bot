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
app.post("/webhook", line.middleware(config), (req, res) => {
  console.log(req.body.events);
  if (
    req.body.events[0].replyToken === "00000000000000000000000000000000" &&
    req.body.events[1].replyToken === "ffffffffffffffffffffffffffffffff"
  ) {
    res.send("Hello LINE BOT!(POST)");
    console.log("疎通確認");
    return;
  }
  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result)
  );
});

const client = new line.Client(config);

async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  return client.replyMessage(event.replyToken, {
    type: "text",
    text: event.message.text,
  });
}

app.listen(PORT, console.log(`STARTED! ${env.URL}:${PORT}`));
