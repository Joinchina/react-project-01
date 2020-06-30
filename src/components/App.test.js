import React from 'react';
import App from './App';
import { mount } from 'enzyme';
import createHistory from 'history/createMemoryHistory';

describe('<App>', () => {
    it('能够渲染路径/bind', () => {
        const history = createHistory({
            initialEntries: ['/bind'],
            initialIndex: 0,
        });
        const m = mount(<App history={history}/>);
        expect(m.text()).toEqual(expect.stringContaining('Bind'));
    });
});



