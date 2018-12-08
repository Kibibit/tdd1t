const fs = require('fs')
const readline = require('readline')

module.exports = getTestsFromPR

/**
 *
 * @param pullRequest
 */
function getTestsFromPR (context) {
  return Promise.resolve()
    .then(() => ["Hi Or"])
    // .then(() => _getTestsFromPR(context))
}

function _getTestsFromPR (context) {
  const { repos, pullRequests } = context.github;
  // todo: code to get file contect
  let newTestLines = []
  let line = '';
  if (line.trim().startsWith('+it')){
    newTestLines.push(line);
  }

  return newTestLines;

}

