import distinctColors from 'distinct-colors';
import cheerio from 'cheerio';
import axios from 'axios';
import { startCase, inRange, toNumber, zipObject, isNaN, flatten, uniq } from 'lodash';

import { STATE_NAMES, CAUCUS, PRIMARY } from './constants';

export const getMapData = async () => {
  const pollingData = await loadWikipediaPollingData();
  const palette = getPalette(pollingData);
  return { pollingData, palette };
};

const getPalette = pollingData => {
  const distinctCandidateNames = uniq(flatten(Object.values(pollingData).map(Object.keys)));
  const colors = distinctColors({ count: distinctCandidateNames.length });
  return zipObject(distinctCandidateNames, colors);
}

const loadWikipediaPollingData = async () => {
  const WIKIPEDIA_POLLING_URL = 'https://en.wikipedia.org/wiki/Statewide_opinion_polling_for_the_2020_Democratic_Party_presidential_primaries';
  const response = await axios.get(WIKIPEDIA_POLLING_URL);
  const $ = cheerio.load(response.data);
  
  const statePollingData = STATE_NAMES.map(stateName => getStateData(stateName, $));

  return zipObject(STATE_NAMES, statePollingData);
};

const getStateData = (stateName, $) => {
  const stateNameFormatted = stateName.split(' ').join('_');
  const statePrimaryId = `${stateNameFormatted}_${PRIMARY}`; 
  const stateCaucusId = `${stateNameFormatted}_${CAUCUS}`; 

  const primaryHeaderTextElement = $(`#${statePrimaryId}`)[0];
  const caucusHeaderTextElement = $(`#${stateCaucusId}`)[0];

  if (primaryHeaderTextElement) {
    return getWikiTableData(primaryHeaderTextElement, $);
  } else if (caucusHeaderTextElement) {
    return getWikiTableData(caucusHeaderTextElement, $);
  }

  return {};
};

const getWikiTableData = (headerTextElement, $) => {
  const tableElement = $(headerTextElement).parent().next();
  const tableRows = $(tableElement).find('tr');
  const tableHeaderElement = $(tableRows[0]);
  
  const mostRecentPollDataRows = tableRows.slice(1, 6);

  const tableHeaderData = parseTableHeader(tableHeaderElement, $);
  return parseTableData(tableHeaderData, mostRecentPollDataRows, $);
};

const parseTableHeader = (tableHeaderElement, $) => {
  const tableHeaderColumns = tableHeaderElement.find('th');

  let candidates = [];
  let startIndex = undefined;
  let endIndex = undefined;

  tableHeaderColumns.each((index, tableHeaderColumn) => {
    const headerColumnText = $(tableHeaderColumn).text().trim();
    if (isValidColumn(headerColumnText)) {
      if (startIndex === undefined) {
        startIndex = index;
      }

      candidates = [...candidates, startCase(headerColumnText)];
    } else {
      if (startIndex !== undefined && endIndex === undefined) {
        endIndex = index;
      }
    }
  });

  return { candidates, startIndex, endIndex };
};

const isValidColumn = columnHeaderText => {
  const ignoreHeaders = ['Poll source', 'Date(s) administered', 'Sample size', 'Marginof error', 'Other', 'Undecided']
  
  return ignoreHeaders.reduce((previousValue, currentValue) => {
    return previousValue && !(columnHeaderText === currentValue || columnHeaderText === currentValue.split(' ').join(''));
  }, true);
};

const parseTableData = (tableHeaderData, tableDataRows, $) => {
  const { candidates } = tableHeaderData;
  let polls = [];

  tableDataRows.each((index, tableDataRow) => {
    polls = [...polls, getPollFromTableDataRow($(tableDataRow), tableHeaderData, candidates, $)];
  });

  return zipObject(candidates, candidates.map(candidate => computePollingAverage(candidate, polls)));
}

const getPollFromTableDataRow = (tableDataRowElement, tableHeaderData, candidates, $) => {
  let { startIndex, endIndex } = tableHeaderData;
  const poll = {};

  // Adjust for sub-polling
  const firstCellHasLink = $(tableDataRowElement.find('td')[0]).find('a')[0];
  if (!firstCellHasLink) {
    startIndex -= 4;
    endIndex -= 4;
  }

  tableDataRowElement.find('td').each((index, tableDataCell) => {
    const candidateIndex = index - startIndex;
    if (inRange(index, startIndex, endIndex)) {
      const candidate = candidates[candidateIndex];
      poll[candidate] = cleanUpPollDataValue($(tableDataCell).text());
    }
  });

  return poll;
}

const cleanUpPollDataValue = pollDataValueText => {
  return toNumber(pollDataValueText.trim().replace(/\[.*\]/gi, '').replace('%', ''));
}

const computePollingAverage = (candidate, polls) => {
  let pollingTotalCount = 0;
  let pollingTotalValue = 0;

  polls.forEach(poll => {
    if (!isNaN(poll[candidate])) {
      pollingTotalCount += 1;
      pollingTotalValue += poll[candidate];
    }
  });

  return pollingTotalValue / pollingTotalCount;
}
