import React, { Component, Fragment } from 'react';
import { isEmpty, sum, zipObject } from 'lodash';
import { ScaleLoader } from 'react-spinners';

import './CandidateFinancials.css';
import { formatCurrency } from '../utils/common';

export default class CandidateFinancials extends Component {
  renderFinancialDataTable = () => {
    const { financialData } = this.props;

    const candidates = Object.keys(financialData);
    const financialTotals = candidates.map(candidate => ({
      totalRaised: sum(financialData[candidate].map(report => report.raised)),
      totalSpent: sum(financialData[candidate].map(report => report.spent))
    }));
    const candidateFinancialTotals = zipObject(candidates, financialTotals);
    const sortedCandidates = candidates
      .sort((a, b) => candidateFinancialTotals[b].totalRaised - candidateFinancialTotals[a].totalRaised)
      .slice(0, 8);

    return (
      <table className="candidate-financials-table">
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Total Receipts</th>
            <th>Total Spend</th>
          </tr>
        </thead>
        <tbody>
          {sortedCandidates.map((candidate, index) => (
            <tr key={index}>
              <td>{candidate}</td>
              <td>{formatCurrency(candidateFinancialTotals[candidate].totalRaised)}</td>
              <td>{formatCurrency(candidateFinancialTotals[candidate].totalSpent)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  render() {
    const { key, style, financialData } = this.props;

    return (
      <div className="candidate-financials-container widget" key={key} style={style}>
        {!isEmpty(financialData) ? (
          <Fragment>
            <div className="grid-title">Financial Data</div>
            <div className="candidate-financials">{this.renderFinancialDataTable()}</div>
          </Fragment>
        ) : (
          <div className="candidate-financials-loading-container">
            <ScaleLoader sizeUnit="px" size={150} color="#444444" loading={isEmpty(financialData)} />
          </div>
        )}
      </div>
    );
  }
}
