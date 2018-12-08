module.exports = getSpecsFromIssue;

function getSpecsFromIssue(context, issueNumber) {
  console.log('started getting specs out of issue');
  let issue = context.github.issues;
  let specs = [];

  return Promise.resolve()
  .then(() => Promise.all([
    context.github.issues.get(...repo, issueNumber),
    context.github.issues.listComments(...repo, issueNumber)
  ]))
  .then(data => {
    const { body, comments } = data;
    const allCommentsBody = comments
      .map((comment) => comment.body)
      .push(body);

    pushSpecs(specs, allCommentsBody);

    return specs;
  });
}

function pushSpecs(specs, body) {
  body.toLowerCase();
  let posiotionOfSpecsList = body.indexOf('## specs');
  body = body.slice(posiotionOfSpecsList);
  let endPosiotionOfSpecsList = body.indexOf('##');
  body = body.slice(0, endPosiotionOfSpecsList);

  let bullets = body.split('-');
  bullets.forEach(bullet => {
    bullet.trim();
    if (bullet.startsWith('it')) {
      specs.push(bullet);
    }
  });
}
