import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import App from './App';
import reducers from './reducers';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('');

const store = createStore(reducers);

ReactDOM.render(
  <Provider store={ store }>
    <React.StrictMode>
      <Elements stripe={stripePromise}>
          <App />
      </Elements>
    </React.StrictMode>      
  </Provider>,
  document.getElementById('root')
);