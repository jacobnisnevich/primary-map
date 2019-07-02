import React, { Component, Fragment } from 'react';
import { isEmpty, zip } from 'lodash';
import { ScaleLoader } from 'react-spinners';
import Chart from 'react-apexcharts';

import './PollingTrendChart.css';
import { getColorForCandidate } from '../utils/common';

export default class PollingTrendChart extends Component {
  render() {
    const { palette, pollingTrendData } = this.props;

    const chartOptions = {
      xaxis: {
        type: 'datetime'
      },
      yaxis: {
        labels: {
          formatter: value => {
            return value + '%';
          }
        }
      },
      chart: {
        toolbar: {
          autoSelected: 'pan'
        },
        animations: {
          enabled: false
        }
      }
    };
    let trendData = {};

    if (!isEmpty(palette) && !isEmpty(pollingTrendData)) {
      const candidates = Object.keys(pollingTrendData.candidateResults[0]);

      trendData = candidates.map(candidate => {
        const candidateData = zip(
          pollingTrendData.days.map(dateString => new Date(dateString).getTime()),
          pollingTrendData.candidateResults.map(result => Math.round((10 * result[candidate]) / 10))
        );

        return {
          name: candidate,
          data: candidateData
        };
      });

      chartOptions.colors = candidates.map(candidate => getColorForCandidate(candidate, palette));
    }

    return (
      <div className="polling-trend-chart-container widget" key={this.props.key} style={this.props.style}>
        {!isEmpty(palette) && !isEmpty(pollingTrendData) ? (
          <Fragment>
            <div className="grid-title">National Polling Trends over Time</div>
            <div className="polling-trend-chart">
              <Chart
                series={trendData}
                options={chartOptions}
                width={parseInt(this.props.style.width, 10) - 36}
                height={parseInt(this.props.style.height, 10) - 56}
              />
            </div>
          </Fragment>
        ) : (
          <div className="polling-trend-chart-loading-container">
            <ScaleLoader sizeUnit="px" size={150} color="#444444" loading={isEmpty(palette)} />
          </div>
        )}
      </div>
    );
  }
}
