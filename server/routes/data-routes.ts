import * as express from 'express';

import {
  getAveragedPollingData,
  getWeightedDelegateTotals,
  getMostRecentPollData,
  getRawPolls,
  getLastModified,
  getNationalPollingTrendData
} from '../service/data-service';
const router = express.Router();

router.get('/state-polling-data', async (req, res, next) => {
  try {
    const averagePollingData = await getAveragedPollingData();
    const weightedDelegateTotals = getWeightedDelegateTotals(averagePollingData);
    res.send({ averagePollingData, weightedDelegateTotals });
  } catch (e) {
    next(e);
  }
});

router.get('/recent-polls/:type', async (req, res, next) => {
  try {
    const mostRecentPollData = await getMostRecentPollData(req.query.count, req.params.type);
    res.send({ mostRecentPollData });
  } catch (e) {
    next(e);
  }
});

router.get('/raw/:type', async (req, res, next) => {
  try {
    const data = await getRawPolls(req.params.type);
    res.send({ data });
  } catch (e) {
    next(e);
  }
});

router.get('/last-modified/:type', (req, res, next) => {
  try {
    const lastModified = getLastModified(req.params.type);
    res.send({ lastModified });
  } catch (e) {
    next(e);
  }
});

router.get('/national-trends', async (req, res, next) => {
  try {
    const nationalPollingTrendData = await getNationalPollingTrendData();
    res.send({ nationalPollingTrendData });
  } catch (e) {
    next(e);
  }
});

export default router;
