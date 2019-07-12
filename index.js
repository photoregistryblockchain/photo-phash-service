const express = require('express');
const bodyParser = require('body-parser');
const imghash = require('imghash');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs')
const app = express();
const port = 5678;

app.use(cors())
app.use(bodyParser.json());

const downloadMedia = (url, filename) =>
  axios({
    url,
    responseType: 'stream',
  }).then(
    response =>
      new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream(filename))
          .on('finish', () => resolve())
          .on('error', e => reject(e));
      }),
  );

const cleanMedia = (filename) =>  fs.unlinkSync(filename)

app.post('/', async (req, res) => {
  const { url } = req.body;
  const filename = Math.random().toString()
  if (url) {
    try {
      await downloadMedia(url, filename)
      const hash = await imghash.hash(filename)
      res.send(hash);
      cleanMedia(filename);
    } catch (err) {
      res.sendStatus(500);
    }
  }
  res.end();
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))