import { isNaN, flatten, uniq, zipObject } from 'lodash';

import * as p from '../types';

export const computePollingAverages = (pollingData: p.PollingData, pollCount: number) => {
  const averagedPollingData = {};

  Object.keys(pollingData).map((state: p.State) => {
    averagedPollingData[state] = computePollingAveragesForState(pollingData[state], pollCount);
  });

  return averagedPollingData;
};

export const getUniqueCandidateList = (pollingData: p.PollingData): p.Candidate[] => {
  const statePolls = flatten(Object.values(pollingData));
  return getUniqueCandidateListFromPolls(statePolls);
};

const computePollingAveragesForState = (polls: p.Poll[], pollCount: number): p.CandidateResults => {
  const applicablePolls = polls.slice(0, pollCount);
  const candidatesForState = getUniqueCandidateListFromPolls(applicablePolls);
  const candidatePollingAverages = candidatesForState.map((candidate: p.Candidate) =>
    computePollingAverageForCandidate(candidate, applicablePolls)
  );

  return zipObject(candidatesForState, candidatePollingAverages);
};

const getUniqueCandidateListFromPolls = (statePolls: p.Poll[]) => {
  const nonUniqueCandidateList = flatten(statePolls.map((poll: p.Poll) => Object.keys(poll.candidateResults)));
  return uniq(nonUniqueCandidateList);
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
