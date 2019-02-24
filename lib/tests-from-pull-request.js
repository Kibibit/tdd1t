const _ = require('lodash');
const createFixture = require('./create-fixture');

module.exports = getTestsFromPR;

function getTestsFromPR(context) {
  context.log('Getting test names from pull request');

  const repo = context.repo();
  const { pullRequests } = context.github;
  let testFunctionName;

  return getTestFunctionName(context)
    .then((functionName) => testFunctionName = functionName)
    .then(() => getPullRequestFiles())
    .then((files) => files.map((file) => file.patch))
    .then((patches) => patches.join('\n'))
    .then((prPatch) => getTestNames(prPatch, testFunctionName))
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

function getTestNames(prPatch) {
  const testNames = [];
  const parsedPatch = prPatch.split('\n');
  parsedPatch.forEach((line) => {
    if (line.startsWith('+')) {
      line = removePrefixAndTrim(line);
      const testName = getTestName(line);

      testName ? testNames.push(testName) : null;
    }
  });
  return testNames;
}

function removePrefixAndTrim(line) {
  return line.slice(1).trim();
}

function getTestFunctionName(context) {
  return context.config('config.yml')
    .then((config) => _.get(config, 'tdd1tTestFunctionName', 'it'));
}

function getTestName(line) {
  const getTestNameRegex = new RegExp(`${testFunctionName}\\((.*),`);
  const regexTestResult = getTestNameRegex.exec(line);

  return regexTestResult && regexTestResult[1].trim().slice(1, -1);
}
