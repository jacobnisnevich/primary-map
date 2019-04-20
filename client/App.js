import React, { Component } from 'react';
import axios from 'axios';
import { isEmpty } from 'lodash';
import ReactTooltip from 'react-tooltip';
import { Responsive, WidthProvider } from 'react-grid-layout';
import moment from 'moment';

import { formatPercentage, getColorForCandidate, fixMessedUpName } from './utils/common';
import { gridLayout } from './layout';

import PrimaryMap from './components/PrimaryMap';
import Legend from './components/Legend';
import PollTable from './components/PollTable';
import PledgedDelegateScoreboard from './components/PledgedDelegateScoreboard';
import NationalPollingTrends from './components/NationalPollingTrends';
import CandidateFinancials from './components/CandidateFinancials';

import './App.css';
import githubIcon from './img/github.png';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

class App extends Component {
  state = {
    averagePollingData: {},
    weightedDelegateTotals: {},
    palette: {},
    mostRecentStatePollData: [],
    mostRecentNationalPollData: [],
    nationalPollingTrendData: [],
    financialData: {},
    mounted: false,
    lastModifiedState: undefined,
    lastModifiedNational: undefined,
    renderId: 0
  };

  async componentDidMount() {
    this.loadAveragePollingData();
    this.loadMostRecentStatePollData();
    this.loadMostRecentNationalPollData();
    this.loadLastModifiedDate();
    this.loadFinancialData();

    setInterval(() => {
      this.setState(prevState => ({ renderId: prevState.renderId }));
      ReactTooltip.rebuild();
    }, 15000);

    this.setState({ mounted: true });
  }

  componentDidUpdate() {
    setTimeout(() => {
      ReactTooltip.rebuild();
    }, 1000);
  }

  loadAveragePollingData = async () => {
    const statePollingDataResponse = await axios.get('/data/state-polling-data');
    const { averagePollingData, weightedDelegateTotals } = statePollingDataResponse.data;

    const paletteResponse = await axios.get('/color/palette');
    const { palette } = paletteResponse.data;

    this.setState({ averagePollingData, weightedDelegateTotals, palette });
  };

  loadMostRecentStatePollData = async () => {
    const mostRecentStatePollDataResponse = await axios.get('/data/recent-polls/state?count=5');
    const mostRecentStatePollData = mostRecentStatePollDataResponse.data.mostRecentPollData;

    this.setState({ mostRecentStatePollData });
  };

  loadMostRecentNationalPollData = async () => {
    const mostRecentNationalPollDataResponse = await axios.get('/data/recent-polls/national?count=5');
    const mostRecentNationalPollData = mostRecentNationalPollDataResponse.data.mostRecentPollData;

    const nationalPollingTrendDataResponse = await axios.get('/data/national-trends');
    const { nationalPollingTrendData } = nationalPollingTrendDataResponse.data;

    this.setState({ mostRecentNationalPollData, nationalPollingTrendData });
  };

  loadLastModifiedDate = async () => {
    setTimeout(async () => {
      const lastModifiedDateStateResponse = await axios.get('/data/last-modified/state');
      const lastModifiedState = lastModifiedDateStateResponse.data.lastModified;

      this.setState({ lastModifiedState });
    }, 1000);
  };

  loadFinancialData = async () => {
    const financialDataResponse = await axios.get('/data/financials');
    const { financialData } = financialDataResponse.data;

    this.setState({ financialData });
  };

  getTooltipForState = stateName => {
    const { averagePollingData } = this.state;
    const stateData = averagePollingData[stateName];

    if (isEmpty(averagePollingData) || isEmpty(stateData)) {
      return null;
    }

    return (
      <div className="state-tooltip-container">
        <div className="state-tooltip-title">{stateName}</div>
        {Object.keys(stateData)
          .sort((a, b) => stateData[b] - stateData[a])
          .map((candidate, index) => (
            <div key={index} className="state-tooltip-candidates">
              {this.getCandidateColorForLegend(index, candidate)}
              <div className="state-tooltip-candidate-item">{formatPercentage(stateData[candidate] || 0)}</div>
            </div>
          ))}
      </div>
    );
  };

  getCandidateColorForLegend = (index, candidate) => {
    const { palette } = this.state;
    const color = getColorForCandidate(candidate, palette);

    return (
      <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ backgroundColor: color, border: '1px solid black', height: 16, width: 16, margin: 8 }} />
        <div>{fixMessedUpName(candidate)}</div>
      </div>
    );
  };

  getGridLayouts = () => {
    return gridLayout;
  };

  getGridCols = () => {
    return { lg: 12, md: 6 };
  };

  getGridBreakpoints = () => {
    return {
      lg: 1760,
      md: 0
    };
  };

  render() {
    return (
      <div>
        <div id="header">
          <div>2020 Democratic Primary Overview</div>
          <div className="header-right">
            {this.state.lastModifiedState && (
              <div className="last-modified">{`Data last updated: ${moment(
                this.state.lastModifiedState
              ).fromNow()}`}</div>
            )}
            <a href="http://github.com/jacobnisnevich/primary-map" target="_blank" rel="noopener noreferrer">
              <img src={githubIcon} alt="Github" />
            </a>
          </div>
        </div>

        <ResponsiveReactGridLayout
          className="layout"
          cols={this.getGridCols()}
          layouts={this.getGridLayouts()}
          breakpoints={this.getGridBreakpoints()}
          rowHeight={50}
          compactType="vertical"
        >
          <PrimaryMap
            key="primary-map"
            averagePollingData={this.state.averagePollingData}
            palette={this.state.palette}
          />
          <Legend
            key="legend"
            palette={this.state.palette}
            getCandidateColorForLegend={this.getCandidateColorForLegend}
          />
          <PollTable
            key="recent-state-polls"
            polls={this.state.mostRecentStatePollData}
            title="Most Recent State Primary Polls"
          />
          <PollTable
            national
            key="recent-national-polls"
            polls={this.state.mostRecentNationalPollData}
            title="Most Recent National Primary Polls"
          />
          <PledgedDelegateScoreboard
            key="pledged-delegate-scoreboard"
            weightedDelegateTotals={this.state.weightedDelegateTotals}
            palette={this.state.palette}
          />
          <NationalPollingTrends
            key="national-polling-trends"
            nationalPollingTrendData={this.state.nationalPollingTrendData}
            palette={this.state.palette}
          />
          <CandidateFinancials key="candidate-financials" financialData={this.state.financialData} />
        </ResponsiveReactGridLayout>

        <ReactTooltip id="state-tooltip" getContent={stateName => this.getTooltipForState(stateName)} />
      </div>
    );
  }
}

export default App;
