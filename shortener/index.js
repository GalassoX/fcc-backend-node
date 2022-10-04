require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

let URLS = [];

app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;
  try {
    const urldata = new URL(url);
    const newUrlObject = { original_url: urldata.origin, short_url: URLS.length };
    URLS.push(newUrlObject);
    res.json(newUrlObject);
  } catch (e) {
    res.json({ error: 'Invalid url' });
  }
});

app.get('/api/shorturl/:id', (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.json({ error: 'Invalid ID' });
    return;
  }
  const urlObject = URLS.find(u => u.short_url === parseInt(id));
  res.redirect(urlObject.original_url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
