module.exports = getSpecsFromIssue;

function getSpecsFromIssue(context, issueNumber) {
  console.log('started getting specs out of issue');
  let issue = context.github.issues;
  let specs = [];

  return Promise.resolve()
  .then(() => {
    comments.forEach(comment => {
      comment.toLowerCase();
      let posiotionOfSpecsList = comment.indexOf('## specs');
      comment = comment.slice(posiotionOfSpecsList);
      let endPosiotionOfSpecsList = comment.indexOf('##');
      comment = comment.slice(0, endPosiotionOfSpecsList);

      let bullets = comment.split('-');
      bullets.forEach(bullet => {
        bullet.trim();
        if (bullet.startsWith('it')) {
          specs.push(bullet);
        }
      });
    })
  })
}
