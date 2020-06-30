import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import { Route } from 'react-router-dom';

import store from '../store';
import history from '../history';

import AsyncComponent from './common/AsyncComponent';

import OrderDetails from './OrderDetails';
// import Login from './Login';
const Login = AsyncComponent(()=>import('./Login'));
// import NotBound from './NotBound';
const NotBound = AsyncComponent(()=>import('./NotBound'));
// import ImproveInformation from './ImproveInformation';
const ImproveInformation = AsyncComponent(()=>import('./ImproveInformation'));
// import Register from './Register';
const Register = AsyncComponent(()=>import('./Register'));
// import NewAndCourteous from './NewAndCourteous';
const NewAndCourteous = AsyncComponent(()=>import('./NewAndCourteous'));
// import NewShare from './NewAndCourteous/share';
const NewShare = AsyncComponent(()=>import('./NewAndCourteous/share'));
// import NotComplete from './NotComplete';
const NotComplete = AsyncComponent(()=>import('./NotComplete'));
// import BaiduTongji from './common/BaiduTongji';
const BaiduTongji = AsyncComponent(()=>import('./common/BaiduTongji'));
// import Points from './Points';
const Points = AsyncComponent(()=>import('./Points'));
// import NewDrugSearch from './NewDrugSearch';
const NewDrugSearch = AsyncComponent(()=>import('./NewDrugSearch'));
// import NewDrugDetail from './NewDrugDetail';
const NewDrugDetail = AsyncComponent(()=>import('./NewDrugDetail'));
// import MedicineHomePage from './MedicineHomePage';
const MedicineHomePage = AsyncComponent(()=>import('./MedicineHomePage'));

// import AddressList from './common/AddressSelect'
const AddressList = AsyncComponent(()=>import('./common/AddressSelect'));

const MemberType = AsyncComponent(()=>import( './Register/MemberType'));
const UseNum = AsyncComponent(()=>import( './RequirementUseNum'));
const RequirementList = AsyncComponent(()=>import( './RequirementList'));
const CheckPage = AsyncComponent(()=>import( './CheckPage'));
const CheckSuccessPage = AsyncComponent(()=>import( './CheckPage/checkSuccess'));

const NewUserInfo = AsyncComponent(()=>import( './NewUserInfo'))
const NewOrderList = AsyncComponent(()=>import( './NewOrderList'))
const NewUserMember = AsyncComponent(()=>import( './NewUserInfo/member'))

const OrderCommonList = AsyncComponent(()=>import( './OrderCommonList'))
const UserAddressList = AsyncComponent(()=>import( './UserAddressList'));

const VipDay = AsyncComponent(()=>import( './OrderCommonList/vipDay'))
const ReturnDetails = AsyncComponent(()=>import( './OrderDetails/ReturnDetails'));
const NewCoupon = AsyncComponent(()=>import( './NewCoupon'))
const InsurancePaySuccess = AsyncComponent(()=>import( './Insurance/PaySuccess'));

const NewHealthHomePage = AsyncComponent(()=>import( './PBM3/Main'));
const NewMedicineCredentials = AsyncComponent(()=>import( './NewMedicineCredentials'));
const HowToUsePoint = AsyncComponent(()=>import( './NewHealthHomePage/howToUsePoint.js'));
const PointRule = AsyncComponent(()=>import( './NewHealthHomePage/pointRule.js'));
const SharePage = AsyncComponent(()=>import( './NewHealthHomePage/sharePage.js'));
const InsuranceList = AsyncComponent(()=>import( './Insurance/InsuranceList'));
const InsuranceListVision2 = AsyncComponent(()=>import( './Insurance/InsuranceListVision2'))
const ServiceInfo = AsyncComponent(()=>import( './Insurance/ServiceInfo'));
const InsuranceInfo = AsyncComponent(()=>import( './Insurance/InsuranceInfo'));
const Notice = AsyncComponent(()=>import( './Insurance/Notice'));
const NewBMI = AsyncComponent(()=>import( './NewBMI'));
const GatherHappiness = AsyncComponent(()=>import( './ActivityPage/GatherHappiness'));
const AdsVideo = AsyncComponent(()=>import( './Ads/AdsVideo'));
const AdsCardForm = AsyncComponent(()=>import( './Ads/AdsCardForm'));
const AdsInsuranceForm = AsyncComponent(()=>import( './Ads/AdsInsuranceForm'));
const RedirectMiniProgram = AsyncComponent(()=>import( './Redirect'));

