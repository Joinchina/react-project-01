import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import './index.css';
import App from './components/App';
import './baidu-statistics';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

ReactDOM.render(<App />, document.getElementById('root'));
