//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var request = require("request");
var express = require('express');
var session = require("express-session");
var bodyParser = require("body-parser");
var levels = require("./levels");

var vorbis = require("vorbis");
var ogg = require("ogg");
var lame = require("lame"); // for MP3
var wav = require("wav"); // for WAVE files
//

var redis = require("redis");
var router = express();

router.use(express.static(path.resolve(__dirname, "public")));
router.use(session({secret:"Triple Secret"}));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded());

var API_KEY = "009057c6287f8c80a49053c3c8c2da500b6abb3f9a925a737";

router.get("/words/:level", function(req, res) {
  console.log(req.params.level);
  var url = "http://api.wordnik.com/v4/words.json/randomWords?api_key=" + API_KEY +"&";
    var level = levels[req.params.level];
    for(var key in level) {
        url += key + "=" + level[key] + "&";
    }
    url += "limit=5&hasDictionaryDef=true&excludePartOfSpeech=proper-noun,given-name,family-name";
    console.log(url);
    request.get(url, function(err, resp, body) {
      body = JSON.parse(body);
        var ret = [];
        for(var i = 0; i < body.length; i++) {
            ret.push(body[i].word);
        }
        console.log(ret);
        res.json(ret);
    }); 
});

router.get("/speech/:word", function(req, res) {
      var mp3 = request.get(
        "http://translate.google.com/translate_tts?ie=UTF-8&tl=en&q=" + req.params.word);
      if(req.query.type === "mp3") {
        mp3.pipe(res);
      } else if(req.query.type === "ogg") {
        var mp3Decoder = new lame.Decoder();
        mp3.pipe(mp3Decoder);

        mp3Decoder.on("format", function() {
          var vorbisEncoder = new vorbis.Encoder();
          mp3Decoder.pipe(vorbisEncoder);

          var oggEncoder = new ogg.Encoder();
          vorbisEncoder.pipe(oggEncoder.stream());
   
          oggEncoder.pipe(res);
        });
      } else if(req.query.type === "wav") {
        mp3
          .pipe(lame.Decoder())
          .pipe(wav.Writer())
          .pipe(res);
      }
});

var client = redis.createClient(16181, "pub-redis-16181.us-east-1-2.1.ec2.garantiadata.com");

router.get("/leaderboard/:board?", function(req, res) {
  client.zrange("global" || req.params.board, 0, req.query.end || 10, function(err, keys) {
    res.end(keys);
  });
});

router.post("/leaderboard/:board", function(req, res) {
  client.zadd(req.params.board, req.body.score, req.body.name, function(err) {
    if(err) {
      res.end(err);
    }
  });
});

http.createServer(router).listen(process.env.PORT, process.env.IP);