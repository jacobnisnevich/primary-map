import { zipObject, omit } from 'lodash';

import * as p from '../types';

import { schematizeCandidateNames, unschematizeCandidateNames } from '../util/common';
import { getUniqueCandidateList, getUniqueCandidateListFromPolls } from './polling-operations';

export const convertStatePollingDataToFlatPolls = (statePollingData: p.StatePollingData): p.FlatPoll[] => {
  const fullCandidateList = getUniqueCandidateList(statePollingData);
  return flattenPollingData(expandPollingData(statePollingData), fullCandidateList);
};

export const convertFlatPollsToStatePollingData = (polls: p.FlatPoll[]): p.StatePollingData => {
  const statesList = polls.map((poll: p.FlatPoll): string => poll.state);
  return getPollsForStates(statesList, polls);
};

export const convertNationalPollingDataToFlatPolls = (nationalPollingData: p.Poll[]): p.FlatPoll[] => {
  const fullCandidateList = getUniqueCandidateListFromPolls(nationalPollingData);
  return flattenPollingData(nationalPollingData, fullCandidateList).map(
    (poll: p.FlatPoll): p.FlatPoll => omit(poll, 'state')
  );
};

export const convertFlatPollsToNationalPollingData = (polls: p.FlatPoll[]): p.Poll[] => {
  return polls.map(unexpandPoll);
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
        .map(unexpandPoll);
    }
  );

  return zipObject(states, pollsForStates);
};

const unexpandPoll = (poll: p.FlatPoll): p.Poll => {
  const candidateResults = getCandidateResultsFromFlatPoll(poll);
  return {
    date: new Date(poll.date),
    sampleSize: poll.sample_size,
    marginOfError: poll.margin_of_error,
    candidateResults
  };
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

  return states.reduce((expandedPolls: p.ExpandedPoll[], currentState: p.State): p.ExpandedPoll[] => {
    const statePolls = pollingData[currentState];
    const expandedStatePolls = expandStatePolls(currentState, statePolls);
    return [...expandedPolls, ...expandedStatePolls];
  }, []);
};

const flattenPollingData = (expandedPollingData: p.ExpandedPoll[], candidateList): p.FlatPoll[] => {
  return expandedPollingData.map(
    (expandedPoll: p.ExpandedPoll): p.FlatPoll => ({
      date: expandedPoll.date,
      sample_size: expandedPoll.sampleSize || '-',
      margin_of_error: expandedPoll.marginOfError || '-',
      state: expandedPoll.state,
      ...insertDashesForUndefinedResults(formatCandidateResults(expandedPoll.candidateResults, candidateList))
    })
  );
};

const expandStatePolls = (state: p.State, statePolls: p.Poll[]): p.ExpandedPoll[] => {
  return statePolls.map((statePoll: p.Poll) => {
    const candidateResults = statePoll.candidateResults;

    const expandedStatePoll = {
      ...statePoll,
      candidateResults,
      state
    };

    return expandedStatePoll;
  });
};

const formatCandidateResults = (
  candidateResults: p.CandidateResults,
  candidates: p.Candidate[]
): p.CandidateResults => {
  const results = candidates.map((candidate: p.Candidate) => {
    if (candidateResults[candidate]) {
      return candidateResults[candidate];
    } else {
      return undefined;
    }
  });

  return zipObject(schematizeCandidateNames(candidates), results);
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
