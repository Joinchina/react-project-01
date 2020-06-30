import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { createMountReducer } from '@wanhu/react-redux-mount';


export default combineReducers({
    routing: routerReducer,
    ...createMountReducer(),
});
