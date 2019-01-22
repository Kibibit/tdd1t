const checkPrTDD = require('./lib/check-pr-tdd');

module.exports = app => {
  app.log('Yay, tdd1t was loaded!');

  app.on('pull_request.opened', checkPrTDD);
  app.on('pull_request.synchronize', checkPrTDD);

  app.on('issues.edited', checkPrTDD);
};


// For more information on building apps:
// https://probot.github.io/docs/

// To get your app running against GitHub, see:
// https://probot.github.io/docs/development/
