import React, { Component } from 'react';
import axios from 'axios';
import { isEmpty } from 'lodash';
import {
  ComposableMap,
  ZoomableGroup,
  Geographies,
  Geography,
} from 'react-simple-maps';

import './App.css';

class App extends Component {
  state = {
    pollingData: {},
    palette: {}
  }

  async componentDidMount() {
    const response = await axios.get('/map-data');
    const { pollingData, palette } = response.data;
    this.setState({ pollingData, palette });
  }

  getColorForCandidate = candidateName => {
    const { palette } = this.state;
    return `rgba(${palette[candidateName]._rgb.join(', ')})`;
  }

  getColorForState = stateName => {
    const { pollingData } = this.state;

    if (isEmpty(pollingData)) {
      return '#EEEEEE';
    }

    const stateData = pollingData[stateName];

    if (isEmpty(stateData)) {
      return '#EEEEEE';
    }

    const leadingCandidate = Object.keys(stateData).reduce((previousValue, currentValue) => {
      if (previousValue) {
        return stateData[currentValue] > stateData[previousValue] ? currentValue : previousValue;
      }
      
      return currentValue;
    }, undefined);

    if (!leadingCandidate) {
      return '#EEEEEE';
    }

    return this.getColorForCandidate(leadingCandidate);
  }

  getCandidateColorForLegend = (index, color, candidate) => {
    return (
      <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ backgroundColor: color, border: '1px solid black', height: 16, width: 16, margin: 8 }}/>
        <div>{candidate}</div>
      </div>
    )
  }

  getLegend = () => {
    const { palette } = this.state;
    
    return (
      <div style={{ border: '1px solid black', display: 'flex', width: 800, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
        {Object.keys(palette).map((candidate, index) => (
          this.getCandidateColorForLegend(index, this.getColorForCandidate(candidate), candidate))
        )}
      </div>
    )
  }

  render() {
    return (
      <div>
        <div style={{
          width: '100%',
          maxWidth: 980,
          margin: '0 auto'
        }}>
          <ComposableMap
            projection="albersUsa"
            projectionConfig={{
              scale: 1000,
            }}
            width={980}
            height={551}
            style={{
              width: '100%',
              height: 'auto',
            }}
            >
            <ZoomableGroup disablePanning>
              <Geographies geography="/static/states.json" disableOptimization>
                {(geographies, projection) =>
                  geographies.map((geography, i) => {
                    return (
                      <Geography
                        key={`state-${geography.properties.ID_1}`}
                        cacheId={`state-${geography.properties.ID_1}`}
                        round
                        geography={geography}
                        projection={projection}
                        style={{
                          default: {
                            fill: this.getColorForState(geography.properties.NAME_1),
                            stroke: '#607D8B',
                            strokeWidth: 0.75,
                            outline: 'none',
                          }
                        }}
                      />
                    )
                  }
                )}
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>
        {this.getLegend()}
      </div>
    );
  }
}

export default App;
