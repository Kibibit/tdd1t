module.exports = getTestsFromPR;

function getTestsFromPR(context) {
  const pull = context.issue();
  const { pullRequests } = context.github;

  return Promise.resolve()
    .then(pullRequests.getFiles(pull))
    .then((res) => res.data)
    .then((files) => files.map((file) => file.patch))
    .then((patches) => patches.join('\n'))
    .then((prPatch) => getTestNames(prPatch));
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

function getTestName(line) {
  const getTestNameRegex = /it\((.*),/;
  const regexTestResult = getTestNameRegex.exec(line);

  return regexTestResult && regexTestResult[1].trim().slice(1,-1);
}
