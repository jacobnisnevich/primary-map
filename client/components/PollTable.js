import React, { Component } from 'react';
import { startCase, isEmpty, pick } from 'lodash';
import { ScaleLoader } from 'react-spinners';

import './PollTable.css';

import { fixMessedUpName, getColumnFormatter, formatPercentageForTable } from '../utils/common';

export default class PollTable extends Component {
  filterOutEmptyColumns = polls => {
    const columns = Object.keys(polls[0]);

    const validColumns = columns.filter(column => {
      const valuesForColumn = polls.map(poll => poll[column]);
      return valuesForColumn.filter(value => value !== 0 && value !== '-').length > 0;
    });

    return polls.map(poll => pick(poll, validColumns));
  };

  getTableHead = () => {
    const { polls, title } = this.props;

    const filteredPollData = this.filterOutEmptyColumns(polls);

    return (
      <thead>
        <tr>
          <td colSpan={Object.keys(filteredPollData[0]).length} className="grid-title">
            {title}
          </td>
        </tr>
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
      <td key={columnIndex} nowrap className={isWinningCandidate ? 'winner' : ''}>
        {columnFormatter(poll[column])}
      </td>
    );
  };

  getWinningCandidateIndices = poll => {
    const { national } = this.props;

    const columns = Object.values(poll);
    const marginOfError = parseFloat(columns[2]) || 0;
    const candidatePollResults = columns.slice(national ? 3 : 4, columns.length - 1).map(columnValue => {
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
    const { polls } = this.props;

    const filteredPollData = this.filterOutEmptyColumns(polls);

    return (
      <tbody>
        {filteredPollData.map((poll, rowIndex) => {
          return this.getTableRow(poll, rowIndex);
        })}
      </tbody>
    );
  };

  render() {
    const { polls } = this.props;

    return (
      <div className="poll-table-container" key={this.props.key} style={this.props.style}>
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
