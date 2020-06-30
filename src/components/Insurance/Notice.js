import React, { Component, Fragment } from 'react';
import { Document, Page } from 'react-pdf';
import { Pagination, Button } from 'antd-mobile';
import querystring from 'query-string';
import Title from '../common/Title';


class Preview extends Component {
    state = {
        fileName: null,
        pdfFilePath: null,
        numPages: 0,
        pageNumber: 1,
        loading: true,
    }

    componentDidMount() {
        const qs = this.props.location.search.slice(this.props.location.search.indexOf('?') + 1);
        const queryData = querystring.parse(qs);
        const { filePath, fileName } = queryData;
        this.setState({
            pdfFilePath: filePath,
            fileName,
        })
        window.addEventListener('message', (event) => {
            this.setState({ pdfBase64: event.data })
        }, false)
    }

    onDocumentLoad = ({ numPages }) => {
        this.setState({ numPages, loading: false });
    }

    onChangePage = (page) => {
        this.setState({ pageNumber: page });
    }

    // onDownLoadFile = (filepath) => {
    //     const fileName = 'filePath'
    //     window.open(`/api/download?filepath=${encodeURIComponent(filepath)}&fileName=${fileName}`);
    // }

    render() {
        const width = document.body.clientWidth;
        const { pdfFilePath, numPages, pageNumber, loading, fileName } = this.state
        return (
            <div>
                <Title>{fileName || ''}</Title>
                <Document
                    onLoadSuccess={this.onDocumentLoad}
                    file={pdfFilePath}
                    renderMode='svg'
                >
                    <Page pageNumber={pageNumber} width={width} />
                </Document>
                {
                    loading ? null : <div>
                        <Pagination
                            total={numPages}
                            showTotal={total => `共 ${total} 页`}
                            current={pageNumber}
                            pageSize={1}
                            size='small'
                            style={{ maxHeight: '47px' }}
                            onChange={this.onChangePage}
                        />
                        {/* {<Button onClick={() => this.onDownLoadFile(pdfFilePath)}>下载</Button> } */}

                    </div>
                }

            </div>
        )
    }

}

export default Preview
