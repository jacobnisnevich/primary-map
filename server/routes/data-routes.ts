import * as express from 'express';

import { getAveragedPollingData, getMostRecentPollData, getRawPolls } from '../service/data-service';

const router = express.Router();

router.get('/state-polling-data', async (req, res, next) => {
  try {
    const averagePollingData = await getAveragedPollingData();
    res.send({ averagePollingData });
  } catch (e) {
    next(e);
  }
});

router.get('/recent-polls', async (req, res, next) => {
  try {
    const mostRecentPollData = await getMostRecentPollData(req.query.count);
    res.send({ mostRecentPollData });
  } catch (e) {
    next(e);
  }
});

router.get('/raw', (req, res, next) => {
  try {
    const data = getRawPolls();
    res.send({ data });
  } catch (e) {
    next(e);
  }
});

export default router;