const DrugEvaluation = AsyncComponent(()=>import( './DrugEvaluation'));
const EvaluationPatient = AsyncComponent(()=>import( './DrugEvaluation/evaluationPatient'));
const EvaluationDrugInfo = AsyncComponent(()=>import( './DrugEvaluation/evaluationDrugInfo'));
const EvaluationResult = AsyncComponent(()=>import( './DrugEvaluation/evaluationResult'));
const EvaluationDrugSearch = AsyncComponent(()=>import( './DrugEvaluation/evaluationSearchDrug'));

const Health = AsyncComponent(()=>import( './PBM3/Health'));
const Baiji = AsyncComponent(()=>import( './Partner/Baiji'));

const HealthClass = AsyncComponent(()=>import( './HealthClass'));
const HealthNewsPage = AsyncComponent(()=>import( './HealthClass/healthNewsPage.js'))
const HealthPhysical = AsyncComponent(()=>import( './HealthPhysical'));

const MyMedicalReport = AsyncComponent(()=>import( './MyMedicalReport'));
const MyReportInfo = AsyncComponent(()=>import( './MyMedicalReport/myReportInfo'));

const MyDoctor = AsyncComponent(()=>import( './MyDoctor'));

const Insurance = AsyncComponent(()=>import( './Insurance/InsuranceRender'));
const ExchangeList = AsyncComponent(() => import('./PointExchange/ExchangeList'));
const ExchangeInfo = AsyncComponent(() => import('./PointExchange/ExchangeInfo'));

