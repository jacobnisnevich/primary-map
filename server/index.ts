import * as express from 'express';
import * as favicon from 'express-favicon';
import * as path from 'path';
import * as morgan from 'morgan';
import * as bodyParser from 'body-parser';

import dataRoutes from './routes/data-routes';
import colorRouter from './routes/color-routes';

const port = process.env.PORT || 8080;
const app = express();

app.use(morgan('tiny'));
app.use(favicon(path.join(__dirname, '/../build/favicon.ico')));
app.use(bodyParser.json());

app.use('/static', express.static(path.join(__dirname, '/../static')));
app.use('/data', dataRoutes);
app.use('/color', colorRouter);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(__dirname));
  app.use(express.static(path.join(__dirname, '/../build')));
  app.get('/*', async (req, res) => {
    res.sendFile(path.join(__dirname, '/../build/index.html'));
  });
}

app.listen(port, () => console.log(`App listening on port ${port}!`));
