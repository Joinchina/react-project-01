/* eslint-disable no-underscore-dangle */
/* eslint-disable global-require */
/* eslint-disable no-undef */
import {
    createStore, applyMiddleware, combineReducers,
} from 'redux';
import thunk from 'redux-thunk';
import { createMountReducer } from '@wanhu/react-redux-mount';
import insuranceState from './state/insuranceState';

let middleware = [thunk];
let enhancers = applyMiddleware(...middleware);

const rootReducer = combineReducers({
    insuranceState,
    ...createMountReducer(),
});

const store = createStore(
    rootReducer,
    window.INITIAL_STATE || {},
    enhancers,
);

export default store;
