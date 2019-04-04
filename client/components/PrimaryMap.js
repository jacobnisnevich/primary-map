import React, { Component } from 'react';
import { ComposableMap, ZoomableGroup, Geographies, Geography } from 'react-simple-maps';
import { isEmpty } from 'lodash';

import { getColorForCandidate } from '../utils/common';

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

  render() {
    return (
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
    );
  }
}
