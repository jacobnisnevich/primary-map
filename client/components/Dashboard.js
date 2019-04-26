import React, { Component } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';

import PrimaryMap from './PrimaryMap';
import Legend from './Legend';
import PollTable from './PollTable';
import PledgedDelegateScoreboard from './PledgedDelegateScoreboard';
import NationalPollingTrends from './NationalPollingTrends';
import CandidateFinancials from './CandidateFinancials';

import { getColorForCandidate, fixMessedUpName } from '../utils/common';
import { gridLayout } from '../layout';

import './Dashboard.css';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

export default class Dashboard extends Component {
  state = {
    breakpoint: 'lg'
  };

  getGridLayouts = () => {
    return gridLayout;
  };

  getGridCols = () => {
    return { lg: 12, md: 6, sm: 6 };
  };

  getGridBreakpoints = () => {
    return {
      lg: 1760,
      md: 600,
      sm: 0
    };
  };

  onBreakpointChange = breakpoint => {
    this.setState({ breakpoint });
  };

  getCandidateColorForLegend = (index, candidate) => {
    const { palette } = this.props;
    const color = getColorForCandidate(candidate, palette);

    return (
      <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ backgroundColor: color, border: '1px solid black', height: 16, width: 16, margin: 8 }} />
        <div>{fixMessedUpName(candidate)}</div>
      </div>
    );
  };

  render() {
    const {
      averagePollingData,
      palette,
      mostRecentStatePollData,
      mostRecentNationalPollData,
      weightedDelegateTotals,
      nationalPollingTrendData,
      financialData
    } = this.props;

    return (
      <ResponsiveReactGridLayout
        className={`layout ${this.state.breakpoint}`}
        cols={this.getGridCols()}
        layouts={this.getGridLayouts()}
        breakpoints={this.getGridBreakpoints()}
        onBreakpointChange={this.onBreakpointChange}
        isDraggable={false}
        rowHeight={50}
        compactType="vertical"
      >
        <PrimaryMap
          key="primary-map"
          averagePollingData={averagePollingData}
          palette={palette}
          getCandidateColorForLegend={this.getCandidateColorForLegend}
        />
        <Legend key="legend" palette={palette} getCandidateColorForLegend={this.getCandidateColorForLegend} />
        <PollTable
          state
          key="recent-state-polls"
          polls={mostRecentStatePollData}
          title="Most Recent State Primary Polls"
        />
        <PollTable
          national
          key="recent-national-polls"
          polls={mostRecentNationalPollData}
          title="Most Recent National Primary Polls"
        />
        <PledgedDelegateScoreboard
          key="pledged-delegate-scoreboard"
          weightedDelegateTotals={weightedDelegateTotals}
          palette={palette}
        />
        <NationalPollingTrends
          key="national-polling-trends"
          nationalPollingTrendData={nationalPollingTrendData}
          palette={palette}
        />
        <CandidateFinancials key="candidate-financials" financialData={financialData} />
      </ResponsiveReactGridLayout>
    );
  }
}
