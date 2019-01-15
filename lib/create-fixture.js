const jsonfile = require('jsonfile');

module.exports = createFixture;

function createFixture(name) {
  const createFixtures = process.env.fixtures || false;

  return createFixtures ?
    (obj) => {
      return jsonfile
        .writeFile(
          `test/fixtures/${ name }.${ +new Date() }.autosave.json`,
          obj
        )
        .then(() => obj);
    } :
    (obj) => Promise.resolve(obj);
}
