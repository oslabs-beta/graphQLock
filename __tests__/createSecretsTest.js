// to test, temporarily edit createSecrets operations variable to the appropriate path seen below:
    // const operations = require(path.resolve(__dirname, './graphqlock'));

const fs = require('fs');
const path = require('path');
const { parse, stringify } = require('envfile');
const sourcePath = '.env';
const { createSecrets } = require('../createSecrets');


describe('createSecrets function', () => {
  const operations = require(path.resolve(__dirname, '../graphqlock.json'));

  beforeAll(async () => {
    await fs.promises.writeFile(sourcePath, stringify({}));
  });

  afterAll(async () => {
    await fs.promises.writeFile(sourcePath, stringify({}));
  });

  describe('create JWT secrets', () => {
    it('should create the secrets based on the keys (roles) in operations.config.json file', async () => {
      const rolesLength = Object.keys(operations).length;
      await fs.promises.readFile(sourcePath, 'utf8')
        .then(data => {
          priorLength = Object.keys(parse(data)).length;
          return new Promise((res, rej) => {
            createSecrets();
            setTimeout(() => res("done"), 1000);
          })
        })
        .then(async () => {
          await fs.promises.readFile(sourcePath, 'utf8')
            .then(data => {
              postLength = Object.keys(parse(data)).length;
              expect(priorLength + rolesLength + 1).toEqual(postLength);
            })
        })
    });

    it('should create unique secrets for each role', async () => {
      await fs.promises.readFile(sourcePath, 'utf8')
        .then(data => {
          const temp = Object.values(parse(data));
          for (let i = 0; i < temp.length - 1; i++) {
            expect(temp[i]).not.toEqual(temp[i + 1]);
          }
        })
    });

    it('should reset access token secret but if a refresh token secret already exists, it will not be reset', async () => {
      await fs.promises.readFile(sourcePath, 'utf8')
        .then(data => {
          priorAccess = Object.values(parse(data))[0];
          priorRefresh = parse(data).REFRESH_TOKEN_SECRET;
          return new Promise((res, rej) => {
            createSecrets();
            setTimeout(() => res("done"), 1000);
          })
        })
        .then(async () => {
          await fs.promises.readFile(sourcePath, 'utf8')
            .then(data => {
              postAccess = Object.values(parse(data))[0];
              postRefresh = parse(data).REFRESH_TOKEN_SECRET;
              expect(priorAccess).not.toEqual(postAccess);
              expect(priorRefresh).toEqual(postRefresh);
            })
        })
    });
  });
});
