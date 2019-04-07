import { isNaN, flatten, uniq, zipObject, sortBy, pick } from 'lodash';

import * as p from '../types';

import { convertStatePollingDataToFlatPolls } from './data-shaping';

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

export const getUniqueCandidateList = (pollingData: p.StatePollingData): p.Candidate[] => {
  const statePolls = flatten(Object.values(pollingData));
  return getUniqueCandidateListFromPolls(statePolls);
};

export const getUniqueCandidateListFromPolls = (statePolls: p.Poll[]) => {
  const nonUniqueCandidateList = flatten(
    statePolls.map((poll: p.Poll): p.Candidate[] => Object.keys(poll.candidateResults))
  );
  return uniq(nonUniqueCandidateList);
};

export const getMostRecentPolls = (pollingData: p.StatePollingData, count: number): p.FlatPoll[] => {
  const flatPolls = convertStatePollingDataToFlatPolls(pollingData);
  const recentPolls = sortPollsByDate(flatPolls).slice(0, count);
  return recentPolls;
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
