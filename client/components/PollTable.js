import React, { Component, Fragment } from 'react';
import { startCase, isEmpty, pick } from 'lodash';

import './PollTable.css';

import { fixMessedUpName, getColumnFormatter, formatPercentageForTable } from '../utils/common';

export default class PollTable extends Component {
  filterOutEmptyColumns = mostRecentPollData => {
    const columns = Object.keys(mostRecentPollData[0]);

    const validColumns = columns.filter(column => {
      const valuesForColumn = mostRecentPollData.map(poll => poll[column]);
      return valuesForColumn.filter(value => value !== 0 && value !== '-').length > 0;
    });

    return mostRecentPollData.map(poll => pick(poll, validColumns));
  };

  getTableHead = () => {
    const { mostRecentPollData } = this.props;

    const filteredPollData = this.filterOutEmptyColumns(mostRecentPollData);

    return (
      <thead>
        <tr>
          {Object.keys(filteredPollData[0]).map((header, index) => (
            <th key={index}>{fixMessedUpName(startCase(header))}</th>
          ))}
        </tr>
      </thead>
    );
  };

  getTableCell = (poll, column, columnIndex, isWinningCandidate) => {
    const columnFormatter = getColumnFormatter(column) || formatPercentageForTable;
    return (
      <td key={columnIndex} className={isWinningCandidate ? 'winner' : ''}>
        {columnFormatter(poll[column])}
      </td>
    );
  };

  getWinningCandidateIndices = poll => {
    const columns = Object.values(poll);
    const marginOfError = parseFloat(columns[2]);
    const candidatePollResults = columns.slice(4, columns.length - 1).map(columnValue => {
      if (columnValue === '-') {
        return 0;
      }
      return columnValue;
    });
    const highestPollResult = Math.max(...candidatePollResults);
    const winningCandidateIndices = candidatePollResults
      .filter(result => result + marginOfError >= highestPollResult)
      .map(result => columns.indexOf(result));

    return winningCandidateIndices;
  };

  getTableRow = (poll, rowIndex) => {
    const winningCandidateIndices = this.getWinningCandidateIndices(poll);

    return (
      <tr key={rowIndex}>
        {Object.keys(poll).map((column, columnIndex) =>
          this.getTableCell(poll, column, columnIndex, winningCandidateIndices.includes(columnIndex))
        )}
      </tr>
    );
  };

  getTableBody = () => {
    const { mostRecentPollData } = this.props;

    const filteredPollData = this.filterOutEmptyColumns(mostRecentPollData);

    return (
      <tbody>
        {filteredPollData.map((poll, rowIndex) => {
          return this.getTableRow(poll, rowIndex);
        })}
      </tbody>
    );
  };

  render() {
    const { mostRecentPollData } = this.props;

    if (!isEmpty(mostRecentPollData)) {
      return (
        <table className="poll-table">
          {this.getTableHead()}
          {this.getTableBody()}
        </table>
      );
    } else {
      return <Fragment />;
    }
  }
}
