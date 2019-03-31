import express from 'express';
import favicon from 'express-favicon';
import path from 'path';
import morgan from 'morgan';

import { getMapData } from './mapData';

const port = process.env.PORT || 8080;
const app = express();

app.use(morgan('tiny'));
app.use(favicon(path.join(__dirname, '/../build/favicon.ico')));
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'build')));

app.use('/static',  express.static(path.join(__dirname, '/../static')))

app.get('/map-data', async (req, res) => {
  const mapData = await getMapData();
  res.send(mapData);
});

app.get('/*', async (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => `App listening on port ${port}!`);
