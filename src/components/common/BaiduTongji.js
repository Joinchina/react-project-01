import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

@withRouter
export default class BaiduTongji extends Component {

    constructor(props){
        super(props);
        if (window._hmt) {
            this.hmt = window._hmt;
        }
    }

    getHref(props) {
        if (!props || !props.location) {
            return "";
        }
        return `${props.location.pathname || ''}${props.location.search || ''}${props.location.hash || ''}`;
    }

    componentDidMount() {
        this.trackPageView(this.getHref(this.props));
    }

    componentWillReceiveProps(nextProps) {
        const oldHref = this.getHref(this.props);
        const newHref = this.getHref(nextProps);
        if (oldHref !== newHref) {
            this.trackPageView(newHref, oldHref);
        }
    }

    trackPageView(location, prevLocation) {      
        if (this.hmt) {
            this.hmt.push(['_trackPageview', location]);
        }
    }

    shouldComponentUpdate(){
        return false;
    }

    render(){
        return null;
    }
}