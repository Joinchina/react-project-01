import React, { Component } from 'react';
import mount, { prop, action } from '@wanhu/react-redux-mount';

import api from '../../api';

@mount('Bind')
class Bind extends Component {

    @mount.prop()
    data = 1;

    @mount.action()
    increase() {
        this.data ++;
    }

    @mount.action()
    async getData() {
        this.data = await api.get('/bind');
    }
    
    render(){
        return <div>Bind {this.data}
            <button onClick={()=>this.increase()}>increase asd</button>
            <button onClick={()=>this.getData()}>get data</button>
        </div>;
    }
}

export default Bind;