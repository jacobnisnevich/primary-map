import { isNaN, flatten, uniq, zipObject } from 'lodash';

import * as p from '../types';

import { schematizeCandidateNames } from '../util/common';

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

export const expandPollingData = (pollingData: p.PollingData): p.ExpandedPoll[] => {
  const states = Object.keys(pollingData);
  const candidateList = getUniqueCandidateList(pollingData);

  return states.reduce((expandedPolls: p.ExpandedPoll[], currentState: p.State) => {
    const statePolls = pollingData[currentState];
    const expandedStatePolls = expandStatePolls(currentState, statePolls, candidateList);
    return [...expandedPolls, ...expandedStatePolls];
  }, []);
};

export const flattenPollingData = (expandedPollingData: p.ExpandedPoll[]): p.FlatPoll[] => {
  return expandedPollingData.map((expandedPoll: p.ExpandedPoll) => ({
    date: expandedPoll.date,
    sample_size: expandedPoll.sampleSize,
    margin_of_error: expandedPoll.marginOfError,
    state: expandedPoll.state,
    ...expandedPoll.candidateResults
  }));
};

const expandStatePolls = (state: p.State, statePolls: p.Poll[], candidates: p.Candidate[]): p.ExpandedPoll[] => {
  return statePolls.map((statePoll: p.Poll) => {
    const stateCandidateResults = candidates.map((candidate: p.Candidate) => {
      if (statePoll.candidateResults[candidate]) {
        return statePoll.candidateResults[candidate];
      } else {
        return 0;
      }
    });
    const candidateResults = zipObject(schematizeCandidateNames(candidates), stateCandidateResults);

    const expandedStatePoll = {
      ...statePoll,
      candidateResults,
      state
    };

    return expandedStatePoll;
  });
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
