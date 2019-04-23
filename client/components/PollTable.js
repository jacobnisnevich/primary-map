import React, { Component } from 'react';
import { startCase, isEmpty, pick, sum, zipObject } from 'lodash';
import { ScaleLoader } from 'react-spinners';

import './PollTable.css';

import { formatColumnHeader, getColumnFormatter, formatPercentageForTable } from '../utils/common';

export default class PollTable extends Component {
  getMaxCandidatesPerTable = () => {
    const { national, state, sortable } = this.props;

    if (national) {
      return 7;
    } else if (state) {
      return 6;
    } else if (sortable) {
      return 15;
    }
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
      return sum(polls.slice(0, 10).map(poll => (poll[candidate] === '-' ? 0 : poll[candidate])));
    });

    const candidateScores = zipObject(candidates, scores);

    return candidates.sort((a, b) => candidateScores[b] - candidateScores[a]);
  };

  getTableHead = () => {
    const { polls, title, national, sortable } = this.props;

    const filteredPollData = this.filterOutEmptyColumns(polls);
    const columns = this.getColumns(filteredPollData);

    const link = national
      ? 'https://en.wikipedia.org/wiki/Nationwide_opinion_polling_for_the_2020_Democratic_Party_presidential_primaries'
      : 'https://en.wikipedia.org/wiki/Statewide_opinion_polling_for_the_2020_Democratic_Party_presidential_primaries';

    return (
      <thead>
        {!sortable && (
          <tr>
            <td colSpan={columns.length} className="grid-title">
              <span>{title}</span>
              <span className="poll-link">
                (
                <a href={link} target="_blank" rel="noopener noreferrer">
                  source
                </a>
                )
              </span>
            </td>
          </tr>
        )}
        <tr>
          {columns.map((header, index) => (
            <th key={index}>{formatColumnHeader(startCase(header))}</th>
          ))}
        </tr>
      </thead>
    );
  };

  getTableCell = (poll, column, columnIndex, isWinningCandidate) => {
    const { heatmap } = this.props;
    const columnFormatter = getColumnFormatter(column) || formatPercentageForTable;
    let style = {};

    if (columnFormatter(poll[column]).includes('%') && heatmap) {
      style = { backgroundColor: `rgba(255, 0, 0, ${poll[column] / 100})` };
    }

    return (
      <td key={columnIndex} className={isWinningCandidate && !heatmap ? 'winner' : ''} style={style}>
        {columnFormatter(poll[column])}
      </td>
    );
  };

  getWinningCandidateIndices = (poll, columns) => {
    const marginOfError = parseFloat(poll.margin_of_error) || 0;
    const columnValues = columns.map(column => poll[column]);
    const candidatePollResults = columnValues.slice(this.getCandidateStartIndex(), columns.length).map(columnValue => {
      if (columnValue === '-') {
        return 0;
      }
      return columnValue;
    });
    const highestPollResult = Math.max(...candidatePollResults);
    const winningCandidateIndices = candidatePollResults
      .map((candidateResult, index) => ({
        isWinner: candidateResult + marginOfError >= highestPollResult,
        index: index + this.getCandidateStartIndex()
      }))
      .filter(candidateResult => candidateResult.isWinner)
      .map(candidateResult => candidateResult.index);

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
      <div
        className={`poll-table-container widget ${!isEmpty(polls) ? 'loaded' : 'loading'}`}
        key={this.props.key}
        style={this.props.style}
      >
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
