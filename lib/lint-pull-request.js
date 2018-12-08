const atob = require('atob');
const tslint = require("tslint");

const linterOptions = {
  fix: false,
  formatter: "json"
};

module.exports = lintPR;

function lintPR(context) {
  console.log('start linting!');
  const pull = context.issue();
  const { sha } = context.payload.pull_request.head;
  const repo = context.repo();

  let changedFiles, lintConfigFile, PRfiles;

  const { paginate, issues, repos, pullRequests } = context.github;

  // Hold this PR info
  const statusInfo = { ...repo, sha, context: "l1ntit" };

  let lintResults;

  // Pending
  return repos.createStatus({
    ...statusInfo,
    state: 'pending',
    description: 'Waiting for files to be linted'
  })
  .then(() => pullRequests.getFiles(pull))
  .then((res) => res.data)
  .then((files) => PRfiles = files)
  // .then(() => console.log('FILES FROM PR:\n', PRfiles))
  .then(() => PRfiles.map((file) => file.filename))
  .then((fileNames) => {
    console.log('these are the fileNames!', fileNames);

    return fileNames;
  })
  .then((fileNames) => getFullFiles(fileNames))
  .then((result) => {
    changedFiles = Array.isArray(result) ? result : [result];
    console.log('got all the files', changedFiles);

    // get lint configuration
    const path = 'tslint.json';
    return getFullFiles(path)
      .then((lintFile) => {
        lintFile.content = JSON.parse(lintFile.content);
        
        return lintFile;
      });
  })
  .then((lintFile) => lintConfigFile = lintFile)
  .then(() => changedFiles.filter((file) => file.name.endsWith('.ts')))
  .then((tsFiles) => tsFiles.map((tsFile) => lintSingleFile(tsFile)))
  .then((results) => lintResults = results)
  .then(() => {
    // console.log('LINT RESULTS!', lintResults[0]);

    lintResults.forEach((singleLint) => {
      singleLint.failures.forEach((failure) => {

        console.log('current failure: ', failure);

        // get patch header data as catch groups
        const myRegexp = /@@\s\-\d+,\d+\s\+(\d+),(\d+)\s@@/gm;
        // +1 because line number starts with 1 but tslint line number starts with 0
        const lintLine = failure.endPosition.toJson().line + 1;
        const filename = failure.fileName;
        const fileData = changedFiles.find((file) => file.name === filename);

        console.log('found file?', fileData);

        const match = myRegexp.exec(fileData.patch);
        const lineInPatch = lintLine - (+match[1]);

        const patchArray = fileData.patch
          .split('\n')
          .filter((line) => !(line.startsWith('@') || line.startsWith('-')));

        console.log('did we get the correct line?\n', patchArray[lineInPatch]);

        const message = `[${ failure.ruleSeverity }]: ${ failure.failure } from ${ failure.ruleName }`;

        console.log('BOT COMMENT:\n', message);
        issues.createComment({
          ...pull,
          path: fileData.path,
          position: lineInPatch,
          body: message
        });
      });
    });
  })
  .catch((err) => {
    console.log('oops... something went wrong\n', err);
  });

  function getFullFiles(fileNames) {
    fileNames = Array.isArray(fileNames) ? fileNames : [fileNames];

    return Promise.all(fileNames.map((path) => {
      return repos.getContent({...pull, path, ref: sha })
        .then((res) => res.data);
    }))
    .then((fileElementArray) => {
      fileElementArray
        .forEach((fileElement) => {
          // get full file content
          fileElement.content = atob(fileElement.content);

          // attach original patch
          fileElement.patch = PRfiles.find((element) => element.filename === fileElement.path);

          fileElement.patch = fileElement.patch && fileElement.patch.patch;
        });
      return fileNames.length === 1 ? fileElementArray[0] : fileElementArray;
    });
  }

  function lintSingleFile(file) {
    const linter = new tslint.Linter(linterOptions);

    console.log('ALL DATA PASSED TO LINTER:\n', {
      name: file.name,
      content: file.content,
      lintConfigFile: lintConfigFile.content
    });

    const parsedConfig = tslint.Configuration.parseConfigFile(lintConfigFile.content);
  
    linter.lint(file.name, file.content, parsedConfig);

    return linter.getResult();
  }
}