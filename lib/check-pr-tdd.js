const _ = require('lodash');
const getSpecsFromIssue = require('./get-specs-from-issue');
const getTestsFromPullPR = require('./tests-from-pull-request');
const createFixture = require('./create-fixture');

const copyArray = (arr) => arr && arr.slice();

module.exports = checkPrTDD;

function checkPrTDD(context) {
  // TODO: implement updating the related issue
  if (context.payload.issue && !context.payload.pull_request) { return; }

  const { sha } = context.payload.pull_request.head;
  const repo = context.repo();
  const createStatus = context.github.repos.createStatus;
  const statusInfo = { ...repo, sha, context: 'tdd1t' };

  return createStatus({
    ...statusInfo,
    state: 'pending',
    description: 'Checking test files vs specs'
  })
    .then(() => getRelatedIssue())
    .then((issueNumber) => getSpecsAndTests(issueNumber))
    .then(specsAndTests => checkSpecsAgainstTests(specsAndTests));

  function checkSpecsAgainstTests(spectsAndTests) {
    const specs = spectsAndTests[0];
    const tests = spectsAndTests[1];
    const tdd1tStatus = getMessage(specs, tests);

    return createStatus({
      ...statusInfo,
      ...tdd1tStatus
    });
  }

  function getMessage(specs, tests) {
    const missingSpecs = copyArray(specs);
    const missingTests = copyArray(tests);

    _.pullAll(missingSpecs, tests);
    _.pullAll(missingTests, specs);

    context.log.debug({ data: missingSpecs }, 'missing specs');
    context.log.debug({ data: missingTests }, 'missing tests');

    if (!missingSpecs.length && !missingTests.length) {
      return {
        state: 'success',
        description: 'Feature specs fully implemented'
      };
    }

    return {
      state: 'failure',
      description: getErrorMessage(missingSpecs, missingTests)
    };
  }

  function getErrorMessage(missingSpecs, missingTests) {
    let errorMessage = 'found ';

    errorMessage += missingSpecs.length ?
      `${ missingSpecs.length } unimplemented specs` : '';

    errorMessage += missingSpecs.length && missingTests.length ? ' and ' : '';

    errorMessage += missingTests.length ?
      `${ missingTests.length } unspeced tests` : '';

    return errorMessage;
  }

  function getSpecsAndTests(issueNumber) {
    return Promise.all([
      getSpecsFromIssue(context, issueNumber),
      getTestsFromPullPR(context)
    ]);
  }

  function getRelatedIssue() {
    const issueNumberRegex = /\W#(\d+)\W|\W#(\d+)$|^#(\d+)\W|^#(\d+)$/gm;

    return context.github.pullRequests.get(context.issue())
      .then(createFixture('pullRequests.get'))
      .then((res) => res.data)
      .then((pullRequest) => issueNumberRegex.exec(pullRequest.body))
      .then((regexResult) => regexResult && regexResult[1]);
  }
}
