import { isNaN, flatten, uniq, zipObject, sortBy, pick } from 'lodash';

import * as p from '../types';

import { getPledgedDelegateJson } from './data-store';

export const computePollingAverages = (
  pollingData: p.StatePollingData,
  pollCount: number
): Record<p.State, p.CandidateResults> => {
  const averagedPollingData = {};

  Object.keys(pollingData).map((state: p.State) => {
    averagedPollingData[state] = computePollingAveragesForState(pollingData[state], pollCount);
  });

  return averagedPollingData;
};

export const getPledgedDelegateTotalsForCandidates = (
  averagedPollingData: p.AveragedPollingData
): p.CandidateResults => {
  const pledgedDelegateData = getPledgedDelegateJson();
  const states = Object.keys(pledgedDelegateData);
  const candidates = uniq(flatten(Object.values(averagedPollingData).map(Object.keys)));
  const initialState = zipObject(candidates, new Array(candidates.length).fill(0));

  return states.reduce((accumulatedDelegateTotals: p.CandidateResults, state: p.State) => {
    const delegatesForState = pledgedDelegateData[state];
    const pollingAverageForState = averagedPollingData[state];
    const newDelegateTotals = {};

    Object.keys(accumulatedDelegateTotals).map((candidate: p.Candidate) => {
      if (pollingAverageForState) {
        newDelegateTotals[candidate] =
          accumulatedDelegateTotals[candidate] +
          Math.round(delegatesForState * ((pollingAverageForState[candidate] || 0) / 100));
      } else {
        newDelegateTotals[candidate] = accumulatedDelegateTotals[candidate];
      }
    });

    return newDelegateTotals;
  }, initialState);
};

export const filterOutNullCandidatesFromPolls = (polls: p.Poll[]): p.Poll[] => {
  return polls.map(
    (poll: p.Poll): p.Poll => ({ ...polls, candidateResults: filterOutNullAndZeroCandidates(poll.candidateResults) })
  );
};

export const getUniqueCandidateListFromPolls = (polls: p.Poll[]): p.Candidate[] => {
  const nonUniqueCandidateList = flatten(
    polls.map((poll: p.Poll): p.Candidate[] => Object.keys(poll.candidateResults))
  );
  return uniq(nonUniqueCandidateList);
};

export const getMostRecentPolls = <PollType>(polls: PollType[], count: number): PollType[] => {
  const recentPolls = sortPollsByDate(polls).slice(0, count);
  return recentPolls;
};

export const getNationalPollingAveragesForDays = (
  polls: p.Poll[],
  pollCount: number,
  numberOfDays: number
): p.TrendData => {
  const days = generateDateRange(numberOfDays);
  const candidateResults = days.map(
    (day: Date): p.CandidateResults => computingRollingPollingAverage(polls, pollCount, day)
  );
  return { candidateResults, days };
};

const computingRollingPollingAverage = (polls: p.Poll[], pollCount: number, startDate: Date): p.CandidateResults => {
  const pollsBeforeDate = polls.filter((poll: p.Poll): boolean => poll.date < startDate);
  return computePollingAveragesForState(pollsBeforeDate, pollCount);
};

const generateDateRange = (numberOfDays: number): Date[] => {
  let days = [];

  for (let i = 0; i < numberOfDays * 3; i += 3) {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() - i);
    days = [...days, nextDate];
  }

  return days;
};

const sortPollsByDate = <PollType>(polls: PollType[]): PollType[] => {
  return sortBy(polls, poll => new Date(poll['date'])).reverse();
};

const computePollingAveragesForState = (polls: p.Poll[], pollCount: number): p.CandidateResults => {
  const applicablePolls = sortPollsByDate(polls).slice(0, pollCount);
  const candidatesForState = getUniqueCandidateListFromPolls(applicablePolls);
  const pollingAverages = candidatesForState.map(
    (candidate: p.Candidate): number => computePollingAverageForCandidate(candidate, applicablePolls)
  );
  const candidatePollingAverages = zipObject(candidatesForState, pollingAverages);

  return filterOutNullAndZeroCandidates(candidatePollingAverages);
};

const computePollingAverageForCandidate = (candidate: p.Candidate, polls: p.Poll[]): number => {
  let pollingTotalCount = 0;
  let pollingTotalValue = 0;

  polls.forEach(poll => {
    if (!isNaN(poll.candidateResults[candidate])) {
      pollingTotalCount += 1;
      pollingTotalValue += poll.candidateResults[candidate];
    }
  });

  return pollingTotalValue / pollingTotalCount;
};

const filterOutNullAndZeroCandidates = (candidateResults: p.CandidateResults): p.CandidateResults => {
  const candidatesWithNonEmptyResults = Object.keys(candidateResults).filter(
    (candidate: p.Candidate): boolean => !!candidateResults[candidate]
  );
  return pick(candidateResults, candidatesWithNonEmptyResults);
};
