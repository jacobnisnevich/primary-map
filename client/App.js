import React, { Component } from 'react';
import axios from 'axios';
import { isEmpty } from 'lodash';
import ReactTooltip from 'react-tooltip';
import { Responsive, WidthProvider } from 'react-grid-layout';

import { formatPercentage, getColorForCandidate, fixMessedUpName } from './utils/common';

import PrimaryMap from './components/PrimaryMap';
import Legend from './components/Legend';
import PollTable from './components/PollTable';

import './App.css';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

class App extends Component {
  state = {
    averagePollingData: {},
    palette: {},
    mostRecentStatePollData: [],
    mostRecentNationalPollData: [],
    mounted: false
  };

  async componentDidMount() {
    this.loadAveragePollingData();
    this.loadMostRecentStatePollData();
    this.loadMostRecentNationalPollData();

    setTimeout(() => {
      ReactTooltip.rebuild();
    }, 100);

    this.setState({ mounted: true });
  }

  loadAveragePollingData = async () => {
    const statePollingDataResponse = await axios.get('/data/state-polling-data');
    const { averagePollingData } = statePollingDataResponse.data;

    const paletteResponse = await axios.get('/color/palette');
    const { palette } = paletteResponse.data;

    this.setState({ averagePollingData, palette });
  };

  loadMostRecentStatePollData = async () => {
    const mostRecentStatePollDataResponse = await axios.get('/data/recent-polls/state?count=5');
    const mostRecentStatePollData = mostRecentStatePollDataResponse.data.mostRecentPollData;
    this.setState({ mostRecentStatePollData });
  };

  loadMostRecentNationalPollData = async () => {
    const mostRecentNationalPollDataResponse = await axios.get('/data/recent-polls/national?count=5');
    const mostRecentNationalPollData = mostRecentNationalPollDataResponse.data.mostRecentPollData;
    this.setState({ mostRecentNationalPollData });
  };

  loadPalette = async () => {};

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
    return {
      lg: [
        {
          x: 0,
          y: 0,
          w: 5,
          h: 9,
          i: 'primary-map'
        },
        {
          x: 0,
          y: 9,
          w: 5,
          h: 3,
          i: 'legend'
        },
        {
          x: 5,
          y: 0,
          w: 7,
          h: 5,
          i: 'recent-state-polls'
        },
        {
          x: 5,
          y: 5,
          w: 7,
          h: 5,
          i: 'recent-national-polls'
        }
      ],
      md: [
        {
          x: 0,
          y: 0,
          w: 6,
          h: 9,
          i: 'primary-map'
        },
        {
          x: 0,
          y: 9,
          w: 6,
          h: 3,
          i: 'legend'
        },
        {
          x: 0,
          y: 12,
          w: 6,
          h: 5,
          i: 'recent-state-polls'
        },
        {
          x: 0,
          y: 17,
          w: 6,
          h: 5,
          i: 'recent-national-polls'
        }
      ]
    };
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
        <div id="header">2020 Democratic Primary Overview</div>

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
        </ResponsiveReactGridLayout>

        <ReactTooltip id="state-tooltip" getContent={stateName => this.getTooltipForState(stateName)} />
      </div>
    );
  }
}

export default App;
