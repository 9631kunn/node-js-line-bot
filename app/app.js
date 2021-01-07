"use strict";
require("dotenv").config();

const express = require("express");
const line = require("@line/bot-sdk");
const env = process.env;
const PORT = env.PORT || 3000;
const db = require("../db/db");

const config = {
  channelSecret: env.LINE_BOT_CHANNEL_SECRET,
  channelAccessToken: env.LINE_BOT_CHANNEL_ACCESS_TOKEN,
};

const app = express();

app.get("/", (req, res) => {
  const param = { test_data: "This is sample API" };
  res.header("Content-Type", "application/json; charset=utf-8");
  res.send(param);
});
app.get("/db", (req, res, next) => {
  db.pool.connect((error, client) => {
    if (error) {
      console.log(error);
      return;
    }
    client.query("SELECT name, hands FROM rank", (error, result) => {
      console.log(result.rows);
    });
  });
  res.send({ title: "hello express & postgre" });
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
      throw new Error(`UNKNOWN EVENT: ${JSON.stringify(event)}`);
  }
}

const InsertDb = (token) => {
  const query = "INSERT INTO messages (messages) VALUES ($1)";
  db.pool.connect((error, client) => {
    if (error) {
      console.log(error);
      return;
    }
    client.query(query, (error, result) => {
      console.log(result.rows);
    });
  });
  return replyText(token, "格納しました");
};

const replyText = (token, texts) => {
  texts = Array.isArray(texts) ? texts : [texts];
  return client.replyMessage(
    token,
    texts.map((text) => ({ type: "text", text }))
  );
};

function handleText(message, replyToken, source) {
  switch (message.text) {
    case "プロフィール":
      if (source.userId) {
        return client
          .getProfile(source.userId)
          .then((profile) =>
            replyText(replyToken, [
              `表示名: ${profile.displayName}`,
              `カッケぇ〜一言: ${profile.statusMessage}`,
            ])
          );
      } else {
        return replyText(replyToken, "あ〜ん、取得できないよ〜");
      }
    case "あああ":
      return replyText(replyToken, "あ〜ん");
    case "test":
      return replyText(replyToken, "テスト");
    case "db格納":
      return InsertDb(replyToken);
    default:
      replyText(replyToken, message.text);
  }
}

app.listen(PORT);
console.log(`STARTED! ${PORT}`);
