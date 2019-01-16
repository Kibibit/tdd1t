const _ = require('lodash');
const createFixture = require('./create-fixture');

module.exports = getSpecsFromIssue;

function getSpecsFromIssue(context, issueNumber) {
  context.log(`started getting specs out of issue #${ issueNumber }`);

  return getIssueCompleteText(context, issueNumber)
    .then(issueCompleteText => getSpecsBlock(issueCompleteText))
    .then(specsBlock => getSpecNamesFromBlock(specsBlock))
    .then((specNames) => cleanUserSpecifiedPrefix(specNames))
    .then((specNames) => {
      context.log
        .debug({ data: specNames }, `spec names from issue #${ issueNumber }`);

      return specNames;
    });

  async function cleanUserSpecifiedPrefix(specNames) {
    const config = await context.config('config.yml');
    const prefix = config && config.tdd1tIgnorePrefix;

    context.log.debug({ data: prefix }, 'prefix to remove from config file');

    return specNames.map((specName) => prefix && specName.startsWith(prefix) ?
      specName.slice(prefix.length).trim() : specName);
  }
}

function getIssueCompleteText(context, issueNumber) {
  const repo = context.repo();

  return Promise.all([
    getGitHubIssue(),
    getGitHubIssueComments()
  ])
    .then((issueDataResponse) => {
      const [issue, issueComments] = issueDataResponse;

      return [ issue ].concat(issueComments)
        .map((comment) => comment.body)
        .join('\n');
    });

  function getGitHubIssue() {
    return context.github.issues.get({
      ...repo,
      number: issueNumber
    })
      .then(createFixture('issues.get'))
      .then((result) => result.data);
  }

  function getGitHubIssueComments() {
    return context.github.issues.listComments({
      ...repo,
      number: issueNumber
    })
      .then(createFixture('issues.listComments'))
      .then((result) => result.data);
  }
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
