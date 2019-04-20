import * as p from '../types';

import { getPolls, getLastModifiedTime } from '../data-utils/data-store';
import {
  computePollingAverages,
  getPledgedDelegateTotalsForCandidates,
  getNationalPollingAveragesForDays
} from '../data-utils/polling-operations';
import { getFinancialDataForCandidates } from '../data-utils/fec-data';
import { convertFlatPollsToStatePollingData, convertPollsToFlatPolls } from '../data-utils/data-shaping';
import { FilterOperator } from '../util/constants';

export const getFilteredPolls = async (pollFilter: p.PollFilter, forceRefresh: boolean): Promise<p.FlatPoll[]> => {
  const polls = await getPolls(pollFilter, forceRefresh);
  return convertPollsToFlatPolls(polls);
};

export const getAveragedPollingData = async (): Promise<p.AveragedPollingData> => {
  const statePolls = await getPolls({
    columnFilters: [
      {
        field: 'state',
        operator: FilterOperator.NotEqualTo as p.ColumnFilterOperator,
        operand: ''
      }
    ]
  });

  const stateFlatPolls = convertPollsToFlatPolls(statePolls);
  const statePollingData = convertFlatPollsToStatePollingData(stateFlatPolls);
  const averagedPollingData = computePollingAverages(statePollingData, 5);
  return averagedPollingData;
};

export const getWeightedDelegateTotals = (averagedPollingData: p.AveragedPollingData): p.CandidateResults => {
  return getPledgedDelegateTotalsForCandidates(averagedPollingData);
};

export const getLastModified = (): Date => {
  return getLastModifiedTime();
};

export const getNationalPollingTrendData = async (): Promise<p.TrendData> => {
  const nationalPolls = await getPolls({
    columnFilters: [
      {
        field: 'state',
        operator: FilterOperator.EqualTo as p.ColumnFilterOperator,
        operand: ''
      }
    ]
  });

  return getNationalPollingAveragesForDays(nationalPolls, 5, 30);
};

export const getCandidateFinancialData = async (): Promise<p.CandidateFinancialData> => {
  return await getFinancialDataForCandidates();
};
