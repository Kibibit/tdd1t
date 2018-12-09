module.exports = getTestsFromPR

function getTestsFromPR (context) {
  return Promise.resolve()
    .then(() => _getTestsFromPR(context))
}

function _getTestsFromPR (context) {
  let PRfiles
  const pull = context.issue()
  const {pullRequests} = context.github

  return pullRequests.getFiles(pull)
    .then((res) => res.data)
    .then((files) => PRfiles = files) // files is an array of objects -> each have file.patch
    .then(() => PRfiles.map((file) => file.patch))
    .then((patches) => patches.join('\n'))
    .then(_getTestNamesFromPatch)
    .then((lines) => lines.map((line) => \[(.*?)\]
))
}

function _getTestNamesFromPatch (patch) {
  let newTestLines = []
  const parsedPatch = patch.split('\n')
  parsedPatch.forEach((line) => {
    if (line.startsWith('+')) {
      line = line.slice(1).trim() // remove the + and spaces
      if (line.trim().startsWith('it(')) {
        const _testRegex = new RegExp('(?<=\\().+?(?=\\))','g');// text in brackets
        const _testText = line.match(_testRegex)[0].replace(/['"]+/g, '');
        const resultLine = ['it', _testText].join(' ');
        newTestLines.push(resultLine)
      }
    }
  })
  return newTestLines

}
