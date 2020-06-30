import React from 'react';

class ListItem extends React.Component{
    render(){
        const item = {
            display:'flex',
            justifyContent:'space-between',
            letterSpacing:2,
            alignItems:'center',
        }
        return (
            <div style={{...this.props.itemStyle,...item}}>
                <p style={{...this.props.itemNameStyle}}>{this.props.itemName}</p>
                <p style={{...this.props.itemContentStyle}}>{this.props.itemContent}</p>
            </div>
        )
    }
}

export default ListItem;
