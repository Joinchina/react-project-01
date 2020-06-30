import React from 'react';
import Bind from '.';
import test from '@wanhu/react-redux-mount/test';

describe('<Bind>', () => {
    it('能够正常渲染', async () => {
        const m = await test(<Bind/>);
        expect(m.root.text()).toEqual(expect.stringContaining('Bind 1'));
    });

    it('点击按钮时会发送Action', async () => {
        const m = await test(<Bind/>);
        const act = await m.waitAction(() => {
            m.root.find('button').simulate('click');
        });
        expect(act.type).toBe('increase@Bind');
        expect(act.payload.data).toBe(2);
        expect(m.root.text()).toEqual(expect.stringContaining('Bind 2'));
    });
});
