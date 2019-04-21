import * as express from 'express';
import { omit } from 'lodash';

import {
  getAveragedPollingData,
  getWeightedDelegateTotals,
  getLastModified,
  getNationalPollingTrendData,
  getCandidateFinancialData,
  getFilteredPolls,
  getDistinctColumns
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

router.post('/polls', async (req, res, next) => {
  try {
    const polls = await getFilteredPolls(req.body, req.query.forceRefresh);
    res.send({ polls });
  } catch (e) {
    next(e);
  }
});

router.post('/polls/count', async (req, res, next) => {
  try {
    const polls = await getFilteredPolls(omit(req.body, 'limit'), req.query.forceRefresh);
    const count = polls.length;
    res.send({ count });
  } catch (e) {
    next(e);
  }
});

router.get('/distinct-columns', async (req, res, next) => {
  try {
    const columnValues = await getDistinctColumns();
    res.send({ columnValues });
  } catch (e) {
    next(e);
  }
});

router.get('/last-modified', (req, res, next) => {
  try {
    const lastModified = getLastModified();
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

router.get('/financials', async (req, res, next) => {
  try {
    const financialData = await getCandidateFinancialData();
    res.send({ financialData });
  } catch (e) {
    next(e);
  }
});

export default router;
