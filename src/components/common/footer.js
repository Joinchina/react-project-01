import React from 'react';
import footerImg from '../../assets/images/slogan.png';

class Footer extends React.Component{
    render(){
        return (
            <footer className="footer">
                <img src={footerImg} />
            </footer>
        )
    }
}

export default Footer;
