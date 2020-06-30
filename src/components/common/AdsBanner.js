import React, { Component } from 'react';
import { Carousel } from 'antd';
import api from '../../api';


export default class AdsBanner extends Component {
    constructor(props) {
        super(props);
        this.state = {
            adsList: null,
        }
    }
    async componentDidMount() {
        try {
            const { positionName } = this.props;
            const adsList = await api.get('/wcm/adpositions/ads', positionName ? { positionName } : null);
            this.setState({ adsList });
        } catch (error) {

        }
    }

    toInsurance(url){
        window.location.href=url;
    }
    render() {
        const { adsList } = this.state;
        return <div>
            {adsList && adsList.length > 0 ? <div>
                <Carousel
                    autoplay
                    infinite
                    autoplayInterval="5000ms"
                    dotStyle={{ background: '#ffffff', opacity: '0.5' }}
                    dotActiveStyle={{ background: '#ffffff' }}
                >
                    {adsList.map(val => (
                        <a
                            key={val.id}
                            onClick={() => this.toInsurance(val.url)}
                            style={{ display: 'inline-block'}}
                        >
                            <div
                                className="_tempImg"
                                style={{
                                    background: `url(${val.path})  no-repeat`,
                                    backgroundSize: 'cover',
                                    width: '100vw',
                                    paddingTop: '32%',
                                    borderRadius: '0px',
                                }}
                            >
                            </div>

                        </a>
                    ))}
                </Carousel>
            </div> : null}
        </div>
    }



}
