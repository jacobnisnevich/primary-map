import React, { Component } from 'react';

import PollTable from './PollTable';

import { getPolls } from '../utils/api-helpers';

import './Polls.css';

export default class Polls extends Component {
  state = {
    polls: undefined,
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
    await this.reloadPolls();
  }

  reloadPolls = async () => {
    this.setState({ polls: undefined });
    const polls = await getPolls(this.state.pollFilter);
    this.setState({ polls });
  };

  render() {
    return (
      <div className="polls-page">
        <PollTable polls={this.state.polls} sortable pollFilter={this.state.pollFilter} />
      </div>
    );
  }
}
