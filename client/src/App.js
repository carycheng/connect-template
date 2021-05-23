import React from "react";
import {BrowserRouter as Router, Route, Switch, Link, Redirect} from 'react-router-dom';

import Landing from './pages/Landing';
import SelectPlan from './pages/SelectPlan';
import Dashboard from './pages/Dashboard';
import NotFoundPage from "./pages/404";

const keys = require('./config/keys');

class App extends React.Component {

  render() {
    return (
      <React.Fragment>
        <Router>
          <Switch>
            <Route exact path="/" component={Landing} />
            <Route exact path="/select-plan" component={SelectPlan} />
            <Route exact path="/dashboard" component={Dashboard} />
            <Route component={NotFoundPage} />
            <Redirect to="/404" />
          </Switch>
        </Router>
      </React.Fragment>
    );
  }
};

export default App;