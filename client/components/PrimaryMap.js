import React, { Component, Fragment } from 'react';
import { ComposableMap, ZoomableGroup, Geographies, Geography } from 'react-simple-maps';
import { isEmpty } from 'lodash';
import { ScaleLoader } from 'react-spinners';
import ReactTooltip from 'react-tooltip';

import { formatPercentage, getColorForCandidate } from '../utils/common';

import './PrimaryMap.css';

export default class PrimaryMap extends Component {
  getColorForState = stateName => {
    const EMPTY_COLOR = '#EEEEEE';
    const { averagePollingData, palette } = this.props;

    if (isEmpty(averagePollingData)) {
      return EMPTY_COLOR;
    }

    const stateData = averagePollingData[stateName];

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

    return getColorForCandidate(leadingCandidate, palette);
  };

  getTooltipForState = stateName => {
    const { averagePollingData } = this.props;
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
              {this.props.getCandidateColorForLegend(index, candidate)}
              <div className="state-tooltip-candidate-item">{formatPercentage(stateData[candidate] || 0)}</div>
            </div>
          ))}
      </div>
    );
  };

  render() {
    const { averagePollingData } = this.props;

    return (
      <div className="primary-map-container widget" key={this.props.key} style={this.props.style}>
        {!isEmpty(averagePollingData) ? (
          <Fragment>
            <div className="grid-title">Primary Polling Average Map</div>
            <div className="primary-map">
              <ComposableMap
                projection="albersUsa"
                projectionConfig={{
                  scale: parseInt(this.props.style.width, 10) * 1.1
                }}
                width={parseInt(this.props.style.width, 10)}
                height={parseInt(this.props.style.height, 10) - 36 - 8}
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
          </Fragment>
        ) : (
          <div className="primary-map-loading-container">
            <ScaleLoader sizeUnit="px" size={150} color="#444444" loading={isEmpty(averagePollingData)} />
          </div>
        )}
        <ReactTooltip id="state-tooltip" getContent={stateName => this.getTooltipForState(stateName)} />
      </div>
    );
  }
}
