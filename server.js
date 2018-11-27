const http = require('http');
const express = require('express');
const path = require('path');
const knex = require('knex')(require('./knexfile'));
const base62 = require('base62/lib/ascii');
const redis = require('redis');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;


if (cluster.isMaster) {
  masterProcess();
} else {
  childProcess();
}

function masterProcess() {
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    console.log(`Forking process number ${i}...`);
    cluster.fork();
  }

}

function childProcess() {
  console.log(`Worker ${process.pid} started and finished`);


  const app = express();

  const client = redis.createClient(process.env.REDIS_URL);

  app.use(express.json());
  app.use(express.urlencoded({extended: false}));
  app.use(express.static(path.join(__dirname, 'client/public')));

  const router = express.Router();


  const insertUrl = (url, retries = 100) =>
    new Promise((resolve, reject) => {
        const nonce = Math.round(Math.random()*1000);
        const abbr = base62.encode(Date.now() - 150000000000 + nonce);
        knex('urls').insert({abbreviated_url: abbr, original_url: url})
          .then(results => {
            resolve(abbr);
          })
          .catch(err => {
            if (retries > 0) {
              insertUrl(url, retries - 1)
                .then(result => {
                  resolve(result);
                })
                .catch(err => {
                  reject(err);
                });
            } else {
              reject(err);
            }
          });
      }
    );

  router.post('/addNewUrl', function (req, res) {
    const url = req.body.url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");

    const retrieval = new Promise((resolve, reject) => {
      client.get(url, (err, result) => {
        if (result) {
          resolve(result);
        } else {
          knex.select('abbreviated_url', 'original_url').from('urls').where({original_url: url})
            .then(results => {
              if (results.length > 0) {
                resolve(results[0].abbreviated_url);
              } else {
                insertUrl(url)
                  .then(result => {
                    client.set(result, url, 'EX', 86400);
                    client.set(url, result, 'EX', 86400);
                    resolve(result)
                  })
                  .catch(error => {
                    reject(error);
                  });
              }
            })
            .catch(err => {
              reject(err);
            });
        }
      });
    });

    retrieval
      .then(result => {
        res.send({url: result});
      })
      .catch(err => {
        res.status(500).send({error: true});
      })
  });

  router.get('/listTopUrls', function (req, res) {
    knex.select('*').from('urls').orderBy('visits', 'desc').limit(100)
      .then(results => {
        res.send(results);
      })
  });

  router.get('/:url', function (req, res) {
    knex.select('original_url').from('urls').where({abbreviated_url: req.params.url})
      .then(results => {
        if (results.length > 0) {
          knex('urls').increment('visits', 1).where({abbreviated_url: req.params.url})
            .then(result => {
              res.status(301).redirect('https://www.' + results[0].original_url);
            })
            .catch(err => { res.status(500).send({error: true}) })
        } else {
          res.status(404).send({message: 'No such URL exists'});
        }
      })
  });

  app.use('/', router);

  const server = http.createServer(app);

  server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function () {
    const addr = server.address();
    console.log("Server listening at", addr.address + ":" + addr.port);
  });


// Console will print the message
  console.log('Server running at http://127.0.0.1:3000/');
}