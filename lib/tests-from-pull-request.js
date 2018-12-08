const fs = require('fs')
const readline = require('readline')

module.exports = getTestsFromPR

function getTestsFromPR (context) {
  return Promise.resolve()
    .then(() => ['Hi Or'])
  // .then(() => _getTestsFromPR(context))
}

function _getTestsFromPR (context) {
  const pull = context.issue()
  const {repos, pullRequests} = context.github
  // todo: code to get file contect
  let newTestLines = []
  let PRfiles
  return pullRequests.getFiles(pull)
    .then((res) => res.data)
    .then((files) => PRfiles = files)
    .then(() => console.log('FILES FROM PR:\n', PRfiles))

  // let line = ''
  // if (line.startsWith('+')) {
  //   line = line.slice(1).trim() // remove the + and spaces
  //   if (line.trim().startsWith('it(')) {
  //     newTestLines.push(line)
  //   }
  // }

  // return newTestLines
}
