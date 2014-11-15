var storage = require('node-persist');
storage.initSync();
var hangoutsBot = require("hangouts-bot");
var bot = new hangoutsBot("myemail@gmail.com", "mypassword"); //setup with google+ credentials
var adminpass = "password"; //setup with password
var learnThings = {
    terms: [
        "you",
        "why",
        "what",
        "ok",
        "horse",
        "new",
        "love",
        "wow",
        "teach",
        "this",
        "bot",
        "hello",
        "hi"
    ],
    definitions: [
        "I am a horse",
        "because horse",
        "a horse",
        "horse",
        "yes",
        "horse is new",
        "<3",
        "such horse",
        "I will learn you!!",
        "me",
        "How can you prove I am a bot? If I am not conscious, are you? These are the questions Horse Bot asks every day.",
        "Yo yo, Horsie in the house yeah!!",
        "What's up!"
    ]
};
var blacklist = [
    "",
    "learn",
    "a",
    "the",
    "an",
    "or",
    "this",
    "and",
    "but",
    "his",
    "her",
    "he",
    "she",
    "are",
    "delete",
    "authorize",
    "send",
    "identify"
];
var cmds = {
    commands: [
        "help",
        "admin"
    ],
    results: [
        "Hello my name is horse bot. Type Learn for information on how to teach me new things! Identify yourself! Type identify username. Send messages! Send message to username.",
        "To authorize as an admin, use authorize password. To delete items, use delete term. To delete users, use delete identify user."
    ]
};

var authlist = [];
var dmsys = {
    ids: [],
    dests: []
};

bot.on('online', function() {
    console.log('online');
});

bot.on('message', function(from, message) {
    try {
        message = message.toLowerCase();
        if(message.split(" ")[0] == "delete"){
            var terms = message.split("delete ");
            if(authlist.indexOf(from) > -1){
                if(terms[1].split(" ")[0] == "identify"){
                    terms = terms[1].split(" ");
                    if(dmsys.ids.indexOf(terms[1]) > -1){
                        dmsys.ids.splice(dmsys.ids.indexOf(terms[1]), 1);
                        dmsys.dests.splice(dmsys.ids.indexOf(terms[1]), 1);
                        bot.sendMessage(from, "Deleted the user.");
                        storage.setItem("dmsys", dmsys);
                    }
                    else {
                        bot.sendMessage(from, "Cannot find the user!");
                    }
                }
                else {
                    if(learnThings.terms.indexOf(terms[1]) > -1){
                        learnThings.terms.splice(learnThings.terms.indexOf(terms[1]), 1);
                        learnThings.definitions.splice(learnThings.terms.indexOf(terms[1]), 1);
                        bot.sendMessage(from, "Deleted the learning.");
                        storage.setItem("learnThings", learnThings);
                    }
                    else {
                        bot.sendMessage(from, "Cannot find the learning!");
                    }
                }
            }
            else {
                bot.sendMessage(from, "Unauthorized!!");
            }
        }
        else if(message.split(" ")[0] == "authorize"){
            var terms = message.split(" ");
            if(terms[1] == adminpass){
                authlist.push(from);
                storage.setItem("authlist", authlist);
                bot.sendMessage(from, "Now authorized!");
            }
            else {
                bot.sendMessage(from, "Wrong password!");
            }
            
        }
        else if(message.split(" ")[0] == "send"){
            var terms = message.split("send ");
            var terms = terms[1].split(" to ");
            if(dmsys.ids.indexOf(terms[1]) > -1){
                bot.sendMessage(dmsys.dests[dmsys.ids.indexOf(terms[1])], terms[0]);
                bot.sendMessage(from, "Successfuly send message to: " + terms[1]);
            }
            else {
                bot.sendMessage(from, "Invalid id. Make sure the end user has identified themselves!");
            }
        }
        else if(message.split(" ")[0] == "identify"){
            if(dmsys.ids.indexOf(message.split(" ")[1]) < 0){
                dmsys.ids.push(message.split(" ")[1]);
                dmsys.dests.push(from);
                bot.sendMessage(from, "Now identified as: " + message.split(" ")[1]);
                storage.setItem("dmsys", dmsys);
            }
            else {
                bot.sendMessage(from, "username taken! contact an admin to delete identify " + message.split(" ")[1]);
            }
        }
        else if(cmds.commands.indexOf(message) > -1){
            bot.sendMessage(from, cmds.results[cmds.commands.indexOf(message)]);
        }
        else if(message.split(" ").indexOf("learn") == 0){
            message = message.split("learn ")[1];
            if(message != undefined){
                if(message.length > 1){
                    var sections = message.split("|");
                    if(sections.length == 2){
                        if(learnThings.terms.indexOf(sections[0]) == -1 && cmds.commands.indexOf(sections[0]) == -1 && blacklist.indexOf(sections[0]) == -1){
                            learnThings.terms.push(sections[0]);
                            learnThings.definitions.push(sections[1]);
                            storage.setItem("learnThings", learnThings);
                            bot.sendMessage(from, "I have learned to say: " + sections[1] + " when someone says " + sections[0]);
                        }
                        else {
                            bot.sendMessage(from, "That term has already been taken, sorry chap!");
                        }
                    }
                    else {
                        bot.sendMessage(from, "Usage: Learn Term|Definition");
                    }
                }
            }
            else {
                bot.sendMessage(from, "Usage: Learn Term|Definition");
            }
        }
        else {
            for(var i=0; i<learnThings.terms.length; i++){
                var regex = new RegExp("(\\b|^)" + learnThings.terms[i] + "(\\b|$)");
                if(message.match(regex) != null){
                    bot.sendMessage(from, learnThings.definitions[i]);
                }
            }
        }
    }
    catch(err){
        console.log(err);
        bot.sendMessage(from, "I have encountered an error.");
    }
});

if(storage.getItem("learnThings") == undefined){
    storage.setItem("learnThings", learnThings);
}

learnThings = storage.getItem("learnThings");

if(storage.getItem("authlist") == undefined){
    storage.setItem("authlist", authlist);
}

authlist = storage.getItem("authlist");

if(storage.getItem("dmsys") == undefined){
    storage.setItem("dmsys", dmsys);
}

dmsys = storage.getItem("dmsys");

var express = require('express');
var app = express();
 
app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});
app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});
var port = process.env.PORT || 3000;
 
var server = app.listen(port);