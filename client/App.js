import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';
import { Switch, Route, Link, withRouter } from 'react-router-dom';

import Dashboard from './components/Dashboard';
import Polls from './components/Polls';

import {
  getStatePollingData,
  getPalette,
  getRecentStatePolls,
  getRecentNationalPolls,
  getNationalTrends,
  getFinancialData
} from './utils/api-helpers';

import './App.css';
import githubIcon from './img/github.png';

class App extends Component {
  state = {
    averagePollingData: {},
    weightedDelegateTotals: {},
    palette: {},
    mostRecentStatePollData: [],
    mostRecentNationalPollData: [],
    nationalPollingTrendData: [],
    financialData: {},
    mounted: false,
    renderId: 0,
    breakpoint: undefined
  };

  async componentDidMount() {
    this.loadAveragePollingData();
    this.loadMostRecentStatePollData();
    this.loadMostRecentNationalPollData();
    this.loadFinancialData();

    setInterval(() => {
      this.setState(prevState => ({ renderId: prevState.renderId }));
      ReactTooltip.rebuild();
    }, 15000);

    this.setState({ mounted: true });
  }

  componentDidUpdate() {
    setTimeout(() => {
      ReactTooltip.rebuild();
    }, 1000);
  }

  loadAveragePollingData = async () => {
    const { averagePollingData, weightedDelegateTotals } = await getStatePollingData();
    const { palette } = await getPalette();
    this.setState({ averagePollingData, weightedDelegateTotals, palette });
  };

  loadMostRecentStatePollData = async () => {
    const mostRecentStatePollData = await getRecentStatePolls(5);
    this.setState({ mostRecentStatePollData });
  };

  loadMostRecentNationalPollData = async () => {
    const mostRecentNationalPollData = await getRecentNationalPolls(5);
    const { nationalPollingTrendData } = await getNationalTrends();
    this.setState({ mostRecentNationalPollData, nationalPollingTrendData });
  };

  loadFinancialData = async () => {
    const { financialData } = await getFinancialData();
    this.setState({ financialData });
  };

  render() {
    const {
      averagePollingData,
      palette,
      mostRecentStatePollData,
      mostRecentNationalPollData,
      weightedDelegateTotals,
      nationalPollingTrendData,
      financialData
    } = this.state;

    return (
      <div>
        <div id="header">
          <div>2020 Democratic Primary Overview</div>
          <div className="header-right">
            <a href="http://github.com/jacobnisnevich/primary-map" target="_blank" rel="noopener noreferrer">
              <img src={githubIcon} alt="Github" />
            </a>
          </div>
        </div>

        <div id="tabs">
          <Link to="/" className={this.props.location.pathname === '/' ? 'selected' : ''}>
            Dashboard
          </Link>
          <Link to="/polls" className={this.props.location.pathname === '/polls' ? 'selected' : ''}>
            Polls
          </Link>
        </div>

        <Switch>
          <Route
            exact
            path="/"
            render={() => (
              <Dashboard
                averagePollingData={averagePollingData}
                palette={palette}
                mostRecentStatePollData={mostRecentStatePollData}
                mostRecentNationalPollData={mostRecentNationalPollData}
                weightedDelegateTotals={weightedDelegateTotals}
                nationalPollingTrendData={nationalPollingTrendData}
                financialData={financialData}
              />
            )}
          />
          <Route path="/polls" render={() => <Polls />} />
        </Switch>
      </div>
    );
  }
}

export default withRouter(App);
