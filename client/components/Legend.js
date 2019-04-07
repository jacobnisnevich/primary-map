import React, { Component, Fragment } from 'react';
import { isEmpty } from 'lodash';
import { ScaleLoader } from 'react-spinners';

import './Legend.css';

export default class Legend extends Component {
  render() {
    const { palette, getCandidateColorForLegend } = this.props;

    return (
      <div className="legend-container" key={this.props.key} style={this.props.style}>
        {!isEmpty(palette) ? (
          <Fragment>
            <div className="grid-title">Map Legend</div>
            <div className="legend">
              {Object.keys(palette).map((candidate, index) => getCandidateColorForLegend(index, candidate))}
            </div>
          </Fragment>
        ) : (
          <div className="legend-loading-container">
            <ScaleLoader sizeUnit="px" size={150} color="#444444" loading={isEmpty(palette)} />
          </div>
        )}
      </div>
    );
  }
}
