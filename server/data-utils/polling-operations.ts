import { isNaN, flatten, uniq, zipObject, sortBy } from 'lodash';

import * as p from '../types';

import { convertStatePollingDataToFlatPolls } from './data-shaping';

export const computePollingAverages = (pollingData: p.StatePollingData, pollCount: number) => {
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

export const getMostRecentPolls = async (pollingData: p.StatePollingData, count: number): Promise<p.FlatPoll[]> => {
  const flatPolls = convertStatePollingDataToFlatPolls(pollingData);
  const recentPolls = sortBy(flatPolls, poll => new Date(poll['date']))
    .reverse()
    .slice(0, count);
  return recentPolls;
};

const getUniqueCandidateListFromPolls = (statePolls: p.Poll[]) => {
  const nonUniqueCandidateList = flatten(statePolls.map((poll: p.Poll) => Object.keys(poll.candidateResults)));
  return uniq(nonUniqueCandidateList);
};

const computePollingAveragesForState = (polls: p.Poll[], pollCount: number): p.CandidateResults => {
  const applicablePolls = polls.slice(0, pollCount);
  const candidatesForState = getUniqueCandidateListFromPolls(applicablePolls);
  const candidatePollingAverages = candidatesForState.map((candidate: p.Candidate) =>
    computePollingAverageForCandidate(candidate, applicablePolls)
  );

  return zipObject(candidatesForState, candidatePollingAverages);
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