const ShareToOther = AsyncComponent(() => import("./NewHealthHomePage/shareToOther.js"));
const AnxinNotice = AsyncComponent(() => import("./Insurance/anxin_Insurance/Notice"));
const InsuranceBuy = AsyncComponent(() => import("./Insurancehome/indexDetail"));
const PartSoldLogin = AsyncComponent(() => import("./PartSoldLogin"));
const PartSoldDetail = AsyncComponent(() => import("./PartSoldLogin/show_detail.js"));
const DoctorGo = AsyncComponent(() => import("./MyDoctor/indexgo"));
const YSGC = AsyncComponent(() => import("./ysgc/index"));
class App extends Component {
    render() {
        return <Provider store={store}>
            <ConnectedRouter history={this.props.history || history}>
                <div className="weixin-content">
                    <BaiduTongji />
                    <div className="weixin-content">
                        <Route exact path='/user/bind' component={Login} />
                        <Route exact path='/user/memberType' component={MemberType} />
                        <Route exact path='/requirementListUseNum' component={UseNum} />
                        <Route exact path='/requirementList' component={RequirementList} />
                        <Route exact path='/newDrugSearch' component={NewDrugSearch} />
                        <Route exact path='/newDrugDetail' component={NewDrugDetail} />
                        <Route exact path='/medicineHomePage' component={MedicineHomePage} />
                        <Route exact path='/user/info' component={NewUserInfo} />
                        <Route exact path='/newOrderList' component={NewOrderList} />
                        <Route exact path='/newUserMember' component={NewUserMember} />
                        <Route exact path='/orderCommonList' component={OrderCommonList} />
                        <Route exact path='/vipDay' component={VipDay} />
                        <Route exact path='/newCoupon' component={NewCoupon} />
                        <Route exact path='/newHealthHomePage' component={NewHealthHomePage} />
                        <Route exact path='/newMedicineCredentials' component={NewMedicineCredentials} />
                        <Route exact path='/howToUsePoint' component={HowToUsePoint} />
                        <Route exact path='/pointRule' component={PointRule} />
                        <Route exact path='/sharePage' component={SharePage} />
                        <Route exact path='/shareToOther' component={ShareToOther} />
                        <Route exact path='/newBMI' component={NewBMI} />
                        <Route exact path='/addressSelect' component={AddressList} />

                        <Route exact path='/checkSuccess' component={CheckSuccessPage} />
                        <Route exact path='/check' component={CheckPage} />

                        <Route exact path='/orderRetrun/:orderId' component={ReturnDetails} />
                        <Route exact path='/order/:orderId' component={OrderDetails} />
                        <Route exact path='/points' component={Points} />
                        <Route exact path='/addressList' component={UserAddressList} />
                        <Route exact path='/not-bound' component={NotBound} />
                        <Route exact path='/user/register' component={Register} />
                        {/**完善信息 */}
                        <Route exact path='/improveInformation' component={ImproveInformation} />
                        {/**拉新有礼 */}
                        <Route exact path='/newAndCourteous' component={NewAndCourteous} />
                        <Route exact path='/newShare/:patientId' component={NewShare} />
                        <Route exact path='/notComplete' component={NotComplete} />

                        <Route exact path="/insuranceRoute" component={Insurance} />
                        <Route exact path='/insurance/:insurancePackageId' component={Insurance} />
                        <Route exact path='/insurancePaySuccess/:insuranceId' component={InsurancePaySuccess} />
                        <Route exact path='/insuranceServicePlan/:insurancePackageId' component={Insurance} />
                        <Route exact path='/insuranceDiseaseV2/:insurancePackageId' component={Insurance} />
                        <Route exact path='/insuranceDisease/:insurancePackageId' component={Insurance} />
                        <Route exact path='/serviceInfo/:insuranceId' component={ServiceInfo} />
                        <Route exact path='/insurances/:serviceId/:productName' component={InsuranceInfo} />
                        <Route exact path='/insuranceList' component={InsuranceList} />
                        <Route exact path='/insuranceListVision2' component={InsuranceListVision2} />
                        <Route exact path='/exchangeList' component={ExchangeList} />
                        <Route exact path='/exchange/:exchangeId' component={ExchangeInfo} />
                        <Route exact path='/gatherHappiness' component={GatherHappiness} />

                        <Route exact path='/notice' component={Notice} />

                        <Route exact path='/ads/video' component={AdsVideo} />
                        <Route exact path='/ads/cardForm' component={AdsCardForm} />
                        <Route exact path='/ads/insuranceForm' component={AdsInsuranceForm} />

                        <Route exact path='/drugEvaluation' component={DrugEvaluation} />
                        <Route exact path='/evaluationPatient' component={EvaluationPatient} />
                        <Route exact path='/evaluationDrugInfo' component={EvaluationDrugInfo} />
                        <Route exact path='/evaluationResult' component={EvaluationResult} />
                        <Route exact path='/evaluationDrugSearch' component={EvaluationDrugSearch} />

                        <Route exact path='/healthClass' component={HealthClass} />
                        <Route exact path='/healthNewsPage' component={HealthNewsPage} />
                        <Route exact path='/healthPhysical' component={HealthPhysical} />

                        <Route exact path='/redirect/miniProgram' component={RedirectMiniProgram}/>
                        <Route exact path='/health' component={Health} />
                        <Route exact path='/toBaiji' component={Baiji} />

                        <Route exact path='/myMedicalReport' component={MyMedicalReport} />
                        <Route exact path='/myReportInfo' component={MyReportInfo} />

                        <Route exact path='/myDoctor' component={MyDoctor} />
                        <Route exact path='/anxinInsurance' component={Insurance} />
	                    <Route exact path='/anxinInsurance_notice' component={AnxinNotice} />
                        <Route exact path='/InsuranceBuy' component={InsuranceBuy} />
                        <Route exact path='/partSoldLogin' component={PartSoldLogin} />
                        <Route exact path='/partSoldDetail' component={PartSoldDetail} />
                        <Route exact path='/DoctorGo' component={DoctorGo} />
                        <Route exact path='/YSGC' component={YSGC} />
                        <Route exact path='/zhonghuiCancer/:insurancePackageId' component={Insurance} />
                    </div>
                </div>
            </ConnectedRouter>
        </Provider>;
    }
}
export default App;
