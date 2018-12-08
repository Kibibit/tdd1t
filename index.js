const lintPR = require('./lib/lint-pull-request');

module.exports = app => {
  // Your code here
  app.log('Yay, the app was loaded!');

  app.on("pull_request.opened", lintPR);
  app.on("pull_request.synchronize", lintPR);

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
