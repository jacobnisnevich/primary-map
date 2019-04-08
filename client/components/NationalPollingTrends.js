import React, { Component, Fragment } from 'react';
import { isEmpty, zipObject } from 'lodash';
import { ScaleLoader } from 'react-spinners';
import ReactChartkick, { LineChart } from 'react-chartkick';
import Chart from 'chart.js';

import './NationalPollingTrends.css';
import { getColorForCandidate } from '../utils/common';

ReactChartkick.addAdapter(Chart);

export default class NationalPollingTrends extends Component {
  render() {
    const { palette, nationalPollingTrendData } = this.props;
    let trendData = {};
    let colors = [];

    if (!isEmpty(palette) && !isEmpty(nationalPollingTrendData)) {
      const candidates = Object.keys(nationalPollingTrendData.candidateResults[0]);

      trendData = candidates.map(candidate => {
        const candidateData = zipObject(
          nationalPollingTrendData.days,
          nationalPollingTrendData.candidateResults.map(result => result[candidate])
        );

        return {
          name: candidate,
          data: candidateData
        };
      });

      colors = candidates.map(candidate => getColorForCandidate(candidate, palette));
    }

    return (
      <div className="national-polling-trends-container" key={this.props.key} style={this.props.style}>
        {!isEmpty(palette) && !isEmpty(nationalPollingTrendData) ? (
          <Fragment>
            <div className="grid-title">National Polling over Time</div>
            <div className="national-polling-trends">
              <LineChart
                data={trendData}
                colors={colors}
                suffix="%"
                legend={false}
                width={parseInt(this.props.style.width, 10) - 36}
                height={parseInt(this.props.style.height, 10) - 48}
              />
            </div>
          </Fragment>
        ) : (
          <div className="national-polling-trends-loading-container">
            <ScaleLoader sizeUnit="px" size={150} color="#444444" loading={isEmpty(palette)} />
          </div>
        )}
      </div>
    );
  }
}
