import React from 'react';

class NoResult extends React.Component{
    render(){
        return (
          <div className={this.props.result?"singleBoxShadowBox":"singleBoxShadowBox noResultPageBgByTop"}>
            <p className="noResultPageBgByTopTip noResultPageTip">{this.props.tip}</p>
          </div>
        )
    }
}

export default NoResult;
