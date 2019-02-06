const createFixture = require('./create-fixture');

module.exports = getTestsFromPR;

function getTestsFromPR(context) {
  context.log('Getting test names from pull request');

  const repo = context.repo();
  const { pullRequests } = context.github;

  return getPullRequestFiles()
    .then((files) => files.map((file) => file.patch))
    .then((patches) => patches.join('\n'))
    .then((prPatch) => getTestNames(prPatch, context))
    .then((testNames) => {
      context.log.debug({ data: testNames }, 'test names from pull request');

      return testNames;
    });

  function getPullRequestFiles() {
    return pullRequests.listFiles({
      ...repo,
      number: context.payload.number
    })
      .then(createFixture('pullRequests.listFiles'))
      .then((res) => res.data);
  }
}

function getTestNames(prPatch, context) {
  const testNames = [];
  const parsedPatch = prPatch.split('\n');
  return getConfig(context)
    .then(config => {
      parsedPatch.forEach((line) => {
        if (line.startsWith('+')) {
          line = removePrefixAndTrim(line);
          const testName = getTestName(line, config);

          testName ? testNames.push(testName) : null;
        }
      });
    })
    .then(() => testNames);
}

function removePrefixAndTrim(line) {
  return line.slice(1).trim();
}

function getConfig(context) {
  return Promise.resolve(context.config('config.yml'));
}

function getTestName(line, config) {
  const testFunctionName = config && config.tdd1tTestFunctionName ?
    config.tdd1tTestFunctionName : 'it';
  const getTestNameRegex = new RegExp(`${testFunctionName}\((.*),`);
  const regexTestResult = getTestNameRegex.exec(line);

  return regexTestResult && regexTestResult[1].trim().slice(1,-1);
}
