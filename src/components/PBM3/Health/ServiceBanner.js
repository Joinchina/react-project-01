import React, { Component } from 'react';


import CCVDEvalImg from '../images/CCVDEval.png';
import drugPlanEvalImg from '../images/drugPlanEval.png';
import weightEvalImg from '../images/weightEval.png';
import DoctorImg from '../images/familyDoctor.png';
import { List } from 'antd-mobile';


const TaskList = [
    {
        task: '家庭医生',
        img: DoctorImg,
        checkState: 'doctor',
    },
    {
        task: '用药方案评估',
        img: drugPlanEvalImg,
        checkState: 'medication',
    },
    {
        task: '心脑风险评估',
        img: CCVDEvalImg,
        checkState: 'ccvd',
    },  {
        task: '体重评估',
        img: weightEvalImg,
        checkState: 'weight',
    }
]
export default class TaskBanner extends Component {
    constructor(props) {
        super(props);
        this.state = {
            todayTask: {
                physical: true, //体检按钮是否展示
                ccvd: true, //心脑血管评估是否展示
                medication: true, //用药方案评估是否展示
                weight: true //体重评估
            }
        }
    }


    renderTask() {
        const { todayTask } = this.state;
        return TaskList.map(task => {

            return <img src={task.img} />
        })
    }
    render() {
        return <div className="task">
            <div className="taskBox">
                <div className="taskList">
                    {this.renderTask()}
                </div>
            </div>
        </div>
    }
}
