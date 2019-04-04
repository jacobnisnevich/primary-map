import React, { Component } from 'react';
import axios from 'axios';
import { isEmpty } from 'lodash';
import ReactTooltip from 'react-tooltip';

import './App.css';

import { formatPercentage, getColorForCandidate, fixMessedUpName } from './utils/common';

import PrimaryMap from './components/PrimaryMap';
import PollTable from './components/PollTable';

class App extends Component {
  state = {
    averagePollingData: {},
    palette: {},
    mostRecentPollData: []
  };

  async componentDidMount() {
    const statePollingDataResponse = await axios.get('/data/state-polling-data');
    const { averagePollingData } = statePollingDataResponse.data;

    const mostRecentPollDataResponse = await axios.get('/data/recent-polls?count=5');
    const { mostRecentPollData } = mostRecentPollDataResponse.data;

    const paletteResponse = await axios.get('/color/palette');
    const { palette } = paletteResponse.data;

    setTimeout(() => {
      ReactTooltip.rebuild();
    }, 100);

    this.setState({ averagePollingData, palette, mostRecentPollData });
  }

  getTooltipForState = stateName => {
    const { averagePollingData } = this.state;
    const stateData = averagePollingData[stateName];

    if (isEmpty(averagePollingData) || isEmpty(stateData)) {
      return null;
    }

    return (
      <div style={{ border: '2px solid #CCCCCC' }}>
        <div style={{ fontWeight: 'bold', textAlign: 'center', margin: 5 }}>{stateName}</div>
        {Object.keys(stateData)
          .sort((a, b) => stateData[b] - stateData[a])
          .map((candidate, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {this.getCandidateColorForLegend(index, candidate)}
              <div style={{ marginRight: 8 }}>{formatPercentage(stateData[candidate] || 0)}</div>
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

  getLegend = () => {
    const { palette } = this.state;

    return (
      <div
        style={{
          border: '2px solid #CCCCCC',
          display: 'flex',
          width: 800,
          margin: '0 auto',
          flexWrap: 'wrap',
          justifyContent: 'center',
          paddingRight: 8
        }}
      >
        {Object.keys(palette).map((candidate, index) => this.getCandidateColorForLegend(index, candidate))}
      </div>
    );
  };

  render() {
    return (
      <div>
        <div id="header">2020 Democratic State Primary Polling</div>
        <div className="subtitle">
          All polling numbers gathered on page-load from Wikipedia's state-wide{' '}
          <a href="https://en.wikipedia.org/wiki/Statewide_opinion_polling_for_the_2020_Democratic_Party_presidential_primaries">
            polling data
          </a>
          .
        </div>
        <div id="primary-map">Primary Map</div>
        <div className="subtitle">Polling average is based on most recent 5 polls in each state.</div>
        <PrimaryMap averagePollingData={this.state.averagePollingData} palette={this.state.palette} />
        <ReactTooltip id="state-tooltip" getContent={stateName => this.getTooltipForState(stateName)} />
        {this.getLegend()}
        <div id="recent-polls">Recent Polls</div>
        <PollTable mostRecentPollData={this.state.mostRecentPollData} />
      </div>
    );
  }
}

export default App;
