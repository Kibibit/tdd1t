const _ = require('lodash');

module.exports = getSpecsFromIssue;

function getSpecsFromIssue(context, issueNumber) {
  console.log('started getting specs out of issue');

  return getIssueCompleteText(context, issueNumber)
    .then(issueCompleteText => getSpecsBlock(issueCompleteText))
    .then(specsBlock => getSpecNamesFromBlock(specsBlock));
}

function getIssueCompleteText(context, issueNumber) {
  const repo = context.repo();

  return Promise.all([
    context.github.issues.get(...repo, issueNumber),
    context.github.issues.listComments(...repo, issueNumber)
  ])
    .then((issueDataResponse) => {
      const [issueBody, issueComments] = issueDataResponse;

      return issueComments
        .map((comment) => comment.body)
        .unshift(issueBody)
        .join('\n');
    });
}

function getSpecsBlock(issueCompleteText) {
  const specsBlock = [];
  var specsBlockTopLevelHeader;

  for (let line of issueCompleteText.split('\n')) {
    const specsBlockStartRegex = /^\s*?(#+)\s*?specs/gi;
    line = line.trim();

    if (!specsBlockTopLevelHeader) {
      const regexRunResults = specsBlockStartRegex.exec(line);
      specsBlockTopLevelHeader = regexRunResults && `${ regexRunResults[1] }#`;

      continue;
    }

    const isValidLine = isValidMarkdownTitle(line, specsBlockTopLevelHeader) ||
      isEmptyLine(line) || isMarkdownListItem(line);

    if (!isValidLine) {
      break;
    }

    specsBlock.push(line);
  }

  return specsBlock;
}

function isValidMarkdownTitle(line, topLevelHeader) {
  return line.startsWith(topLevelHeader);
}

function isEmptyLine(line) {
  return line === '';
}

function isMarkdownListItem(line) {
  return line.startsWith('-') || line.startsWith('*');
}

function getSpecNamesFromBlock(blockLines) {
  const specNames = [];

  _.forEach(blockLines, (blockLine) => {
    const markDownListItemRegex = /^\s*[-*]\s*(.*)/g;
    const regexRunResults = markDownListItemRegex.exec(blockLine);
    const specName = regexRunResults && regexRunResults[1];

    if (specName) {
      specNames.push(specName);
    }
  });

  return specNames;
}
