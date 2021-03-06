import React from "react";
import {BrowserRouter as Router, Route, Switch, Link, Redirect} from 'react-router-dom';
import { ElementsConsumer } from "@stripe/react-stripe-js";

import Landing from './pages/Landing';
import SelectPlan from './pages/SelectPlan';
import Dashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import Product from './pages/Product';
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
            <Route exact path="/checkout" component={InjectedCheckoutForm} />
            <Route exact path="/product" component={Product} />
            <Route component={NotFoundPage} />
            <Redirect to="/404" />
          </Switch>
        </Router>
      </React.Fragment>
    );
  }
};

const InjectedCheckoutForm = () => (
  <ElementsConsumer>
    {({stripe, elements}) => (
      <Checkout stripe={stripe} elements={elements} />
    )}
  </ElementsConsumer>
);

export default App;