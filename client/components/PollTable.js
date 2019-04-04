import React, { Component, Fragment } from 'react';
import { startCase, isEmpty, pick } from 'lodash';

import './PollTable.css';

import { fixMessedUpName, getColumnFormatter } from '../utils/common';

export default class PollTable extends Component {
  filterOutEmptyColumns = mostRecentPollData => {
    const columns = Object.keys(mostRecentPollData[0]);

    const validColumns = columns.filter(column => {
      const valuesForColumn = mostRecentPollData.map(poll => poll[column]);
      return valuesForColumn.filter(value => value !== 0).length > 0;
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

  getTableBody = () => {
    const { mostRecentPollData } = this.props;

    const filteredPollData = this.filterOutEmptyColumns(mostRecentPollData);

    return (
      <tbody>
        {filteredPollData.map((poll, rowIndex) => {
          const columns = Object.values(poll);
          const candidateColumns = columns.slice(4, columns.length - 1);
          const winningCandidateIndex = columns.indexOf(Math.max([candidateColumns]));

          return (
            <tr key={rowIndex}>
              {Object.keys(poll).map((column, columnIndex) => (
                <td key={columnIndex} className={columnIndex === winningCandidateIndex + 5 && 'winner'}>
                  {getColumnFormatter(column)(poll[column])}
                </td>
              ))}
            </tr>
          );
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
