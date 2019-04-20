import { zipObject, omit } from 'lodash';

import * as p from '../types';

import { schematizeCandidateNames, unschematizeCandidateNames } from '../util/common';
import { getUniqueCandidateListFromPolls } from './polling-operations';

export const convertFlatPollsToStatePollingData = (polls: p.FlatPoll[]): p.StatePollingData => {
  const statesList = polls.map((poll: p.FlatPoll): string => poll.state);
  return getPollsForStates(statesList, polls);
};

export const convertPollsToFlatPolls = (pollingData: p.Poll[]): p.FlatPoll[] => {
  const fullCandidateList = getUniqueCandidateListFromPolls(pollingData);
  return flattenPollingData(pollingData, fullCandidateList);
};

export const convertFlatPollsToPolls = (polls: p.FlatPoll[]): p.Poll[] => {
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
    state: poll.state,
    pollingSource: poll.polling_source,
    date: new Date(poll.date),
    sampleSize: poll.sample_size,
    marginOfError: poll.margin_of_error,
    candidateResults
  };
};

const getCandidateResultsFromFlatPoll = (poll: p.FlatPoll): p.CandidateResults => {
  const nonCandidateRows = ['polling_source', 'date', 'sample_size', 'margin_of_error', 'state'];
  const candidateData = omit(poll, nonCandidateRows);
  const candidateNames = unschematizeCandidateNames(Object.keys(candidateData));
  const candidatePollValues = Object.values(candidateData).map(parseFloat);
  return zipObject(candidateNames, candidatePollValues);
};

const flattenPollingData = (expandedPollingData: p.ExpandedPoll[], candidateList): p.FlatPoll[] => {
  return expandedPollingData.map(
    (expandedPoll: p.ExpandedPoll): p.FlatPoll => ({
      polling_source: expandedPoll.pollingSource,
      date: expandedPoll.date,
      sample_size: expandedPoll.sampleSize || '-',
      margin_of_error: expandedPoll.marginOfError || '-',
      state: expandedPoll.state,
      ...insertDashesForUndefinedResults(formatCandidateResults(expandedPoll.candidateResults, candidateList))
    })
  );
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
