import axios from 'axios';

export const getStatePollingData = async () => {
  const statePollingDataResponse = await axios.get('/data/state-polling-data');
  return statePollingDataResponse.data;
};

export const getPalette = async () => {
  const paletteResponse = await axios.get('/color/palette');
  return paletteResponse.data;
};

export const getRecentStatePolls = async count => {
  const statePollsResponse = await axios.post('/data/polls', {
    limit: count,
    sortCriteria: {
      field: 'date',
      direction: 'Desc'
    },
    columnFilters: [
      {
        field: 'state',
        operator: 'NotEqualTo',
        operand: ''
      }
    ]
  });
  return statePollsResponse.data.polls;
};

export const getRecentNationalPolls = async count => {
  const mostRecentNationalPollDataResponse = await axios.post('/data/polls', {
    limit: count,
    sortCriteria: {
      field: 'date',
      direction: 'Desc'
    },
    columnFilters: [
      {
        field: 'state',
        operator: 'EqualTo',
        operand: ''
      }
    ]
  });
  return mostRecentNationalPollDataResponse.data.polls;
};

export const getPolls = async pollFilter => {
  const pollsResponse = await axios.post('/data/polls', pollFilter);
  return pollsResponse.data.polls;
};

export const getPollCount = async pollFilter => {
  const pollCountResponse = await axios.post('/data/polls/count', pollFilter);
  return pollCountResponse.data.count;
};

export const getDistinctColumns = async () => {
  const distinctColumnValuesResponse = await axios.get('/data/distinct-columns');
  return distinctColumnValuesResponse.data.columnValues;
};

export const getNationalTrends = async () => {
  const nationalPollingTrendDataResponse = await axios.get('/data/national-trends');
  return nationalPollingTrendDataResponse.data;
};

export const getLastModifiedDate = async () => {
  const lastModifiedDateResponse = await axios.get('/data/last-modified');
  return lastModifiedDateResponse.data.lastModified;
};

export const getFinancialData = async () => {
  const financialDataResponse = await axios.get('/data/financials');
  return financialDataResponse.data;
};
