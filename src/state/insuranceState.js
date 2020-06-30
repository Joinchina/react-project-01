/* eslint-disable no-param-reassign */
import { combineReducers, bindActionCreators } from 'redux';
import { connect as reduxConnect } from 'react-redux';

const SET_INSURANCE = 'insuranceState.SET_INSURANCE';
const RESET = 'insuranceState.RESET';

function createReducer(actionName) {
    return function reduce(state = {}, action) {
        if (action.type === SET_INSURANCE) {
            state = {
                ...state,
                payload: {...state.payload, ...action.payload},
            };
        }
        if (action.type === RESET) {
            state = {
                ...state,
                payload: {},
            };
        }
        return state;
    }
}

export default combineReducers({
    insurance: createReducer(SET_INSURANCE),
});

export const setInsurance = val => ({
    type: SET_INSURANCE,
    payload: val,
});

export const resetInsurance = () => ({
    type: RESET,
    payload: {},
});

export const connect = reduxConnect(
    state => ({
        insurance: state.insuranceState.insurance,
    }),
    dispatch => bindActionCreators({
        setInsurance,
        resetInsurance,
    }, dispatch),
);
