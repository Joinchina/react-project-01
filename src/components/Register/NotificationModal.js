import React, { Component } from 'react';
import { Modal, Button } from 'antd';
import './index.less';

const NotificationMap = [{
    itemCode: 1,
    itemTitle: '万户健康慢病综合管理服务平台服务协议',
    itemNotification: <div>
        <p>
            <strong><span>尊敬的用户，欢迎阅读本协议：</span></strong><span> </span>
        </p>
        <p>
            <span>北京万户良方科技有限公司（以下简称“万户良方”）</span> <span>依据本协议的规定提供服务，本协议具有合同效力。<strong>您必须完全同意本协议</strong>，才能够享受本平台提供的服务。<strong>您在平台登录即表示您完全接受本协议的全部条款。</strong></span><strong><span> </span></strong>
        </p>
        <p>
            <strong><span>&nbsp;</span></strong>
        </p>
        <p>
            <strong><span>重要须知：</span></strong><strong> </strong><strong><span>万户良方在此特别提醒用户认真阅读本《用户服务协议》</span></strong><strong><span><br /> --- </span></strong><strong><span>用户应认真阅读本《用户服务协议》</span></strong><strong><span> (</span></strong><strong><span>下称本协议</span></strong><strong><span>)</span></strong><strong><span>中各条款，</span></strong><strong> </strong><strong><span>包括免除或者限制万户良方责任的免责条款及对用户的权利限制。请您审阅并选择接受或不接受本协议（未成年人应在法定监护人陪同下审阅）。除非您接受本协议条款，否则您无权使用本平台提供的相关服务。您的使用行为将视为对本协议的接受，并同意接受本协议各项条款的约束。</span></strong><strong><span> </span></strong>
        </p>
        <p>
            <strong><span>&nbsp;</span></strong>
        </p>
        <p>
            <strong><span>一、定义</span></strong><strong> </strong>
        </p>
        <p>
            <span>在本协议中所使用的下列词语，除非另有定义，应具有以下含义：</span>
        </p>
        <p>
            <span>1.1 “</span><span>本平台</span><span>”</span><span>在无特别说明的情况下，均指万户健康慢病综合管理服务平台。</span>
        </p>
        <p>
            <span>1.2 “</span><span>用户</span><span>”</span><span>指符合本协议所规定的条件，同意遵守本平台各种规则、条款（包括但不限于本协议），并使用本平台的个人。</span>
        </p>
        <p>
            <span>1.3 “</span><span>会员</span><span>”</span><span>是指在本平台的注册用户。</span>
        </p>
        <p>
            <span>1.4 “</span><span>万户良方</span><span>”</span><span>是指北京万户良方科技有限公司及其关联方。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <strong><span>二、用户资格</span></strong><span> </span>
        </p>
        <p>
            <span>2.1 </span><span>只有符合下列条件之一的人员才能申请成为本平台用户，可以使用本平台的服务。</span>
        </p>
        <p>
            <span>2.1.1 </span><span>年满十八岁，并具有民事权利能力和民事行为能力的自然人；</span>
        </p>
        <p>
            <span>2.1.2 </span><span>未满十八岁，但监护人（包括但不仅限于父母）予以书面同意的自然人；</span>
        </p>
        <p>
            <span>2.2 </span><span>用户必须注册一个本平台账号，并遵守《用户服务协议》。用户必须确保其用以注册账号的信息真实、准确、符合法律法规及本协议规定，否则由此引起的一切纠纷、损失和法律责任由用户自行承担。</span><span> </span>
        </p>
        <p>
            <span>2.3 </span><span>用户注册本平台账号必须提供真实的身份信息和联系电话。</span><span> </span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <strong><span>三、用户的权利和义务</span></strong><span> </span>
        </p>
        <p>
            <span>3.1 </span><span>用户有权根据本协议的规定及本平台发布的相关规则，利用本平台进行信息搜索、个人健康数据记录。</span><span> </span>
        </p>
        <p>
            <span>3.2 </span><span>用户有权根据需要更改密码并对以该用户名进行的所有活动和事件负全部责任。</span><span> </span>
        </p>
        <p>
            <span>3.3 </span><span>用户有义务确保向本平台提供的任何资料、注册信息真实准确，包括但不限于真实姓名、身份证号、联系电话、地址等。同时，用户也有义务在相关资料实际变更时及时更新有关注册资料。</span><span> </span>
        </p>
        <p>
            <span>3.4 </span><span>用户同意接收来自本平台的信息，包括但不限于活动信息、交易信息等。</span>
        </p>
        <p>
            <span>3.5 </span><span>未经本平台书面允许，用户不得将本平台资料以及在交易平台上所展示的任何信息以复制、修改、翻译等形式制作衍生作品、分发、传播、公开展示或以其他方式进行处置。</span><span> </span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <strong><span>四、</span></strong><strong> </strong><strong><span>本平台的权利和义务</span></strong><span> </span>
        </p>
        <p>
            <span>4.1 </span><span>本平台有义务在现有技术水平的基础上努力确保整个网上交易平台的正常运行，尽力避免服务中断或将中断时间限制在最短时间内，保证用户网上交易活动的顺利进行。</span><span> </span>
        </p>
        <p>
            <span>4.2</span><span>本平台有义务对用户在注册使用本平台网上交易平台中所遇到的问题及反映的情况及时作出回复。</span><span> </span>
        </p>
        <p>
            <span>4.3 </span><span>本平台有权对用户的注册资料进行查阅，对本平台自行判断可能存在任何问题的注册资料，本平台有权发出通知询问用户并要求用户做出解释、改正，或直接做出屏蔽、删除等处理。</span><span> </span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <strong><span>五、协议的修订</span></strong><span> </span>
        </p>
        <p>
            <span>本协议可由本平台随时修订，并将修订后的协议公告于本平台之上，修订后的条款内容自公告时起生效，并成为本协议的一部分<strong>。用户若在本协议修改之后，仍继续使用本平台，则视为用户接受和自愿遵守修订后的协议。本平台行使修改或中断服务时，不需对任何第三方负责。</strong></span><strong><span> </span></strong>
        </p>
        <p>
            <strong><span>&nbsp;</span></strong>
        </p>
        <p>
            <strong><span>六、本平台的责任范围</span></strong><strong> </strong>
        </p>
        <p>
            <span>当用户接受该协议时，用户应明确了解并同意</span><span>∶</span><span> </span>
        </p>
        <p>
            <span>本平台提供与其它互联网上的网站或资源的链接，用户可能会因此连结至其它运营商经营的网站，但不表示本平台与这些运营商有任何关系。其它运营商经营的网站均由各经营者自行负责，不属于本平台控制及负责范围之内。对于存在或来源于此类网站或资源的任何内容、广告、产品或其它资料，本平台亦不予保证或负责。因使用或依赖任何此类网站或资源发布的或经由此类网站或资源获得的任何内容、产品或服务所产生的任何损害或损失，本平台不负任何直接或间接的责任。</span><span> </span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <strong><span>七、知识产权</span></strong><strong> </strong>
        </p>
        <p>
            <span>本平台及本平台所使用的任何相关软件、程序、内容，包括但不限于作品、图片、档案、资料、构架、版面的安排、网页设计、经由本平台或广告商向用户呈现的广告或资讯，均由本平台或其它权利人依法享有相应的知识产权，包括但不限于著作权、商标权、专利权或其它专属权利等，受到相关法律的保护。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <strong><span>八、不可抗力</span></strong><span> </span>
        </p>
        <p>
            <span>因不可抗力或者其他意外事件，使得本协议的履行不可能、不必要或者无意义的，双方均不承担责任。本合同所称之不可抗力意指不能预见、不能避免并不能克服的客观情况，包括但不限于战争、台风、水灾、火灾、雷击或地震、罢工、暴动、法定疾病、黑客攻击、网络病毒、电信部门技术管制、政府行为或任何其它自然或人为造成的灾难等客观情况。</span><span> </span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <strong><span>九、争议解决方式</span></strong><strong> </strong>
        </p>
        <p>
            <span>9.1 </span><span>本协议及其修订本的有效性、履行和与本协议及其修订本效力有关的所有事宜，将受中华人民共和国法律管辖，任何争议仅适用中华人民共和国法律。</span><span> </span>
        </p>
        <p>
            <span>9.2 </span><span>本协议签订地为中国北京市。因本协议所引起的用户与万户良方的任何纠纷或争议，首先应友好协商解决，协商不成的，用户在此完全同意将纠纷或争议提交北京万户良方科技有限公司</span> <span>所在地，即北京市有管辖权的人民法院诉讼解决。</span><span> </span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <br />
        </p></div>,
}, {
    itemCode: 2,
    itemTitle: '隐私政策',
    itemNotification: <div>
        <p>
            <span>隐私权是每个人的重要权利，万户良方（下称“我们”）非常重视用户个人信息和隐私的保护。在使用万户良方移动端产品或网站服务前，请您务必仔细阅读并透彻理解万户良方《隐私政策》（下称“本隐私政策”、“本政策”）。我们希望通过本隐私政策向您说明我们在您使用万户良方的产品与服务时如何收集、使用、保存、共享和转让这些信息。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>最近更新日期：</span><span>2019</span><span>年</span><span>12</span><span>月</span><span>4</span><span>日</span>
        </p>
        <p>
            <span>如果您有任何疑问、意见或建议，请通过以下联系方式与我们联系：</span>
        </p>
        <p>
            <span>电</span> <span>话：</span><span>400-010-1516 </span><span>（周一至周五</span><span> 8:30-17:30</span><span>）</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>【特别提示】</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>为了更好保护您的个人信息，请在使用万户良方的产品与服务前，仔细阅读并充分了解本政策。重点内容我们已采用粗体特别提示，希望您在阅读浏览时特别关注。<strong>一旦您使用或继续使用万户良方产品与服务，即表示您同意我们按照本政策处理您的相关信息。</strong>对于我们所收集的您的敏感信息，我们亦用粗体的方式进行了标示，以此向您增强式提示。一旦您同意提供您的个人敏感信息，我们将按本政策所述的目的和方式处理您的个人敏感信息。我们使用您的个人敏感信息的目的是为了实现万户良方的产品与服务相关的功能。您有权拒绝向我们提供个人敏感信息，但是拒绝我们收集使用这些信息可能会影响您使用相关功能。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>目</span> <span>录</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>一、我们如何收集和使用您的个人信息</span>
        </p>
        <p>
            <span>二、我们如何使用</span><span>Cookie</span><span>技术</span>
        </p>
        <p>
            <span>三、我们如何共享、转让、公开披露您的个人信息</span>
        </p>
        <p>
            <span>四、本政策如何更新</span>
        </p>
        <p>
            <span>五、如何联系我们</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>一、我们如何收集和使用您的个人信息</span>
        </p>
        <p>
            <span>个人信息是指以电子或者其他方式记录的能够单独或者与其他信息结合识别特定自然人身份或者反映特定自然人活动情况的各种信息。个人信息包括：姓名、身份证件信息、手机号码、银行账号、交易流水、系统账号、邮箱地址、个人用药处方信息、个人健康相关信息等。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>个人敏感信息是指一旦泄露、非法提供或滥用，可能危害人身和财产安全，极易导致个人名誉、身心健康受到损害或歧视行待遇等的信息，主要包括：身份证件信息（如，身份证号、护照号）、银行账号、位置信息、交易信息等。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>我们仅会出于本政策以下目的，收集和使用您的个人信息：</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>（一）您须授权我们收集和使用您个人信息的情形</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>1</span><span>、获取万户良方的产品与服务所需的功能</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>（</span><span>1</span><span>）注册成为万户良方用户</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>您注册成为万户良方用户时，您需要至少向我们提供您本人的手机号码，我们将通过发送短信验证码的方式来验证您的身份是否有效。您可以补充您身份信息、本人手机号码、居住地信息等，这些信息均属于您的“账户信息”。您补充的账户信息将有助于我们为您提供个性化的服务推荐和更优的用户体验，但如果您不提供这些补充信息，可能会影响您使用部分基本功能。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>如您仅使用浏览、搜索等基本服务，您不需要注册成为用户以及提供上述信息。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>（</span><span>2</span><span>）个人日常健康及用药处方信息</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>为了向您提供全面的健康管理服务，我们可能会需要您上传您的健康数据（包括但不限于家庭遗传病史、日常的饮食、近期就诊记录体检报告、慢病服药情况以及购买慢性病药品的处方信息等），这些实名信息可能包括您的身份信息（比如您的身份证号码、载明您身份证明证件的号码）、您本人的姓名、电话号码。如果您需要提供寄送服务，您还需要提供地址、收件人姓名以及电话。如您需要开具发票，在您添加发票抬头时，需提供公司名称、纳税人识别号信息。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>（</span><span>3</span><span>）支付功能</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>您可以通过万户良方移动端产品或网站完成开放的购买订单，您可以选择万户良方的关联方或与万户良方合作的第三方支付机构（包括但不限于支付宝、微信支付等支付通道，以下称“支付机构”）所提供的支付服务，此时可能需要您提供银行卡卡号、有效期、银行预留手机号、持卡人姓名、持卡人身份证件、卡验证码信息，支付功能本身并不收集您的个人信息，但我们需要将您的订单号与交易金额信息与这些支付机构共享以实现其确认您的支付指令并完成支付。“关联方”指一方现在或将来控制、受控制或与其处于共同控制下的任何公司、机构以及上述公司或机构的法定代表人。“控制”是指直接或间接地拥有影响所提及公司管理的能力，无论是通过所有权、有投票权的股份、合同或其他被人民法院认定的方式。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>（</span><span>4</span><span>）交付产品与服务功能</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>我们会通过电话、短信等形式与您确认您购买的产品与服务的相关信息，并由实际服务提供方向您交付产品或提供服务。您知晓并确认万户良方的关联方或与万户良方合作的产品与服务方会在上述环节内使用您的订单信息，以保证能向您及时交付相关产品与服务。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>（</span><span>5</span><span>）客服与售后功能</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>当您需要我们提供与您订单信息相关的客服与售后服务时，我们将会查询您的相关信息。因此，我们的电话客服和售后服务会使用您的账号信息和订单信息来对您进行身份核验。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>（</span><span>6</span><span>）改进我们的产品与服务所必须的功能</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>为了提升用户体验和服务品质，我们可能会收集您的健康数据、订单信息、浏览信息进行汇集和数据分析，以便为您提供个性化服务及改进服务质量。对于从您的各种设备上收集到的信息，我们可能会将它们进行关联，以便我们能在这些设备上为您提供高效一致的服务。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>2</span><span>、提供安全保障所必须的功能</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>为提高您使用我们以及我们关联公司或合作伙伴提供的产品与服务时系统的安全性，更准确地预防钓鱼网站或</span><span>APP</span><span>欺诈、计算机病毒、网络攻击、网络侵入以及保护账户安全，我们也会收集您的设备信息对于万户良方系统问题进行分析、统计流量并排查可能存在的风险并依法采取必要的记录、审计、分析、处置措施。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>3</span><span>、需另行征得您的授权同意</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>当我们要将信息用于本政策未载明的其它用途时，会事先征求您的同意。当我们要将基于特定目的收集而来的信息用于其他目的时，会事先征求您的同意。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>（二）无需征得您授权同意可收集、使用您个人信息的情形</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>根据相关法律法规、监管要求及国家标准，在以下情形中，我们可以在不征得您的授权同意情况下收集、使用一些必要的个人信息：</span>
        </p>
        <p>
            <span>（</span><span>1</span><span>）与我们履行法律法规规定的义务相关的；</span>
        </p>
        <p>
            <span>（</span><span>2</span><span>）与国家安全、国防安全直接相关的；</span>
        </p>
        <p>
            <span>（</span><span>3</span><span>）与公共安全、公共卫生、重大公共利益直接相关的；</span>
        </p>
        <p>
            <span>（</span><span>4</span><span>）与犯罪侦查、起诉、审判和判决执行等直接相关的；</span>
        </p>
        <p>
            <span>（</span><span>5</span><span>）出于维护您或其他个人的生命、财产等重大合法权益但又很难得到本人同意的；</span>
        </p>
        <p>
            <span>（</span><span>6</span><span>）所涉及的个人信息是您自行向社会公众公开的；</span>
        </p>
        <p>
            <span>（</span><span>7</span><span>）根据您与我们签订和履行合同所必需的；</span>
        </p>
        <p>
            <span>（</span><span>8</span><span>）从合法公开披露的信息中收集到您的个人信息，如从合法的新闻报道、政府信息公开等渠道；</span>
        </p>
        <p>
            <span>（</span><span>9</span><span>）用于维护我们产品与服务的安全稳定运行所必需的，例如发现、处置产品与服务故障；</span>
        </p>
        <p>
            <span>（</span><span>10</span><span>）从合法公开披露的信息中收集个人信息的，如合法的新闻报道、政府信息公开等渠道；</span>
        </p>
        <p>
            <span>（</span><span>11</span><span>）出于公共利益开展统计或学术研究所必需，且对外提供学术研究或描述的结果时，对结果中所包含的个人信息进行去标识化处理的；</span>
        </p>
        <p>
            <span>（</span><span>12</span><span>）法律法规规定的其他情形。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>（三）您可选择是否授权我们收集和使用您的个人信息的情形</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>1</span><span>、需要使用到您的银行卡信息（例如银行卡号）的场景，主要包括：您申请退款时，需要提供您银行卡信息才能支付给您。您了解并同意我们基于上述场景使用您的银行卡信息，如您不提供该信息，可能无法完成支付、提现、结算等。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>2</span><span>、我们可能需要您在您的设备中向我们开启您的地理位置（位置信息）来判断您所处的地点，自动为您推荐您所在区域可以购买的产品与服务。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>（四）我们从第三方获得您个人信息</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>我们可能会在您的授权同意范围内从第三方（我们的合作方）处收集并使用您的个人信息。我们会将依据与第三方的约定并对个人信息来源的合法性进行确认后，在符合相关法律法规前提下，使用您的这些个人信息，同时请您详细阅读该第三方的隐私政策及用户协议。如您拒绝第三方在提供服务时收集、使用或者传递您的个人信息，将可能导致您无法使用万户良方对应的产品与服务。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>（五）您个人信息使用的规则</span>
        </p>
        <p>
            <span>1</span><span>、<strong>我们会根据本隐私政策的约定并为实现我们的产品与服务功能对所收集的个人信息进行使用。当我们要将您的个人信息用于本政策未载明的其它用途时，会通过事先征求您的授权同意。</strong></span>
        </p>
        <p>
            <span>2</span><span>、<strong>在收集您的个人信息后，在我们对您的个人信息进行去标识化处理后，我们可对去标识化处理后的用户数据库进行分析并予以商业化的利用。</strong></span>
        </p>
        <p>
            <strong><span>3</span></strong><strong><span>、请您注意，您在使用我们的产品与服务时，除非您删除或通过系统设置拒绝我们收集，否则将在您使用我们的产品与服务期间将持续授权我们使用。</span></strong>
        </p>
        <p>
            <strong><span>4</span></strong><strong><span>、我们会对我们的产品与服务使用情况进行统计，并可能会与公众或第三方共享这些统计信息，以展示我们的产品与服务的整体使用趋势。但这些统计信息不包含您的任何身份识别信息。</span></strong>
        </p>
        <p>
            <span>5</span><span>、如果我们发生合并、收购或破产清算可能涉及到个人信息转让时，我们会要求新的持有您个人信息的公司、组织继续受本政策的约束。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>二、我们如何使用</span><span>Cookie</span><span>技术</span>
        </p>
        <p>
            <span>为确保网站或移动端产品正常运转，我们会在您的计算机或移动设备上储存名为</span><span>Cookie</span><span>的小数据文件。</span><span>Cookie</span><span>通常包含标识符、站点名称以及一些号码和字符。借助于</span><span>Cookie</span><span>，网站或</span><span>APP</span><span>能够储存您的偏好等数据。我们不会将</span><span>Cookie</span><span>用于本政策所述目的之外的任何用途。您可根据自己的偏好管理或删除</span><span>Cookie</span><span>。有关详情，请参见</span><span>AboutCookies.org</span><span>。您可以清除计算机上保存的所有</span><span>Cookie</span><span>，大部分网络浏览器都设有阻止</span><span>Cookie</span><span>的功能。但如果您这么做，则需要在每一次访问我们的网站或</span><span>APP</span><span>时更改用户设置。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>三、我们如何共享、转让、公开披露您的个人信息</span>
        </p>
        <p>
            <span>（一）共享</span>
        </p>
        <p>
            <span>1</span><span>、我们可能会向合作伙伴等第三方共享您的健康信息、身份信息以及位置信息，以保障为您提供的产品与服务顺利完成。但我们仅会出于合法、正当、必要、特定、明确的目的共享您的个人信息，并且只会共享提供服务所必要的个人信息。我们的合作伙伴无权将共享的个人信息用于任何其他用途。我们的合作伙伴包括以下几种类型：</span>
        </p>
        <p>
            <span>（</span><span>1</span><span>）供应商：包括但不限于为了向您提供健康管理服务所需的独立第三方服务机构，这些供应商可能根据需要与您联系，以完成服务。</span>
        </p>
        <p>
            <span>（</span><span>2</span><span>）金融机构和第三方支付机构：当您预订订单、申请退款、购买服务时，我们会与金融机构或第三方支付机构共享特定的订单信息，当我们认为用于欺诈检测和预防目的实属必要时，我们将进一步和相关金融机构共享其他必要信息，如</span><span>IP</span><span>地址等。</span>
        </p>
        <p>
            <span>（</span><span>3</span><span>）关联公司：我们可能会与我们的关联公司共享您的个人信息，使我们能够向您提供与旅行相关的或者其他产品及服务的信息，他们会采取不低于本隐私政策同等严格的保护措施。所谓关联公司是指与我们有关的任何直接或间接（通过一个或一个以上的中介或协议安排）控制该方或被该方控制、或与该方共同受控制的任何个人、合伙、组织或实体。“控制”是指直接或间接地拥有影响所提及公司管理的能力，无论是通过所有权、有投票权的股份、合同或其他被人民法院认定的方式。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <strong><span>如果您拒绝我们的合作方在提供服务时收集为提供服务所必须的个人信息，将可能导致您无法使用万户良方通过该合作方提供的产品与服务。</span></strong>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>2</span><span>、除上述第</span><span>1</span><span>种情况外，我们不会与任何公司、组织和个人共享您的个人信息，但以下情况除外：</span>
        </p>
        <p>
            <span>（</span><span>1</span><span>）事先获得您的明确授权或同意：获得您的明确同意后，我们会与其他方共享您的个人信息；</span>
        </p>
        <p>
            <span>（</span><span>2</span><span>）在法定情形下的共享：根据适用的法律法规、法律程序、诉讼</span><span>/</span><span>仲裁、政府的强制命令、监管要求而需共享您的个人信息；</span>
        </p>
        <p>
            <span>（</span><span>3</span><span>）在法律要求或允许的范围内，为了保护您或社会公众的利益、财产或安全免遭损害而有必要提供您的个人信息给第三方（含消费者权益保护部门等行业组织）；</span>
        </p>
        <p>
            <span>（</span><span>4</span><span>）为了保护国家安全、公共安全以及您和其他个人的重大合法权益而需要共享您的个人信息；</span>
        </p>
        <p>
            <span>（</span><span>5</span><span>）您自行公开的或者我们能从其他合法公开渠道获取到您的个人信息。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>（二）转让</span>
        </p>
        <p>
            <span>我们不会将您的个人信息转让给任何公司、组织或个人，除非发生下列情况：</span>
        </p>
        <p>
            <span>（</span><span>1</span><span>）事先获得您的明确同意；</span>
        </p>
        <p>
            <span>（</span><span>2</span><span>）根据所适用的法律法规、行业规定、法律程序要求、诉讼</span><span>/</span><span>仲裁、政府的强制命令、监管要求所必须要求提供的；</span>
        </p>
        <p>
            <span>（</span><span>3</span><span>）为了保护国家安全、公共安全以及您和其他个人的重大合法权益而需要转让您的个人信息；</span>
        </p>
        <p>
            <span>（</span><span>4</span><span>）您自行公开的或者我们能从其他合法公开渠道获取到您的个人信息。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>如果发生合并、收购或破产清算，将可能涉及到个人信息转让，此种情况下我们会要求新的持有您个人信息的公司、组织继续受本政策的约束。如果本政策中约定的个人信息的收集、处理方式发生任何改变，该公司、组织将重新向您征求授权同意。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>（三）公开披露</span>
        </p>
        <p>
            <span>除非获取您的明确同意，我们不会公开披露您的个人信息。基于法律、法律程序、诉讼或政府主管部门强制性要求的情况下，为了保护国家安全、公共安全以及您和其他个人的重大合法权益，我们可能会向有权机关或公众披露您的个人信息。但我们保证，在上述情况发生时，我们会要求披露请求方必须出具与之相应的有效法律文件，并对被披露的信息采取符合法律和业界标准的安全防护措施。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>四、本政策如何更新</span>
        </p>
        <p>
            <span>1</span><span>、我们的隐私政策可能变更。但未经您明确同意，我们不会削减您依据本隐私政策所应享有的权利。当本政策发生变更时，我们会在万户良方移动端产品、网站上提前以公告、弹窗或以其他适当方式向您展示变更后的政策。<strong>未经您同意，我们不会限制您按照政策所应享有的相关权利。</strong></span><strong></strong>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>2</span><span>、对于重大变更，我们还会提供更为显著的通知（我们会通过包括但不限于短信或在浏览页面做特别提示等方式，说明隐私政策的具体变更内容）。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>本政策所指的重大变更包括但不限于：</span>
        </p>
        <p>
            <span>（</span><span>1</span><span>）我们的服务模式发生重大变化。如处理个人信息的目的、处理的个人信息类型、个人信息的使用方式等；</span>
        </p>
        <p>
            <span>（</span><span>2</span><span>）我们在所有权结构、组织架构等方面发生重大变化。如业务调整、破产并购等引起的所有者变更等；</span>
        </p>
        <p>
            <span>（</span><span>3</span><span>）个人信息共享、转让或公开披露的主要对象发生变化；</span>
        </p>
        <p>
            <span>（</span><span>4</span><span>）您参与个人信息处理方面的权利及其行使方式发生重大变化；</span>
        </p>
        <p>
            <span>（</span><span>5</span><span>）我们负责处理个人信息安全的责任部门、联络方式及投诉渠道发生变化时；</span>
        </p>
        <p>
            <span>（</span><span>6</span><span>）个人信息安全影响评估报告表明存在高风险时。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>3</span><span>、请您注意，只有在获取您的同意后，我们才会按照更新后的政策收集、使用、处理和储存您的个人信息。</span>
        </p>
        <p>
            <span>&nbsp;</span>
        </p>
        <p>
            <span>五、如何联系我们</span>
        </p>
        <p>
            <span>如您对本隐私政策有任何疑问、意见或建议，请通过以下方式与我们联系：</span>
        </p>
        <p>
            <span>电话：</span><span>400-010-1516 </span><span>（周一——周五</span><span> 8:30-17:30</span><span>）</span>
        </p>
        <p>
            <span>一般情况下，我们将在三十天内回复。如果您对我们的回复不满意，特别是我们的个人信息处理行为损害了您的合法权益，您还可以向网信、公安及市场监督等监管部门进行投诉或举报。</span>
        </p>
        <p>
            <br />
        </p>
    </div>,

}, {
    itemCode: 3,
    itemTitle: '法律声明',
    itemNotification: '法律声明法律声明法律声明法律声明法律声明',
},]

class NotificationModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            disabled: true,
            secondsElapsed: 10,
            notificationCode: 1,
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props && nextProps && nextProps.visible !== this.props.visible && nextProps.visible !== undefined) {
            this.setState({
                visible: nextProps.visible,
            });
        }
        if (this.props.notificationCode !== nextProps.notificationCode && nextProps.notificationCode) {
            this.setState({
                notificationCode: nextProps.notificationCode,
            });
        }
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    handleOk = e => {
        const { notificationCode } = this.state;
        this.props.readMe(false, notificationCode);
        this.setState({
            visible: false,
        });
    };

    handleCancel = e => {
        const { notificationCode } = this.state;
        this.props.readMe(false, notificationCode);
        this.setState({
            visible: false,
        });
    };

    render() {
        const { notificationCode } = this.state;
        const notification = NotificationMap.find(item => item.itemCode === notificationCode);
        return (
            <Modal
                title={notification ? notification.itemTitle : ''}
                visible={this.state.visible}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                className="notificationModal"
                footer={[
                    <Button
                        key="submit"
                        style={{ height: '36px' }}
                        className="button12 selectButton"
                        onClick={this.handleOk}
                    >
                        同意
                    </Button>,
                ]}
            >
                <div>{notification ? notification.itemNotification : ''}
                </div>
            </Modal>
        );
    }
}

export default NotificationModal;
