import React, { Component, Fragment } from 'react';
import { isEmpty, sortBy } from 'lodash';
import { ScaleLoader } from 'react-spinners';

import { getColorForCandidate, fixMessedUpName } from '../utils/common';

import './PledgedDelegateScoreboard.css';

export default class PledgedDelegateScoreboard extends Component {
  getPledgedDelegates = () => {
    const { weightedDelegateTotals, palette } = this.props;

    const candidateNames = Object.keys(weightedDelegateTotals);
    const topTotals = Object.values(weightedDelegateTotals)
      .sort((a, b) => b - a)
      .slice(0, 8);

    const sortedTopCandidates = sortBy(
      candidateNames.filter(candidate => topTotals.includes(weightedDelegateTotals[candidate])),
      candidate => weightedDelegateTotals[candidate]
    ).reverse();

    const totalDelegatesSoFar = Object.values(weightedDelegateTotals).reduce((total, number) => total + number);

    return sortedTopCandidates.map((candidate, index) => {
      return (
        <div key={index} className="pledged-delegate-entry">
          <div className="name">{fixMessedUpName(candidate)}</div>
          <div className="delegates">{weightedDelegateTotals[candidate]}</div>
          <div
            className="bar"
            style={{
              width: `${(weightedDelegateTotals[candidate] / totalDelegatesSoFar) * 100}%`,
              backgroundColor: getColorForCandidate(candidate, palette)
            }}
          />
        </div>
      );
    });
  };

  render() {
    const { weightedDelegateTotals, palette } = this.props;

    return (
      <div className="pledged-delegates-container widget" key={this.props.key} style={this.props.style}>
        {!isEmpty(weightedDelegateTotals) && !isEmpty(palette) ? (
          <Fragment>
            <div className="grid-title">Estimated Pledged Delegates</div>
            <div className="pledged-delegates">{this.getPledgedDelegates()}</div>
          </Fragment>
        ) : (
          <div className="pledged-delegates-loading-container">
            <ScaleLoader sizeUnit="px" size={150} color="#444444" loading={isEmpty(weightedDelegateTotals)} />
          </div>
        )}
      </div>
    );
  }
}
