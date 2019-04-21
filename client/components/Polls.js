import React, { Component } from 'react';
import { uniq, isEmpty, isArray } from 'lodash';

import PollFilterEditor from './PollFilterEditor';
import PollTable from './PollTable';

import { getPolls, getPollCount, getDistinctColumns } from '../utils/api-helpers';

import './Polls.css';

export default class Polls extends Component {
  state = {
    columnOptions: {},
    polls: undefined,
    pollCount: 0,
    pollFilter: {
      limit: null,
      sortCriteria: {
        field: 'date',
        direction: 'Desc'
      },
      columnFilters: []
    }
  };

  async componentDidMount() {
    await this.loadColumnOptions();
    await this.reloadPolls();
  }

  loadColumnOptions = async () => {
    const columnOptions = await getDistinctColumns();
    this.setState({ columnOptions }, () => {
      this.populateColumnFilters();
    });
  };

  reloadPolls = async () => {
    this.setState({ polls: undefined });
    const polls = await getPolls(this.state.pollFilter);
    const pollCount = await getPollCount(this.state.pollFilter);
    this.setState({ polls, pollCount });
  };

  populateColumnFilters = () => {
    this.setState(prevState => {
      const newColumnFilters = [
        {
          field: 'polling_source',
          operator: 'In',
          operand: prevState.columnOptions['polling_source']
        },
        {
          field: 'state',
          operator: 'In',
          operand: prevState.columnOptions['state']
        }
      ];

      return {
        ...prevState,
        pollFilter: {
          ...prevState.pollFilter,
          columnFilters: newColumnFilters
        }
      };
    });
  };

  convertArrayToSelectOptions = arrayElement => ({
    value: arrayElement,
    label: arrayElement || '[National]'
  });

  convertSelectOptionsToArray = selectElement => selectElement.value;

  getFilterForColumn = column => {
    return this.state.pollFilter.columnFilters.find(columnFilter => columnFilter.field === column);
  };

  getPollsters = () => {
    const { polls } = this.state;
    return uniq(polls.map(poll => poll.polling_source));
  };

  getSelectOptions = option => {
    const { columnOptions } = this.state;

    if (!isEmpty(columnOptions)) {
      return columnOptions[option].map(this.convertArrayToSelectOptions);
    } else {
      return [];
    }
  };

  getSelectValue = option => {
    const columnFilter = this.getFilterForColumn(option);

    if (columnFilter) {
      return columnFilter.operand;
    } else {
      return [];
    }
  };

  onSelectOptionChange = option => newValue => {
    this.setState(
      prevState => {
        const oldColumnFilters = prevState.pollFilter.columnFilters;
        const oldColumnFilterIndex = oldColumnFilters.findIndex(columnFilter => columnFilter.field === option);

        const newColumnFilter = {
          field: option,
          operator: 'In',
          operand: newValue
        };
        const newColumnFilters = [...oldColumnFilters];

        if (oldColumnFilterIndex !== undefined) {
          newColumnFilters[oldColumnFilterIndex] = newColumnFilter;
        } else {
          newColumnFilters.push(newColumnFilter);
        }

        return {
          ...prevState,
          pollFilter: {
            ...prevState.pollFilter,
            columnFilters: newColumnFilters
          }
        };
      },
      () => this.reloadPolls()
    );
  };

  render() {
    const { polls, pollFilter } = this.state;

    return (
      <div className="polls-page">
        <PollFilterEditor
          pollFilter={pollFilter}
          onPollsterOptionChange={this.onSelectOptionChange('polling_source')}
          pollsterOptions={this.getSelectOptions('polling_source')}
          pollsterValue={this.getSelectValue('polling_source')}
          onStateOptionChange={this.onSelectOptionChange('state')}
          stateOptions={this.getSelectOptions('state')}
          stateValue={this.getSelectValue('state')}
        />
        {isArray(polls) && isEmpty(polls) ? (
          <div className="no-polls-matching">No polls match your criteria</div>
        ) : (
          <PollTable polls={polls} sortable pollFilter={pollFilter} />
        )}
      </div>
    );
  }
}
