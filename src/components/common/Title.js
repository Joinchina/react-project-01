import React from 'react';

export default function(props) {
    const title = React.Children
        .map(props.children, node => typeof node === 'string' ? node : '')
        .join('');
    document.title = title;
    return null;
}