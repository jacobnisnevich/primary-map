import React, { Component } from 'react';
import { startCase, isEmpty, pick, sum, zipObject } from 'lodash';
import { ScaleLoader } from 'react-spinners';

import './PollTable.css';

import { formatColumnHeader, getColumnFormatter, formatPercentageForTable } from '../utils/common';

export default class PollTable extends Component {
  getMaxCandidatesPerTable = () => {
    return this.props.national ? 7 : 6;
  };

  getCandidateStartIndex = () => {
    return this.props.national ? 4 : 5;
  };

  filterOutEmptyColumns = polls => {
    const columns = Object.keys(polls[0]);

    const validColumns = columns.filter(column => {
      const valuesForColumn = polls.map(poll => poll[column]);
      return valuesForColumn.filter(value => value !== 0 && value !== '-').length > 0;
    });

    return polls.map(poll => pick(poll, validColumns));
  };

  getColumns = polls => {
    const unfilteredColumns = Object.keys(polls[0]);
    const sortedCandidates = this.sortCandidatesByAverageScore(polls).slice(0, this.getMaxCandidatesPerTable());

    const nonCandidateColumns = unfilteredColumns.slice(0, this.getCandidateStartIndex());
    const candidateColumns = sortedCandidates.slice(0, this.getMaxCandidatesPerTable());

    return [...nonCandidateColumns, ...candidateColumns];
  };

  sortCandidatesByAverageScore = polls => {
    const columns = Object.keys(polls[0]);
    const candidates = columns.slice(this.getCandidateStartIndex(), columns.length);
    const scores = candidates.map(candidate => {
      return sum(polls.map(poll => (poll[candidate] === '-' ? 0 : poll[candidate])));
    });

    const candidateScores = zipObject(candidates, scores);

    return candidates.sort((a, b) => candidateScores[b] - candidateScores[a]);
  };

  getTableHead = () => {
    const { polls, title } = this.props;

    const filteredPollData = this.filterOutEmptyColumns(polls);
    const columns = this.getColumns(filteredPollData);

    return (
      <thead>
        <tr>
          <td colSpan={columns.length} className="grid-title">
            {title}
          </td>
        </tr>
        <tr>
          {columns.map((header, index) => (
            <th key={index}>{formatColumnHeader(startCase(header))}</th>
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

  getWinningCandidateIndices = (poll, columns) => {
    const marginOfError = parseFloat(columns[2]) || 0;
    const columnValues = columns.map(column => poll[column]);
    const candidatePollResults = columnValues.slice(this.getCandidateStartIndex(), columns.length).map(columnValue => {
      if (columnValue === '-') {
        return 0;
      }
      return columnValue;
    });
    const highestPollResult = Math.max(...candidatePollResults);
    const winningCandidateIndices = candidatePollResults
      .filter(result => result + marginOfError >= highestPollResult)
      .map(result => columnValues.indexOf(result));

    return winningCandidateIndices;
  };

  getTableRow = (poll, rowIndex, columns) => {
    const winningCandidateIndices = this.getWinningCandidateIndices(poll, columns);

    return (
      <tr key={rowIndex}>
        {columns.map((column, columnIndex) =>
          this.getTableCell(poll, column, columnIndex, winningCandidateIndices.includes(columnIndex))
        )}
      </tr>
    );
  };

  getTableBody = () => {
    const { polls } = this.props;

    const filteredPollData = this.filterOutEmptyColumns(polls);
    const columns = this.getColumns(filteredPollData);

    return (
      <tbody>
        {filteredPollData.map((poll, rowIndex) => {
          return this.getTableRow(poll, rowIndex, columns);
        })}
      </tbody>
    );
  };

  render() {
    const { polls } = this.props;

    return (
      <div className="poll-table-container widget" key={this.props.key} style={this.props.style}>
        {!isEmpty(polls) ? (
          <table className="poll-table">
            {this.getTableHead()}
            {this.getTableBody()}
          </table>
        ) : (
          <ScaleLoader sizeUnit="px" size={150} color="#444444" loading={isEmpty(polls)} />
        )}
      </div>
    );
  }
}
