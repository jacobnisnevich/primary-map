import React, { Component } from 'react';
import MultiSelect from '@khanacademy/react-multi-select';

import './PollFilterEditor.css';

export default class PollFilterEditor extends Component {
  render() {
    const {
      onPollsterOptionChange,
      pollsterOptions,
      pollsterValue,
      onStateOptionChange,
      stateOptions,
      stateValue
    } = this.props;

    return (
      <div className="poll-filter-editor widget">
        <div className="multi-select-label">Pollsters:</div>
        <MultiSelect
          selected={pollsterValue}
          onSelectedChanged={onPollsterOptionChange}
          options={pollsterOptions}
          hasSelectAll
        />

        <div className="multi-select-label">States:</div>
        <MultiSelect
          selected={stateValue}
          onSelectedChanged={onStateOptionChange}
          options={stateOptions}
          hasSelectAll
        />
      </div>
    );
  }
}
