const config = require("config");

module.exports = function (app) {
  if (!config.get("jwtPrivateKey")) {
    throw new Error("FATAL ERROR: jwtPrivateKey is not defined.");
  }

  //"config/custom-environment-variables.json" will map config settings to environment variables
  // need to run in terminal: set NODE_ENV=development (or production)
  // need to run in terminal: set app_password=1234
  // need to run in terminal: set pk=1234
  console.log("Application Name: " + config.get("name"));
  console.log("Mail Server: " + config.get("mail.host"));
  // console.log("Mail Password: " + config.get("mail.password"));
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`Mail Host Password: ${process.env.app_password}`);
  console.log(`Custom JWT Private Key: ${process.env.pk}`);
  console.log(`Default JWT Private Key: ${config.get("jwtPrivateKey")}`);
  console.log(`app: ${app.get("env")}`);
};
