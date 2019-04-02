import React, { Component } from 'react';
import axios from 'axios';
import { isEmpty } from 'lodash';
import { ComposableMap, ZoomableGroup, Geographies, Geography } from 'react-simple-maps';
import ReactTooltip from 'react-tooltip';

import './App.css';

class App extends Component {
  state = {
    averagedPollingData: {},
    palette: {}
  };

  async componentDidMount() {
    const response = await axios.get('/map-data');
    const { averagedPollingData, palette } = response.data;

    setTimeout(() => {
      ReactTooltip.rebuild();
    }, 100);

    this.setState({ averagedPollingData, palette });
  }

  getColorForCandidate = candidateName => {
    const { palette } = this.state;
    return `rgba(${palette[candidateName]._rgb.join(', ')})`;
  };

  getColorForState = stateName => {
    const EMPTY_COLOR = '#EEEEEE';
    const { averagedPollingData } = this.state;

    if (isEmpty(averagedPollingData)) {
      return EMPTY_COLOR;
    }

    const stateData = averagedPollingData[stateName];

    if (isEmpty(stateData)) {
      return EMPTY_COLOR;
    }

    const leadingCandidate = Object.keys(stateData).reduce((previousValue, currentValue) => {
      if (previousValue) {
        return stateData[currentValue] > stateData[previousValue] ? currentValue : previousValue;
      }

      return currentValue;
    }, undefined);

    if (!leadingCandidate) {
      return EMPTY_COLOR;
    }

    return this.getColorForCandidate(leadingCandidate);
  };

  getTooltipForState = stateName => {
    const { averagedPollingData } = this.state;
    const stateData = averagedPollingData[stateName];

    if (isEmpty(averagedPollingData) || isEmpty(stateData)) {
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
              <div style={{ marginRight: 8 }}>{this.formatPercentage(stateData[candidate] || 0)}</div>
            </div>
          ))}
      </div>
    );
  };

  formatPercentage = percentage => `${percentage.toFixed(1)}%`;

  getCandidateColorForLegend = (index, candidate) => {
    const color = this.getColorForCandidate(candidate);

    return (
      <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ backgroundColor: color, border: '1px solid black', height: 16, width: 16, margin: 8 }} />
        <div>{candidate}</div>
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
        <div id="subtitle">
          All polling numbers gathered on page-load from Wikipedia's state-wide{' '}
          <a href="https://en.wikipedia.org/wiki/Statewide_opinion_polling_for_the_2020_Democratic_Party_presidential_primaries">
            polling data
          </a>
          . Polling average is based on most recent 5 polls in each state.
        </div>
        <div
          style={{
            width: '100%',
            maxWidth: 980,
            margin: '0 auto'
          }}
        >
          <ComposableMap
            projection="albersUsa"
            projectionConfig={{
              scale: 1000
            }}
            width={980}
            height={551}
            style={{
              width: '100%',
              height: 'auto'
            }}
          >
            <ZoomableGroup disablePanning>
              <Geographies geography="/static/states.json" disableOptimization>
                {(geographies, projection) =>
                  geographies.map((geography, i) => {
                    const colorData = {
                      fill: this.getColorForState(geography.properties.NAME_1),
                      stroke: '#607D8B',
                      strokeWidth: 0.75,
                      outline: 'none'
                    };

                    return (
                      <Geography
                        data-for="state-tooltip"
                        data-tip={geography.properties.NAME_1}
                        key={`state-${geography.properties.ID_1}`}
                        cacheId={`state-${geography.properties.ID_1}`}
                        round
                        geography={geography}
                        projection={projection}
                        style={{
                          default: colorData,
                          hover: { ...colorData, cursor: 'pointer' },
                          pressed: colorData
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>
        {this.getLegend()}
        <ReactTooltip id="state-tooltip" getContent={stateName => this.getTooltipForState(stateName)} />
      </div>
    );
  }
}

export default App;
