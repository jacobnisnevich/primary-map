import { zipObject, omit } from 'lodash';

import * as p from '../types';

import { schematizeCandidateNames, unschematizeCandidateNames } from '../util/common';
import { getUniqueCandidateList } from './polling-operations';

export const convertStatePollingDataToFlatPolls = (statePollingData: p.StatePollingData): p.FlatPoll[] => {
  return flattenPollingData(expandPollingData(statePollingData));
};

export const convertFlatPollsToStatePollingData = (polls: p.FlatPoll[]): p.StatePollingData => {
  const statesList = polls.map((poll: p.FlatPoll): string => poll.state);
  return getPollsForStates(statesList, polls);
};

const getPollsForStates = (states: p.State[], polls: p.FlatPoll[]): p.StatePollingData => {
  const pollsForStates = states.map(
    (state: p.State): p.Poll[] => {
      return polls
        .filter(
          (poll: p.FlatPoll): boolean => {
            return poll.state === state;
          }
        )
        .map(
          (poll: p.FlatPoll): p.Poll => {
            const candidateResults = getCandidateResultsFromFlatPoll(poll);
            return {
              date: new Date(poll.date),
              sampleSize: poll.sample_size,
              marginOfError: poll.margin_of_error,
              candidateResults
            };
          }
        );
    }
  );

  return zipObject(states, pollsForStates);
};

const getCandidateResultsFromFlatPoll = (poll: p.FlatPoll): p.CandidateResults => {
  const nonCandidateRows = ['date', 'sample_size', 'margin_of_error', 'state'];
  const candidateData = omit(poll, nonCandidateRows);
  const candidateNames = unschematizeCandidateNames(Object.keys(candidateData));
  const candidatePollValues = Object.values(candidateData).map(parseFloat);
  return zipObject(candidateNames, candidatePollValues);
};

const expandPollingData = (pollingData: p.StatePollingData): p.ExpandedPoll[] => {
  const states = Object.keys(pollingData);
  const candidateList = getUniqueCandidateList(pollingData);

  return states.reduce((expandedPolls: p.ExpandedPoll[], currentState: p.State): p.ExpandedPoll[] => {
    const statePolls = pollingData[currentState];
    const expandedStatePolls = expandStatePolls(currentState, statePolls, candidateList);
    return [...expandedPolls, ...expandedStatePolls];
  }, []);
};

const flattenPollingData = (expandedPollingData: p.ExpandedPoll[]): p.FlatPoll[] => {
  return expandedPollingData.map(
    (expandedPoll: p.ExpandedPoll): p.FlatPoll => ({
      date: expandedPoll.date,
      sample_size: expandedPoll.sampleSize,
      margin_of_error: expandedPoll.marginOfError,
      state: expandedPoll.state,
      ...insertDashesForUndefinedResults(expandedPoll.candidateResults)
    })
  );
};

const expandStatePolls = (state: p.State, statePolls: p.Poll[], candidates: p.Candidate[]): p.ExpandedPoll[] => {
  return statePolls.map((statePoll: p.Poll) => {
    const stateCandidateResults = candidates.map((candidate: p.Candidate) => {
      if (statePoll.candidateResults[candidate]) {
        return statePoll.candidateResults[candidate];
      } else {
        return undefined;
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

const insertDashesForUndefinedResults = (candidateResults: p.CandidateResults): Record<string, number | string> => {
  return zipObject(
    Object.keys(candidateResults),
    Object.values(candidateResults).map((result: number) => {
      if (result === undefined) {
        return '-';
      } else {
        return result;
      }
    })
  );
};
