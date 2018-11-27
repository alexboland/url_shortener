const axios = require('axios');

let errors = 0;

let promises = [];

for (let i = 0; i < 3000; i++) {
  let blocks = Math.round(Math.random()*10);
  let str = 'https://www.example.com/';
  for (let j = 0; j < blocks; j++) {
    str += Math.random().toString(36).split('.')[1] + '/';
  }

  promises.push(axios.post('http://localhost:3000/addNewUrl', { url: str }, {credentials: 'same-origin'}));



}

Promise.all(promises)
  .then(results => {
    console.log('errors: ' + results.filter(result => result.data['error'] == true).length + ' / ' + results.length);
  })
  .catch(err => {
    console.log(err);
  });

