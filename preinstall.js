#! /usr/bin/env node  --harmony
var prompt = require('prompt');
var shell = require("shelljs");
var configJson = require('./install_files/server/config.json');
var datasourcesJson = require('./install_files/server/datasources.json');
var fs = require('fs');

prompt.start();

var schemaConfig = {
  properties: {
    senderMail: {
      pattern: /.{2,20}@.{2,20}\..{2,5}/,
      message: 'Email must be valid',
      required: true
    }
  }
};

var schemaDatasources = {
  properties: {
    host: { required: true, description: 'mail host (e.g. in-v3.mailjet.com)' },
    port: { required: true, default: 587, type: 'number' },
    user: { required: true },
    password: { required: true, hidden: true },
    database: { required: true, description: "How should your mongodb database be called?", default:"testtest" }
  }
};


console.log("Please provide the sender email address (for verification mails)");
prompt.get(schemaConfig, function(err, res){
  if(err) throw err;

  configJson.custom = {
    "senderMail": res.senderMail
  };

  var newConfigJson = JSON.stringify(configJson, null, 2);

  fs.writeFile('./server/config.json', newConfigJson, function(err){
    if(err) throw err;
  });

  console.log("The file server/config.json was written.");
  console.log("...");
  console.log("Now we have to configurate the mail delivery service and dbms!");
  prompt.get(schemaDatasources, function(err, res){
    if(err) throw err;

    datasourcesJson.mailer.transports[0].host = res.host;
    datasourcesJson.mailer.transports[0].port = res.port;
    datasourcesJson.mailer.transports[0].auth.user = res.user;
    datasourcesJson.mailer.transports[0].auth.pass = res.password;
    datasourcesJson.mongo.database = res.database;


    var newDatasourcesJson = JSON.stringify(datasourcesJson, null, 2);

    fs.writeFile('./server/datasources.json', newDatasourcesJson, function(err){
      if(err) throw err;
    });

    console.log("The file server/datasources.json was written. Thank you!");

  });



});
