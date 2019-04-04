import React, { Component, Fragment } from 'react';
import { startCase, isEmpty } from 'lodash';

import './PollTable.css';

import { fixMessedUpName, getColumnFormatter } from '../utils/common';

export default class PollTable extends Component {
  getTableHead = () => {
    const { mostRecentPollData } = this.props;

    return (
      <thead>
        <tr>
          {Object.keys(mostRecentPollData[0]).map((header, index) => (
            <th key={index}>{fixMessedUpName(startCase(header))}</th>
          ))}
        </tr>
      </thead>
    );
  };

  getTableBody = () => {
    const { mostRecentPollData } = this.props;

    return (
      <tbody>
        {mostRecentPollData.map((poll, rowIndex) => {
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
