import * as p from '../../../server/types';

import {
  computePollingAverages,
  getUniqueCandidateList,
  getUniqueCandidateListFromPolls,
  getMostRecentPolls
} from '../../../server/data-utils/polling-operations';

const testStatePollingData = {
  California: [
    {
      date: new Date('Jan 2 2018'),
      candidateResults: {
        'Bernie Sanders': 5,
        'Joe Biden': 6,
        'Pete Buttigieg': NaN
      }
    },
    {
      date: new Date('Jan 1 2018'),
      candidateResults: {
        'Joe Biden': 8,
        'Bernie Sanders': 4,
        'Pete Buttigieg': 2
      }
    }
  ],
  Washington: [
    {
      date: new Date('Jan 3 2018'),
      candidateResults: {
        'Kamala Harris': 3,
        'Joe Biden': 7
      }
    }
  ]
};

describe('computePollingAverages', () => {
  it('should compute the polling average for each state/candidate', () => {
    const expectedPollingAverages = {
      California: { 'Bernie Sanders': 4.5, 'Joe Biden': 7, 'Pete Buttigieg': 2 },
      Washington: { 'Kamala Harris': 3, 'Joe Biden': 7 }
    };
    const pollingAverages = computePollingAverages(testStatePollingData, 2);
    expect(pollingAverages).toEqual(expectedPollingAverages);
  });
});

describe('getUniqueCandidateList', () => {
  it('should return a unique list of candidates from a state polling data object', () => {
    const expectedCandidateList = ['Bernie Sanders', 'Joe Biden', 'Pete Buttigieg', 'Kamala Harris'].sort();
    const uniqueCandidateList = getUniqueCandidateList(testStatePollingData).sort();
    expect(uniqueCandidateList).toEqual(expectedCandidateList);
  });
});

describe('getUniqueCandidateListFromPolls', () => {
  it('should return a unique list of candidates from a flat list of polls', () => {
    const expectedCandidateList = ['Bernie Sanders', 'Joe Biden', 'Pete Buttigieg', 'Kamala Harris'].sort();
    const flatPollingData = [...testStatePollingData['California'], ...testStatePollingData['Washington']];
    const uniqueCandidateList = getUniqueCandidateListFromPolls(flatPollingData).sort();
    expect(uniqueCandidateList).toEqual(expectedCandidateList);
  });
});

describe('getMostRecentPolls', () => {
  it('should return the most recent polls for the given count', () => {
    const expectedRecentPolls = [
      testStatePollingData['Washington'][0].date,
      testStatePollingData['California'][0].date
    ];
    const recentPolls = getMostRecentPolls(testStatePollingData, 2).map((poll: p.FlatPoll): Date => poll.date);
    expect(recentPolls).toEqual(expectedRecentPolls);
  });
});
