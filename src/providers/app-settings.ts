import { Injectable } from "@angular/core";
import { AppSettingProvider } from "../bnlc-framework/providers/app-setting/app-setting";

import * as moment from "moment";

enum MinuteFixType {
    // 交易开始之前（ 9:00 之前，早于集合竞价）
    BeforeTrading,
    // 集合竞价之前（ 9:15 之前）
    BeforeAuction,
    Morning,
    Noon,
    Afternoon,
    AfterTrading,
}

@Injectable()
export class AppSettings {
    // http://192.168.16.185:40001/api/v1/bngj/news/swagger
    // public readonly SERVER_URL: string = 'http://119.23.68.40:11890';
    // public readonly SERVER_URL: string = 'http://192.168.16.101:40001'; //company mac server
    public get SERVER_URL() {
        return AppSettingProvider.SERVER_URL;
    } //test server
    // public readonly SERVER_URL: string = 'http://192.168.18.37:40001'; //company server
    // public readonly SERVER_URL: string = 'http://192.168.16.185:40001'; //zhiguang server
    // public readonly SERVER_URL: string = 'http://110.86.32.3:40001'; //company ip
    public get SERVER_PREFIX() {
        return AppSettingProvider.SERVER_PREFIX;
    }
    // public readonly SOCKET_URL: string = 'http://192.168.16.230:10011';
    // public readonly SOCKET_URL: string = 'http://192.168.16.235:10011';
    public readonly SOCKET_URL: string = "http://119.23.68.40:11880"; //原gjs,现不用
    public readonly SOCKET_PREFIX: string = "/socket/v1/bngj";

    public readonly RegExp_Tel = [
        /^((13[4-9])|(15([0-2]|[7-9]))|(18[2|3|4|7|8])|(178)|(147))[\d]{8}$/, //RegExp_CMCC
        /^((13[0-2])|(145)|(15[5-6])|(176)|(18[5-6]))[\d]{8}$/, //RegExp_CUCC
        /^((133)|(153)|(18[0|1|9])|(177))[\d]{8}$/, //RegExp_CTCC
    ];

    public get Platform_Type() {
        return AppSettingProvider.Platform_Type;
    }
    // public readonly Platform_Type: string = '002'; //平台类型： 001高交所、002币加所、003本能理财

    public readonly Charts_Array_Length: number = 400;

    // 虚假登录开关
    public readonly FAKE_LOGIN: boolean = false;

    //模拟数据开关
    public readonly SIM_DATA: boolean = false;

    //数据过期时间
    public readonly EXPIRE_TIME_SPAN: number = 1e3 * 60 * 60 * 24 * 30;

    // 退出某个页面后，多长时间取消对于实时数据的订阅。
    // 避免切换页面时实时数据频繁订阅/取消订阅，
    // 因为有时切换页面前后观看的都是同一个股票的数据。
    // 实际效果待测试。
    public readonly UNSUBSCRIBE_INTERVAL: number = 5e3;

    private _minuteOffset = 0;

    public get minuteOffset(): number {
        return this._minuteOffset;
    }

    private _minuteFixType: MinuteFixType = MinuteFixType.Morning;

    // public readonly LOGIN_URL: string = `${this.SERVER_URL}/api/v1/gjs/auth/customers/login`;
    public readonly LOGIN_URL: string = `${this.SERVER_URL +
        this.SERVER_PREFIX}/user/login`;

    public readonly KDATA_UNITS = ["day", "week", "month"];

    // 将本地时间转换为 UTC 时间时，分钟的偏移量。
    // 北京时间为东八区，需要扣除 8 小时。
    private readonly TO_UTC_MINUTES_OFFSET = -8 * 60;

    private _tradingTime = [
        { start: "09:30", end: "11:30" },
        { start: "13:00", end: "15:00" },
    ];

    public get tradingTime() {
        return this._tradingTime;
    }

    private _tradingMinutePeriods: { start: number; end: number }[] = [];

    public get tradingMinutePeriods(): { start: number; end: number }[] {
        return this._tradingMinutePeriods;
    }

    private _tradingTimeArray: string[] = [];

    public get tradingTimeArray() {
        return this._tradingTimeArray;
    }

    // 交易日切换时间（开盘之前的分钟数）。
    // 设置值为 30 ，即北京时间 9:00 切换交易日。
    // 0:00 - 9:00 之间的“当前交易日”实际上指的是上一个交易日。
    public readonly TRADE_DAY_SWITCH_MINUTES_BEFORE_TRADING = 30;

    // 开盘之前的集合竞价时间（分钟）。
    // 集合竞价属性设为 0 ，表示无集合竞价环节。
    public readonly AUCTION_MINUTES_BEFORE_TRADING = 0;

    // 开盘之前的集合竞价结束时间（分钟）
    public readonly AUCTION_DONE_MINUTES_BEFORE_TRADING = 0;

    private _betsTitle: string[] = [];

    public get betsTitle() {
        return this._betsTitle;
    }

    public agreementData = {
        zh: {
            title: ``,
            agreementFirst: `
      <p>币加所（www.picaex.com）是Picasso Blockchain Technology（Malta）Limited（以下称 “公司”）旗下的一款专门供用户进行数字资产交易和提供相关服务（以下称“该服务”或“服务”）的平台。为了本协议表述之方便，公司在本协议中合称使用“我们”或其他第一人称称呼。只要登陆该平台的自然人或其他主体均为本平台的用户，本协议表述之便利，以下使用“您”或其他第二人称。为了本协议表述之便利，我们和您在本协议中合称为“双方”，我们或您单称为“一方”。 <br>
重要提示： <br>
我们在此特别提醒您： <br>
•   1 数字资产本身不由任何金融机构或公司或本平台发行； <br>
•   2 数字资产市场是全新的、未经确认的，而且可能不会增长； <br>
•   3 数字资产主要由投机者大量使用，零售和商业市场使用相对较少，数字资产交易存在极高风险，其全天24小时不间断交易，没有涨跌限制，价格容易受庄家、全球政府政策的影响而大幅波动； <br>
•   4 因各国法律、法规和规范性文件的制定或者修改，数字资产交易随时可能被暂停或被禁止。 <br>
数字资产交易有极高风险，并不适合绝大部分人士。您已了解和理解此投资有可能导致部分损失或全部损失，所以您应该以能承受的损失程度来决定投资的金额。您了解和理解数字资产会产生衍生风险，所以如有任何疑问，建议先寻求理财顾问的协助。此外，除了上述提及过的风险以外，还会有未能预测的风险存在。您应慎重考虑并用清晰的判断能力去评估自己的财政状况及上述各项风险而作出任何买卖数字资产的决定，并承担由此产生的全部损失，我们对此不承担任何责任。 <br>
敬告您： <br>
•   1 本平台仅作为您获取数字资产信息、寻找交易方、就数字资产的交易进行协商及开展交易的场所，本平台不参与您的任何交易，故您应自行谨慎判断确定相关数字资产及/或信息的真实性、合法性和有效性，并自行承担因此产生的责任与损失。 <br>
•   2 本平台的任何意见、消息、探讨、分析、价格、建议和其他资讯均是一般的市场评论，并不构成投资建议。我们不承担任何因依赖该资讯直接或间接而产生的损失，包括但不限于任何利润损失。 <br>
•   3 本平台的内容会随时更改并不作另行通知，我们已采取合理措施确保网站资讯的准确性，但并不能保证其准确性程度，亦不会承担任何因本平台上的资讯或因未能链结互联网、传送或接收任何通知和信息时的延误或失败而直接或间接产生的损失。 <br>
•   4 使用互联网形式的交易系统亦存有风险，包括但不限于软件，硬件和互联网链结的失败等。由于我们不能控制互联网的可靠性和可用性，我们不会对失真，延误和链结失败而承担任何责任。 <br>
•   5 <a href="https://www.picaex.com/" target="_blank">https://www.picaex.com/</a>为本平台唯一官方对外信息公布平台； <br>
•   6 本平台任何服务均不接受信用卡支付； <br>
•   7 禁止使用本平台从事洗钱、走私、商业贿赂等一切非法交易活动，若发现此类事件，本站将采取各种可使用之手段，包括但不限于冻结账户，通知相关权力机关等，我们不承担由此产生的所有责任并保留向相关人士追究责任的权利。 <br>
一、总则 <br>
•   1.1 《用户协议》（以下称“本协议”或“本条款及条件”），由正文、《隐私条款》、《了解你的客户和反洗钱政策》以及本平台已经发布的或将来可能发布的各类规则、声明、说明等构成。 <br>
•   1.2 您在使用本平台提供的各项服务之前，应仔细阅读本协议，如有不理解之处或其他必要，请咨询专业律师。如您不同意本协议及/或随时对其的修改，请您立即停止使用本平台提供的服务或不再登陆本平台。您一旦登陆本平台、使用本平台的任何服务或任何其他类似行为即表示您已了解并完全同意本协议各项内容，包括本平台对本协议随时所做的任何修改。 <br>
•   1.3 您通过按照本平台的要求填写相关信息，并经过其他相关程序后成功注册可以成为本平台的会员（以下称“会员”），在进行注册过程中点击（勾选）“同意”按钮即表示您以电子签署的形式与公司达成协议；或您在使用本平台过程中点击任何标有“同意”或类似意思的按钮的行为或以其他本平台允许的方式实际使用本平台提供的服务时，均表示您完全了解、同意且接受本协议项下的全部条款的约束，无您手写的书面签字就本协议对您的法律约束力无任何影响。 <br>
•   1.4 您成为本平台的会员后，您将获得一个会员帐号及相应的密码，该会员帐号和密码由会员负责保管；会员应当对以其您帐号进行的所有活动和事件负法律责任。 <br>
•   1.5 只有成为本平台的会员才可使用本平台提供的数字资产交易平台进行交易及享受其他本平台规定的只有会员才可获得的服务；会员外的其他您只有登陆网站、浏览网站及其他本平台规定的可获得的服务。 <br>
•   1.6 通过注册和使用任何由本平台提供的服务和功能，您将被视为已阅读，理解并： <br>
o   1.6.1 接受本协议所有条款及条件的约束。 <br>
o   1.6.2 您确认您已年满16周岁或根据不同的可适用的法律规定的具有可订立合同的法定年龄，并有充分的能力接受这些条款，并订立交易，使用本平台进行数字资产交易。 <br>
o   1.6.3 您保证交易中涉及到的属于您的数字资产均为合法取得并所有。 <br>
o   1.6.4 您同意您为您自身的交易或非交易行为承担全部责任和任何收益或亏损。 <br>
o   1.6.5 您确认注册时提供的信息是真实和准确的。 <br>
o   1.6.6 您同意遵守任何有关法律的规定，就税务目的而言，包括报告任何交易利润。 <br>
o   1.6.7 本协议只是就您与我们之间达成的权利义务关系进行约束，而并不涉及本平台用户之间与其他网站和您之间因数字资产交易而产生的法律关系及法律纠纷。 <br>
二、协议修订 <br>
我们保留不时修订本协议、并以网站公示的方式进行公告、不再单独通知您的权利，变更后的协议会在本协议首页标注变更时间，一经在网站公布，立即自动生效。您应不时浏览及关注本协议的更新变更时间及更新内容，如您不同意相关变更，应当立即停止使用本平台服务；您继续使用本平台服务，即表示您接受并同意经修订的协议的约束。 <br>
三、注册 <br>
•   3.1 注册资格 <br>
•   您确认并承诺：在您完成注册程序或以其他本平台允许的方式实际使用本平台提供的服务时，您应当是具备可适用的法律规定的可签署本协议及使用本平台服务应具有的能力的自然人、法人或其他组织。您一旦点击同意注册按钮，即表示您自身或您的有权代理人已经同意该协议内容并由其代理注册及使用本平台服务。若您不具备前述主体资格，则您及您的有权代理人应承担因此而导致的一切后果，且公司保留注销或永久冻结您账户，并向您及您的有权代理人追究责任的权利。 <br>
•   3.2 注册目的 <br>
•   您确认并承诺：您进行本平台注册并非出于违反法律法规或破坏本平台数字资产交易秩序的目的。 <br>
•   3.3 注册流程 <br>
o   3.3.1 您同意根据本平台用户注册页面的要求提供有效电子邮箱、手机号码等信息，您可以使用您提供或确认的邮箱、手机号码或者本平台允许的其它方式作为登陆手段进入本平台。如有必要，按照不同法域相关法律法规的规定，您必须提供您的真实姓名、身份证件等法律法规及隐私条款及反洗钱条款规定的相关信息并不断更新注册资料，符合及时、详尽、准确的要求。所有原始键入的资料将引用为注册资料。您应对该等信息的真实性、完整性和准确性负责，并承担因此产生的任何直接或间接损失及不利后果。 <br>
o   3.3.2 如您所在主权国家或地区的法律法规、规则、命令等规范对手机号码有实名要求，您同意提供注册的手机号码是经过实名登记的，如您不按照规定提供，因此给您带来的任何直接或间接损失及不利后果均应由您承担。 <br>
o   3.3.3 您合法、完整并有效提供注册所需信息并经验证，有权获得本平台账号和密码，您获得本平台账号及密码时视为注册成功，可在本平台进行会员登陆。 <br>
o   3.3.4 您同意接收本平台发送的与本平台管理、运营相关的电子邮件和/或短消息。 <br>
四、服务 <br>
本平台只为您通过本平台进行数字资产交易活动（包括但不限于数字资产交易等服务）提供网络交易平台服务，本平台并不作为买家或卖家参与买卖数字资产行为本身；本平台不提供任何国家法定货币充入和提取的相关服务。 <br>
•   4.1 服务内容 <br>
o   4.1.1 您有权在本平台浏览数字资产各项产品的实时行情及交易信息、有权通过本平台提交数字资产交易指令并完成数字资产交易。 <br>
o   4.1.2 您有权在本平台查看其本平台会员账号下的信息，有权应用本平台提供的功能进行操作。 <br>
o   4.1.3 您有权按照本平台发布的活动规则参与本平台组织的网站活动。 <br>
o   4.1.4 本平台承诺为您提供的其他服务。 <br>
•   4.2 服务规则 <br>
您承诺遵守下列本平台服务规则： <br>
o   4.2.1 您应当遵守法律法规、规章、及政策要求的规定，保证账户中所有数字资产来源的合法性，不得在本平台或利用本平台服务从事非法或其他损害本平台或第三方权益的活动，如发送或接收任何违法、违规、侵犯他人权益的信息，发送或接收传销材料或存在其他危害的信息或言论，未经本平台授权使用或伪造本平台电子邮件题头信息等。 <br>
o   4.2.2 您应当遵守法律法规并妥善使用和保管其本平台账号及登陆密码、资金密码、和其注册时绑定的手机号码、以及手机接收的手机验证码的安全。您对使用其本平台账号和登陆密码、资金密码、手机验证码进行的任何操作和后果承担全部责任。当您发现本平台账号、登陆密码、或资金密码、验证码被未经其授权的第三方使用，或存在其他账号安全问题时，应立即有效通知本平台，要求本平台暂停本平台账号的服务。本平台有权在合理时间内对您的该等请求采取行动，但本平台对在采取行动前已经产生的后果（包括但不限于您的任何损失）不承担任何责任。您在未经本平台同意的情况下不得将本平台账号以赠与、借用、租用、转让或其他方式处分给他人。 <br>
o   4.2.3 您同意您对您的本平台的账号、密码下发生的所有活动（包括但不限于信息披露、发布信息、网上点击同意或提交各类规则协议、网上续签协议或购买服务等）承担责任。 <br>
o   4.2.4 您在本平台进行数字资产交易时不得恶意干扰数字资产交易的正常进行、破坏交易秩序；不得以任何技术手段或其他方式干扰本平台的正常运行或干扰其他用户对本平台服务的使用；不得以虚构事实等方式恶意诋毁本平台的商誉。 <br>
o   4.2.5 如您因网上交易与其他用户产生纠纷的，不得通过司法或行政以外的途径要求本平台提供相关资料。 <br>
o   4.2.6 您在使用本平台提供的服务过程中，所产生的应纳税赋，以及一切硬件、软件、服务及其它方面的费用，均由您独自承担。 <br>
o   4.2.7 您应当遵守本平台不时发布和更新的本协议以及其他服务条款和操作规则，有权随时终止使用本平台提供的服务。 <br>
•   4.3 产品规则 <br>
o   4.3.1 币币交易产品规则 <br>
您承诺在其进入本平台交易，通过本平台与其他用户进行币币交易的过程中良好遵守如下交易规则。 <br>
   4.3.1.1 浏览交易信息 <br>
   您在本平台浏览币币交易信息时，应当仔细阅读交易信息中包含的全部内容，包括但不限于价格、委托量、手续费、买入或卖出方向， 您完全接受交易信息中包含的全部内容后方可点击按钮进行交易。 <br>
   4.3.1.2 提交委托 <br>
   在浏览完交易信息确认无误之后您可以提交交易委托。您提交交易委托后，即您授权本平台代理您进行相应的交易撮合，本平台在有满足您委托价格的交易时将会自动完成撮合交易而无需提前通知您。 <br>
   4.3.1.3 查看交易明细 <br>
   您可以通过管理中心的交易明细中查看相应的成交记录，确认自己的详情交易记录。 <br>
   4.3.1.4 撤销/修改委托，在委托未达成交易之前，您有权随时撤销或修改委托。 <br>
五、本平台的权利和义务 <br>
•   5.1 如您不具备本协议约定的注册资格，则本平台有权拒绝您进行注册，对已注册的，本平台有权注销您的会员账号，本平台保留向您或您的有权代理人追究责任的权利。同时，本平台保留其他任何情况下决定是否接受您注册的权利。 <br>
•   5.2 本平台发现账户使用者并非账户初始注册人时，有权中止或终止该账户的使用。 <br>
•   5.3 本平台通过技术检测、人工抽检等检测方式合理怀疑您提供的信息错误、不实、失效或不完整时，有权通知您更正、更新信息或中止、终止为其提供本平台服务。 <br>
•   5.4 本平台有权在发现本平台上显示的任何信息存在明显错误时，对信息予以更正。 <br>
•   5.5 本平台保留随时修改、中止或终止本平台服务的权利，本平台行使修改或中止服务的权利不需事先告知您；本平台终止本平台一项或多项服务的，终止自本平台在网站上发布终止公告之日生效。 <br>
•   5.6 本平台应当采取必要的技术手段和管理措施保障本平台的正常运行，并提供必要、可靠的交易环境和交易服务，维护数字资产交易秩序。 <br>
•   5.7 如您连续一年未使用本平台会员账号和密码登陆本平台，则本平台有权注销您的本平台账号。账号注销后，本平台有权将相应的会员名开放给其他您注册使用。 <br>
•   5.8 本平台通过加强技术投入、提升安全防范等措施保障您的数字资产的安全，有义务在您账户出现可以预见的安全风险时提前通知您。 <br>
•   5.9 本平台有权随时删除本平台内各类不符合法律法规或本平台规定等的内容信息，本平台行使该等权利不需提前通知您。 <br>
•   5.10 本平台有权根据您所属主权国家或地区的法律法规、规则、命令等规范的要求，向您要求提供更多的信息或资料等，并采取合理的措施，以符合当地的规范之要求，您有义务配合；本平台有权根据您所属主权国家或地区的法律法规、规则、命令等规范的要求，暂停或永久停止对您的开放本平台及其部分或全部服务。 <br>
六、赔偿 <br>
•   6.1 在任何情况下，我们对您的直接损害的赔偿责任均不会超过您从使用本平台服务产生的为期三（ 3）个月的总费用。 <br>
•   6.2 如您发生违反本协议或其他法律法规等情况，您须向我们至少赔偿200万美元及承担由此产生的全部费用（包括律师费等），如不够弥补实际损失，您须补全。 <br>
七、寻求禁令救济的权利 <br>
我们和您均承认普通法对违约或可能违约情况的救济措施是可能是不足以弥补我们遭受的全部损失的，故非违约方有权在违约或可能违约情况下寻求禁令救济以及普通法或衡平法允许的其他所有的补救措施。 <br>
八、责任限制与免责 <br>
•   8.1 您了解并同意，在任何情况下，我们不就以下各事项承担责任： <br>
o   8.1.1 收入的损失； <br>
o   8.1.2 交易利润或合同损失； <br>
o   8.1.3 业务中断 <br>
o   8.1.4 预期可节省的货币的损失； <br>
o   8.1.5 信息的损失； <br>
o   8.1.6 机会、商誉或声誉的损失； <br>
o   8.1.7 数据的损坏或损失； <br>
o   8.1.8 购买替代产品或服务的成本； <br>
o   8.1.9 任何由于侵权（包括过失）、违约或其他任何原因产生的间接的、特殊的或附带性的损失或损害，不论这种损失或损害是否可以为我们合理预见；不论我们是否事先被告知存在此种损 失或损害的可能性。 <br>
o   8.1.1 条至8.1.9条均是彼此独立的。 <br>
•   8.2 您了解并同意，我们不对因下述任一情况而导致您的任何损害赔偿承担责任： <br>
o   8.2.1 我们有合理的理由认为您的具体交易事项可能存在重大违法或违约情形。 <br>
o   8.2.2 我们有合理的理由认为您在本平台的行为涉嫌违法或不当。 <br>
o   8.2.3 通过本平台服务购买或获取任何数据、信息或进行交易等行为或替代行为产生的费用及损失。 <br>
o   8.2.4 您对本平台服务的误解。 <br>
o   8.2.5 任何非因我们的原因而引起的与本平台提供的服务有关的其它损失。 <br>
•   8.3 我们对由于信息网络设备维护、信息网络连接故障、电脑、通讯或其他系统的故障、电力故障、天气原因、意外事故、罢工、劳动争议、暴乱、起义、骚乱、生产力或生产资料不足、火灾、洪水、风暴、爆炸、战争、银行或其他合作方原因、数字资产市场崩溃、政府行为、 司法或行政机关的命令、其他不在我们可控范围内或我们无能力控制的行为或第三方的原因而造成的不能服务或延迟服务，以及造成的您的损失，我们不承担任何责任。 <br>
•   8.4 我们不能保证本平台包含的全部信息、程序、文本等完全安全，不受任何病毒、木马等恶意程序的干扰和破坏，故您登陆、使用本平台任何服务或下载及使用该下载的任何程序、信息、数据等均是您个人的决定并自行承担风险及可能产生的损失。 <br>
•   8.5 我们对本平台中链接的任何第三方网站的任何信息、产品及业务及其他任何形式的不属于我们的主体的内容等不做任何保证和承诺，您如果使用第三方网站提供的任何服务、信息及产品等均为您个人决定且承担由此产生的一切责任。 <br>
•   8.6 我们对于您使用本平台服务不做任何明示或暗示的保证，包括但不限于本平台提供服务的适用性、没有错误或疏漏、持续性、准确性、可靠性、适用于某一特定用途。同时，我们也不对本平台提供的服务所涉及的技术及信息的有效性、准确性、正确性、可靠性、质量、稳定、完整和及时性作出任何承诺和保证。是否登陆或使用本平台提供的服务是您个人的决定且自行承担风险及可能产生的损失。我们对于数字资产的市场、价值及价格等不做任何明示或暗示的保证，您理解并了解数字资产市场是不稳定的，价格和价值随时会大幅波动或崩盘，交易数字资产是您个人的自由选择及决定且自行承担风险及可能产生的损失。 <br>
•   8.7 本协议中规定的我们的保证和承诺是由我们就本协议和本平台提供的服务的唯一保证和陈述，并取代任何其他途径和方式产生的保证和承诺，无论是书面的或口头的，明示的或暗示的。所有这些保证和陈述仅仅代表我们自身的承诺和保证，并不保证任何第三方遵守本协议中的保证和承诺。 <br>
•   8.8 我们并不放弃本协议中未提及的在法律适用的最大范围内我们享有的限制、免除或抵销我们损害赔偿责任的任何权利。 <br>
•   8.9 您注册后即表示认可我们按照本协议中规定的规则进行的任何操作，产生的任何风险均由您承担。 <br>
九、协议的终止 <br>
•   9.1 本平台有权依据本协议约定注销您的本平台账号，本协议于账号注销之日终止。 <br>
•   9.2 本平台有权依据本协议约定终止全部本平台服务，本协议于本平台全部服务终止之日终止。 <br>
•   9.3 本协议终止后，您无权要求本平台继续向其提供任何服务或履行任何其他义务，包括但不限于要求本平台为您保留或向您披露其原本平台账号中的任何信息， 向您或第三方转发任何其未曾阅读或发送过的信息等。 <br>
•   9.4 本协议的终止不影响守约方向违约方要求其他责任的承担。 <br>
十、知识产权 <br>
•   10.1 本平台所包含的全部智力成果包括但不限于网站标志、数据库、网站设计、文字和图表、软件、照片、录像、音乐、声音及其前述组合，软件编译、相关源代码和软件 (包括小应用程序和脚本) 的知识产权权利均归本平台所有。您不得为商业目的复制、更改、拷贝、发送或使用前述任何材料或内容。 <br>
•   10.2 本平台名称中包含的所有权利 (包括但不限于商誉和商标、标志) 均归公司所有。 <br>
•   10.3 您接受本协议即视为您主动将其在本平台发表的任何形式的信息的著作权， 包括但不限于：复制权、发行权、出租权、展览权、表演权、放映权、广播权、信息网络传播权、摄制权、改编权、翻译权、汇编权 以及应当由著作权人享有的其他可转让权利无偿独家转让给本平台所有，本平台有权利就任何主体侵权单独提起诉讼并获得全部赔偿。 本协议效力及于您在本平台发布的任何受著作权法保护的作品内容， 无论该内容形成于本协议签订前还是本协议签订后。 <br>
•   10.4 您在使用本平台服务过程中不得非法使用或处分本平台或他人的知识产权权利。您不得将已发表于本平台的信息以任何形式发布或授权其它网站（及媒体）使用。 <br>
•   10.5 您登陆本平台或使用本平台提供的任何服务均不视为我们向您转让任何知识产权。 <br>
十一、信息保护 <br>
•   11.1 适用范围 <br>
o   11.1.1 在您注册网站账号或者使用账户时，您根据本平台要求提供的个人注册信息，包括但不限于电话号码、邮箱信息、身份证件信息。 <br>
o   11.1.2 在您使用本平台服务时，或访问本平台网页时，本平台自动接收并记录的您浏览器上的服务器数值，包括但不限于IP地址等数据及您要求取用的网页记录。 <br>
o   11.1.3 本平台收集到的您在本平台进行交易的有关数据，包括但不限于交易记录。 <br>
o   11.1.4本平台通过合法途径取得的其他您个人信息。 <br>
•   11.2 信息使用 <br>
o   11.2.1 不需要您额外的同意，您在本平台注册成功即视为您同意本平台收集并使用其在本平台的各类信息，如11.1条所列，您了解并同意，本平台可以将收集的您信息用作包括但不限于下列用途： <br>
   11.2.1.1 向您提供本平台服务； <br>
   11.2.1.2 基于主权国家或地区相关主管部门的要求向相关部门进行报告； <br>
   11.2.1.3 在您使用本平台服务时，本平台将您的信息用于身份验证、客户服务、安全防范、诈骗监测、存档和备份用途，确保本平台向您提供的产品和服务的安全性； <br>
   11.2.1.4 帮助本平台设计新产品及服务，改善本平台现有服务； <br>
   11.2.1.5为了使您解本平台服务的具体情况，您同意本平台向其发送营销活动通知、商业性电子信息以及提供与您相关的广告以替代普遍投放的广告； <br>
   11.2.1.6 本平台为完成合并、分立、收购或资产转让而将您的信息转移或披露给任何非关联的第三方； <br>
   11.2.1.7 软件认证或管理软件升级； <br>
   11.2.1.8 邀请您参与有关本平台服务的调查； <br>
   11.2.1.9 用于和政府机关、公共事务机构、协会等合作的数据分析； <br>
   11.2.1.10 用作其他一切合法目的以及经您授权的其他用途。 <br>
o   11.2.2 本平台不会向其他任何人出售或出借您的个人信息，除非事先得到您的许可。本平台也不允许任何第三方以任何手段收集、编辑、出售或者无偿传播您的个人信息。 <br>
•   11.3 本平台对所获得的客户身份资料和交易信息等进行保密，不得向任何单位和个人提供客户身份资料和交易信息，应相关主权国家或地区法律法规、政令、命令等规定要求本平台提供的除外。 <br>
十二、计算所有的交易计算结果都经过我们的核实，所有的计算方法都已经在网站上公示，但是我们不能保证网站的使用不会受到干扰或没有误差。 <br>
十三、出口控制您理解并承认，根据马耳他共和国相关法律，您不得将本平台上的任何材料（包括软件）出口、再出口、进口或转移，故您保证不会主动实施或协助或参与任何上述违反法规的出口或有关转移或其他违反适用的法律和法规的行为；如发现此类情形，会向我们积极报告并协助我们处理。 <br>
十四、转让本协议中约定的权利及义务同样约束从该权利义务中获取到利益的各方的受让人，继承人，遗嘱执行人和管理员。您不得在我们不同意的前提下转让给任何第三人，但我们可随时将我们在本协议中的权利和义务转让给任何第三人，并给予您提前30天的通知。 <br>
十五、可分割性如本协议中的任何条款被任何有管辖权的法院认定为不可执行的，无效的或非法的，并不影响本协议的其余条款的效力。 <br>
十六、非代理关系本协议中的任何规定均不可被认为创造了、暗示了或以其他方式将我们视为您的代理人、受托人或其他代表人，本协议有其他规定的除外。 <br>
十七、弃权我们或您任何一方对追究本协议约定的违约责任或其他责任的弃权并不能认定或解释为对其他违约责任的弃权；未行使任何权利或救济不得以任何方式被解释为对该等权利或救济的放弃。 <br>
十八、标题所有标题仅供协议表述方便，并不用于扩大或限制该协议条款的内容或范围。 <br>
十九、适用法律本协议全部内容均为根据马耳他共和国法律订立的合同，其成立、解释、内容及执行均适用马耳他共和国相关法律规定；任何因或与本协议约定的服务有关而产生的索赔或诉讼，都应依照马耳他共和国的法律进行管辖并加以解释和执行。为避免疑义，这一条款明确适用于任何针对我们的侵权索赔。任何针对我们或者是和我们有关的索赔或诉讼的管辖法院或诉讼地均在马耳他共和国。您无条件地获得在马耳他共和国法院进行诉讼和上诉的排他性的管辖权。您也无条件地同意与本协议款有关的争议或问题或产生的任何索赔请求和诉讼的发生地或法院均排他性得在马耳他共和国。不方便法院的原则不适用于根据本服务条款的选择的法院。 <br>
二十、协议的生效和解释 <br>
•   20.1 本协议于您点击本平台注册页面的同意注册并完成注册程序、获得本平台账号和密码时生效，对本平台和您均具有约束力。 <br>
•   20.2 本协议的最终解释权归本平台所有。 <br>
了解你的客户和反洗钱政策 <br>
一、导言 <br>
•   1.1我们保证审慎遵守“了解你的客户”和反洗钱相关的法律法规且不得故意违反该《了解你的客户和反洗钱政策》。在我们合理控制的范围内我们将采取必要的措施和技术为您提供安全的服务，尽可能使您免于遭受犯罪嫌疑人的洗钱行为带来的损失。 <br>
•   1.2我们的了解你的客户和反洗钱政策是一个综合性的国际政策体系，包括您隶属的不同法律辖区的了解你的客户和反洗钱政策。我们健全合规的框架确保我们在本地和全球层面均符合监管要求和监管水平，并确保本平台持续性运行。 <br>
二、了解你的客户和反洗钱政策如下： <br>
•   2.1颁布了解你的客户和反洗钱政策并时时更新以满足相应的法律法规规定的标准； <br>
•   2.2颁布和更新运行本平台的一些指导原则和规则，且我们的员工将按照该原则和规则的指导提供服务； <br>
•   2.3 设计并完成内部监测和控制交易的程序，如以严格的手段验证身份，安排组建专业团队专门负责反洗钱工作； <br>
•   2.4 采用风险预防的方法对客户进行尽职调查和持续的监督; <br>
•   2.5 审查和定期检查已发生的交易; <br>
•   2.6 向主管当局报告可疑交易; <br>
•   2.7身份证明文件、地址证明文件和交易记录的证明文件将会维持至少六年，如被提交给监管部门，恕不另行通知您。 <br>
•   2.8 整个交易过程中，信用卡被禁止使用； <br>
三、身份信息与核实确认 <br>
•   3.1 身份信息 <br>
o   3.1.1 根据不同的司法管辖区的不同规定及不同的实体类型，我们收集的您的信息内容可能不一致，原则上将向注册的个人收集以下信息： <br>
o   个人基本信息：您的姓名，住址（及永久地址，如果不同） ，出生日期及国籍等可获得的其他情况。身份验证应该是根据官方或其他类似权威机构发放的文件，比如护照，身份证或其他不同的辖区要求的和引发的身份证明文件。您提供的地址将使用适当的方法进行验证，比如检查乘用交通工具的票据或利率票据或检查选民登记册等。 <br>
o   有效的照片：在您注册之前，您须提供您将您的身份证件放在胸前的照片； <br>
o   联系方式：电话/手机号码和/或有效的电子邮件地址。 <br>
o   3.1.2如果您是一个公司或其他合法实体，我们将收集以下信息以确定您或信托帐户的最终受益人。 <br>
o   公司注册、登记证；公司的章程与备忘录副本；公司的股权机构和所有权说明的详细证明材料，证明决定本平台账户的开立以及执行的授权委托人的董事会决议；按照要求需要提供的公司董事、大股东及本平台账户有权签字人的身份证明文件；该公司的主要营业地址，如果与公司的邮寄地址不同，提供邮寄地址。如果公司在本地的地址与它的主要营业地址不一致的，则被视为风险较高的客户，需要提交额外附加文件。 <br>
o   •根据不同的司法管辖区的不同规定及不同的实体类型，我们要求的其他认证和权威部门发布的文件以及我们认为必要的文件。 <br>
o   3.1.3 我们只接受英语版本或汉语版本的身份信息，如不是，请您将您的身份信息翻译成英文的版本并加以公证。 <br>
•   3.2确认核实 <br>
o   3.2.1我们要求您提供身份证明文件的全部页面内容。 <br>
o   3.2.2 我们要求您提供您将您的身份证明文件放在您胸前的照片。 <br>
o   3.2.3证明文件的副本一般应核和原始凭证进行核对。然而，如果某个可信赖的合适的认证人可证明该副本文件是原始文件准确而全面的复制的，该副本可接受。这样的认证人包括大使、司法委员、地方治安官等。 <br>
o   3.2.4 对识别最终受益人和账户控制权的要求是确定哪些个人最终所有或控制直接客户，和/或确定正在进行的交易是由他人代为执行。如果是企业，则大股东的身份（例如那些持有10％或以上的投票权益）应被验证。一般，持股25 ％会被认定为正常风险内，其股东身份须验证；持股10%或拥有更多的投票权或股票时被认定为高风险的情况，股东身份须加以验证。 <br>
四、监控交易 <br>
•   4.1 我们根据安全性和实际交易情况时时设置和调整日常交易和提币最高限额; <br>
•   4.2如果交易频繁集中发生在某个注册用户或存在超乎合理的情况，我们的专业团队将评估并决定他们是否可疑; <br>
•   4.3我们凭借自身的判断认定为可疑交易的情况，我们可能会采取暂停该交易、拒绝该交易等限制性措施，甚至如果可能将尽快逆转该交易，同时向主管部门报告，但不会通知您; <br>
•   4.4我们保留拒绝来自于不符合国际反洗钱标准辖区的人或可被视为政治公众人物的人的注册申请，我们保留随时暂停或终止根据我们自身判断为可疑交易的交易，但我们这样做并不违反对您的任何义务和责任。</p>
      `,
        },
        en: {
            title: ``,
            agreementFirst: `
        <p>www.picaex.com is a platform operated by Picasso Blockchain Technology (Malta) Limited (hereinafter referred to as “the Company”) and dedicated to the transaction of digital assets and the provision of related services (hereinafter referred to as “the Services” or “Services”). For the convenience of wording in this Agreement, the Company and the Platform are referred to as “We” or other applicable forms of first-person pronouns in this Agreement. All natural persons or other subjects who log onto this Platform shall be deemed as users of this Platform. For the convenience of wording in this Agreement, the users are referred to as “You” or any other applicable forms of the second-person pronouns. For the convenience of wording in this Agreement, “You” and “We” are collectively referred to as “both parties”, and individually as “one party”.<br>
        Important Reminder:<br>
        We hereby remind you that:<br>
  •   1. The digital assets themselves are not provided by any financial institution, corporation or this Platform;<br>
  •   2. The digital asset market is new and unconfirmed, and will not necessarily expand;<br>
  •   3. Digital assets are primarily used by speculators, and are used relatively less on retail and commercial markets; digital asset transactions are highly risky, due to the fact that they are traded throughout 24 hours a day without limits on the rise or fall in price, and market makers and global government policies may cause major fluctuations in their prices;<br>
  •  4. Digital asset transactions may be suspended or prohibited at any time due to the enactment or modification of national laws, regulations and regulatory documents.
  Digital assets transactions is highly risky and therefore not suitable for the vast majority of people. You have acknowledged and understood that investment in digital assets may result in partial or total loss of your investment and therefore you are advised to assess your own risk tolerance and decide the amount of your investment on the basis of your loss-bearing capacity. You acknowledge and understand that digital assets may generate derivative risks. Therefore, if you have any doubt, you are advised to seek assistance from a financial adviser first. Furthermore, aside from the above-mentioned risks, there may also be unpredictable risks. Therefore, you are advised to carefully consider and use clear judgment to assess your financial status and the abovementioned risks before making any decisions on buying and selling digital assets; any and all losses arising therefrom will be borne by you and we shall not be held liable in any manner whatsoever.<br>
  You are hereby informed that:<br>
  •   1.	This Platform is only intended to serve as a venue for you to obtain digital asset information, find trading counterparties, hold negotiations on and effectuate transactions of digital assets. This Platform does not participate in any of your transactions, and therefore you shall, at your sole discretion, carefully assess the authenticity, legality and validity of relevant digital assets and/or information, and be solely liable for all responsibilities and losses that may arise therefrom.<br>
  •   2. All opinions, information, discussions, analyses, prices, advice and other information on this Platform are general market reviews and do not constitute any investment advice. You are advised to make your own judgement regarding the abovementioned information. We do not bear any loss arising directly or indirectly from reliance on the abovementioned information, including but not limited to, any loss of profits.<br>
  •   3. The content of this Platform may be changed from time to time and at any time without notice, and we have taken reasonable measures to ensure the accuracy and timeliness of the information on the Platform; however, we do not guarantee the degree of such accuracy and timeliness, or bear any loss arising directly or indirectly from the information on this Platform or from any delay or failure caused by failure to link up with the Internet, transmit or receive any notice and information.<br>
  •   4. Using Internet-based trading systems also involves risks, including but not limited to failures in software, hardware, Internet links, etc. In view of the fact that we cannot control the reliability and availability of the Internet, we will not be responsible for any distortion, delay and link failure.<br>
  •   5. <a href="https://www.picaex.com/" target="_blank">https://www.picaex.com/</a> is the sole official external information release platform for this Platform;<br>
  •   6. We do not accept credit card payments for any service on this Platform;<br>
  •   7. It is prohibited to use this Platform for any illegal trading activities, such as money-laundering, smuggling and commercial bribery. Upon uncovering any of such illegal activities, this Website will adopt all available measures, including but not limited to freezing accounts, notifying the relevant authorities and so on, and in this case, we shall not assume any of the responsibilities arising therefrom, and reserve the right to hold the relevant persons accountable.<br>
  I. General Provisions<br>
  •   1.1	The User Agreement (hereinafter referred to as “this Agreement” or “these Terms and Conditions”) consists of the main body, Privacy Policy, Know-Your-Customer and Anti-money-laundering Policy, as well as any rules, statements, instructions, etc. that this Platform has published or may publish in the future. <br>
  •   1.2		Before using any service provided by this Platform, you shall read this Agreement carefully, and consult a professional lawyer if you have any doubt or as may be otherwise necessary. If you do not agree to the Terms and Conditions of this Agreement and/or any change made thereto from time to time and at any time, please immediately stop using the service provided by this Platform or stop logging into this Platform. Upon your logging into this Platform or using any service provided by this Platform or engaging in any other similar activity, it shall be deemed as you have understood and fully agreed to all terms and conditions of this Agreement, including any and all changes, modifications or alterations that this Platform may make to this Agreement from time to time and at any time.<br>
  •   1.3	After filling in the relevant information in accordance with the requirements of this Platform, and going through other relevant procedures, you will successfully register yourself as a member of this Platform (hereinafter referred to as “Member”); if you check the “I Agree” button in the process of registration, it shall be deemed that you have reached an agreement with the Company by way of electronic signature; or when you use this Platform, you click on the “I Agree” button or a similar button, or if you use the Services provided by this Platform in any of the ways allowed by this Platform, it shall be deemed that you fully understand, agree to and accept all the Terms and Conditions under this Agreement, and in this case, the absence of your handwritten signature will not affect the legal binding force that this Agreement may have on you.<br>
  •   1.4	After you become a member of this Platform, you will receive a member account and corresponding password, which shall be properly kept by you as a member of this Platform; members shall be liable for all activities and events carried out through their accounts. <br>
  •   1.5	You cannot engage in digital asset transactions on this Platform and gain access to the Services that are exclusively available to members in accordance with the rules and regulations of this Platform, unless and until you become a member of this Platform; if you are not a member of this Platform, you can only log into and browse the Platform and have access to other Services as are permitted by the rules and regulations of this Platform. <br>
  •   1.6	Upon registering yourself as a member of this Platform and using any of the Services and functions provided by this Platform, it shall be deemed that you have read and understood this Agreement, and:<br>
  o   1.6.1 You accept to be bound by all Terms and Conditions of this Agreement;<br>
  o   1.6.2 You confirm that you have attained the age of 18, or another statutory age for entering into contracts as is required by a different applicable law, and have full capacity and full power to accept these Terms and Conditions herein and to enter into digital asset transactions through this Platform.<br>
  o   1.6.3 You pledge that all your digital assets involved in transactions hereunder are legally acquired and owned by you.<br>
  o   1.6.4 You agree to assume any and all liabilities for your own transactions and non-transaction activities as well as any and all profits and losses therefrom.<br>
  o   1.6.5 You confirm that the information provided at the time of registration is true and accurate. <br>
  o   1.6.6 You agree to abide by any and all relevant laws, including the reporting of any transaction profits for tax purposes.<br>
  o   1.6.7 This Agreement is only binding on the rights and obligations between you and us, and does not involve any legal relations and legal disputes arising from and relating to digital asset transactions between the users of this Platform, and between other websites and you.<br>
  II. Amendment of this Agreement<br>
  We reserve the right to amend this Agreement from time to time and to disclose such amendment by way of announcement on the Platform without sending a separate notice to you on your rights. The date when the amendment is made will be indicated on the first page of the amended agreement. The amended agreement will take effect immediately upon announcement on the Platform. You shall browse this Website from time to time and follow information on the time and content of amendments, if any, made to this Agreement. If you do not agree with the amendments, you shall stop using the Services provided by this Platform immediately; if you continue to use the Services provided by this Platform, it shall be deemed that you accept and agree to be bound by the amended agreement.<br>
  III. Registration<br>
  •   3.1 Eligibility for Registration <br>
  •   You confirm and pledge that: you shall be a natural person, a legal person or any other organization with the ability to sign this Agreement and the ability to use the Services of this Platform, as is provided by applicable laws, when you complete the registration process or when you use the Services provided by this Platform in any other manner as is otherwise permitted by this Platform. Upon clicking on the button indicating that you agree to register, it shall be deemed that you yourself or your authorized agent agrees to the content of this Agreement and your authorized agent will register with this Platform and use the Services provided by this Platform on your behalf. If you are not a natural person, legal person or organization with the abovementioned abilities, you and your authorized agent shall bear all the consequences resulting therefrom, and the Company reserves the right to cancel or permanently freeze your account and to hold you and your authorized agent accountable.<br>
  •   3.2 Purpose of Registration<br>
  •   You confirm and pledge that: you do not register with this Platform for the purpose of violating any of the applicable laws or regulations or undermining the order of digital asset transactions on this Platform.<br>
  •   3.3 Registration Process<br>
  o   3.3.1 You agree to provide a valid email address, a mobile phone number and other information in accordance with the requirements on the user registration page of this Platform. You can use the email address, mobile phone number or any other manner permitted by this Platform to log in to this Platform. Where it is necessary and in accordance with the requirements of applicable laws and regulations of relevant jurisdictions, you shall provide your real name, identity documents and other information required by applicable laws, regulations, the Privacy Policy, and Anti-money-laundering Policy, and constantly update your registration data so that they will be timely, detailed and accurate as is required. All of the original input data will be referenced as registration information. You shall be responsible for the authenticity, integrity and accuracy of such information and bear any direct or indirect loss and adverse consequences arising out of it.<br>
  o   3.3.2 If any of the applicable laws, regulations, rules, orders and other regulatory documents of the sovereign state or region where you are based requires that mobile phone accounts must be registered with real names, you hereby confirm that the mobile phone number you provide for registration purposes has gone through the real-name registration procedure. If you cannot provide such a mobile phone number as is required, any direct or indirect losses and adverse consequences caused to you thereby shall be borne by you.<br>
  o   3.3.3 After you provide the required registration information in a legal, complete and valid manner and such information passes relevant verification, you shall have the right to obtain an account and a password of this Platform. Upon obtaining such account and password, your registration shall be deemed as successful and you can log into this Platform as a member thereof.<br>
  o   3.3.4 You agree to receive emails and/or short messages sent by this Platform related to the management and operation thereof.<br>
  IV. Services <br>
  This Platform only provides online transaction platform Services for you to engage in digital asset trading activities through this Platform (including but not limited to the digital asset transactions, etc.), and does not participate in the transaction of digital assets as a buyer or seller. This Platform does not provide any Services relating to the deposit and withdrawal of the legal tender of any country.<br>
  •   4.1 Content of Services<br>
  o   4.1.1 You have the right to browse the real-time quotes and transaction information of various digital asset products on this Platform, to submit digital asset transaction instructions and to complete the digital asset transaction through this Platform.<br>
  o   4.1.2 You have the right to view information under your member account on this Platform and to use the functions provided by this Platform.<br>
  o   4.1.3 You have the right to participate in the website activities organized by this Platform in accordance with the rules of activities published on this Platform.<br>
  o   4.1.4 Other Services that this Platform promises to offer to you.<br>
  •   4.2 Service Rules<br>
  You pledge to abide by the following service rules of this Platform:<br>
  o   4.2.1 You shall abide by the provisions of applicable laws, regulations, rules, and policy requirements, and ensure the legality of all the source of digital assets in your account, and shall refrain from engaging in any illegal activities or other activities that may damage the rights and interests of this Platform or any third party on or through this Platform, such as sending or receiving information that is illegal, illicit or infringes on the rights and interests of any other person, sending or receiving pyramid scheme information or other harmful information or remarks, and unauthorized use or falsification of the email header information of this Platform.<br>
  o   4.2.2 You shall abide by applicable laws and regulations and properly use and keep your account and login password, password of your financial transactions, and the mobile phone number bound with your account that you provide upon registration of your account, as well as the verification codes received via your mobile phone. You shall be solely responsible for any and all your operations carried out using your account and login password, financial transaction password, verification codes sent to your mobile phone, as well as all consequences of such operations. When you uncover any unauthorized use of your account and login password, financial transaction password, or mobile phone verification codes by any third party, or any other problems relating to the security of your account, you shall inform this Platform in a prompt and effective manner, and request this Platform to temporarily suspend the Services to your account. This Platform shall have the right to take action on your request within a reasonable period of time; nonetheless, this Platform does not bear any liability for the consequences that have arisen before such action is taken, including but not limited to any loss you may sustain. You may not dispose of your account with this Platform to any other parties by way of donation, lending, leasing, transfer or otherwise without the consent of this Platform.<br>
  o   4.2.3 You agree to take responsibility for all activities (including but not limited to information disclosure, information release, online approval or submission of various agreements on rules, online renewal of agreements or purchase service) using your account and password with this Platform.<br>
  o   4.2.4 When performing digital asset transactions on this Platform, you may not maliciously interfere with the normal proceeding of the digital asset transaction or disrupt the order of transaction; you may not interfere with the normal operation of this Platform or other users’ access to the Services provided by this Platform by using any technical means or other means; you may not maliciously defame the business reputation of this Platform on the ground of falsified fact.<br>
  o   4.2.5 If any dispute arises between you and any other user in connection with online transactions, you may not resort to any means other than judicial or administrative means to request this Platform to provide relevant information.<br>
  o   4.2.6 All taxes payable as well as all fees incurred relating to hardware, software, services, etc. in the course of using the Services provided by this Platform shall be solely borne by you.<br>
  o   4.2.7 You shall abide by this Agreement and other terms of service and operating rules that this Platform may release and update from time to time, and you have the right to terminate your use of the Services provided by this Platform at any time.<br>
  •   4.3 Product Rules <br>
  o   4.3.1 Rules for crypto-to-crypto trading products <br>
  You pledge that you will properly abide by the following transaction rules in the process in which you log into this Platform and engage in crypto-to-crypto transactions through this Platform. <br>
     4.3.1.1 Browsing transaction information<br>
     When you browse the crypto-to-crypto transaction information on this Platform, you shall read all the content contained in the transaction information, including but not limited to the price, commission volume, handling fee, buying or selling direction, and you shall accept all the contents contained in the transaction information before clicking on the button to proceed with the transaction. <br>
     4.3.1.2 Submission of Commission<br>
     After browsing and verifying the transaction information, you may submit your transaction commissions. Upon submission of such transaction commissions, it shall be deemed that you authorize this Platform to act as the broker for the corresponding transactions. This Platform will automatically complete the matchmaking operation when there is a transaction proposal that meets your price quotation, without prior notice to you.<br>
     4.3.1.3 Accessing transaction details<br>
     You can check the corresponding transaction records in the transaction statements of the Management Center and confirm your own detailed transaction records.<br>
     4.3.1.4 Revoking/modifying transaction commissions
     You have the right to revoke or modify your transaction commission at any time before the transaction is concluded.<br>
  V. Rights and Obligations of this Platform<br>
  •   5.1 If you are found ineligible for registration with this Platform as agreed on in this Agreement, this Platform shall have the right to refuse your registration application; if you have already registered, this Platform shall have the right to cancel your member account and reserves the right to hold you or your authorized agent accountable. Furthermore, this Platform reserves the right to decide whether to accept your registration application under any other circumstances.<br>
  •   5.2 When this Platform finds out that the user of an account is not the initial registrant of such account, it shall have the right to suspend or terminate the user’s access to such account.<br>
  •   5.3 Where this Platform has reasonable suspicion that the information you provide is wrong, untrue, invalid or incomplete by adopting various detection modes such as technical testing or manual sampling, this Platform shall have the right to notify you to correct or update the information or suspend or terminate its supply of the Services to you.<br>
  •   5.4 This Platform shall have the right to correct any information displayed on this Platform when it uncovers any obvious error in such information.<br>
  •   5.5 This Platform reserves the right to modify, suspend or terminate the Services provided by this Platform, at any time, and the right to modify or suspend the Services without prior notice to you; if this Platform terminates one or more of the Services provided by this Platform, such termination by this Platform will take effect on the date of announcement of such termination on the Platform. <br>
  •   5.6 This Platform shall take necessary technical means and management measures to ensure the normal operation of this Platform, and shall provide a necessary and reliable trading environment and transaction services, and shall maintain the order of digital asset transactions.<br>
  •   5.7 If you fail to log into this Platform using your member account number and password for an uninterrupted period of one year, this Platform shall have the right to cancel your account. After your account is canceled, this Platform shall have the right to make the member name represented by such account available to other users for membership registration.<br>
  •   5.8 This Platform shall ensure the security of your digital assets by increasing technical input and enhancing security precautions and is under the obligation to notify you in advance of the foreseeable security risks in your account.<br>
  •   5.9 This Platform shall have the right to delete all kinds of content and information which does not conform to laws and regulations or the rules of this Platform at any time, and exercise of this right by this Platform is not subject to a prior notice to you.<br>
  •   5.10 This Platform shall have the right to, in accordance with the applicable laws, regulations, rules, orders and other regulatory documents of the sovereign state or region where you are based, request to you for more information or data, and to take reasonable measures to meet the requirements of the local standards, and you have the obligation to provide proper assistance to such measures; this Platform shall have the right to suspend or permanently terminate your access to this Platform as well as part or all of the Services provided by this Platform in accordance with the applicable laws, regulations, rules, orders and other regulatory documents of the sovereign state or region where you are based.<br>
  VI. Indemnity <br>
  •   6.1 Under any circumstance, our liability for your direct damage will not exceed the total cost incurred by your three (3) months’ use of Services provided by this Platform.<br>
  •   6.2 If you breach this Agreement or any applicable law or regulation, you shall pay to us at least US$ 2 million in compensation and bear all the expenses in connection with such breach (including attorney’s fees, among others). If such compensation cannot cover the actual loss, you shall make up for the difference.<br>
  VII. The Right to Injunctive Relief<br>
  Both you and we acknowledge that common law remedies for breach of agreement or possible breach of agreement may be insufficient to cover all the losses that we sustain; therefore, in the event of a breach of agreement or a possible breach of agreement, the non-breaching party shall have the right to seek injunctive relief as well as all other remedies that are permitted under common law or equity. <br>
  VIII. Limitation and Exemption of Liability<br>
  •   8.1 You understand and agree that under no circumstance will we be held liable for any of the following events:<br>
  o   8.1.1 Loss of income; <br>
  o   8.1.2 Loss of transaction profits or contractual losses;<br>
  o   8.1.3 Disruption of the business;<br>
  o   8.1.4 Loss of expected currency savings;<br>
  o   8.1.5 Loss of information; <br>
  o   8.1.6 Loss of opportunity, damage to goodwill or reputation; <br>
  o   8.1.7 Damage or loss of data; <br>
  o   8.1.8 Cost of purchasing alternative products or services; <br>
  o   8.1.9 Any indirect, special or incidental loss or damage arising from any infringement (including negligence), breach of agreement or any other cause, regardless of whether or not such loss or damage may reasonably be foreseen by us, and regardless of whether or not we are notified in advance of the possibility of such loss or damage.<br>
  o   8.1.1 Items 8.1.1 to 8.1.9 are independent of each other.<br>
  •   8.2 You understand and agree that we shall not be held liable for any damages caused by any of the following events: <br>
  o   8.2.1 Where we are properly justified in believing that your specific transactions may involve any serious violation or breach of law or agreement; <br>
  o   8.2.2 Where we are properly justified in believing that your conduct on this Platform is suspected of being illegal or improper; <br>
  o   8.2.3 The expenses and losses arising from the purchase or acquisition of any data, information or transaction, etc. or any other actions through the Services provided by this Platform; <br>
  o   8.2.4 Your misunderstanding of the Services provided by this Platform; <br>
  o   8.2.5 Any other losses related to the Services provided by this Platform, which cannot be attributed to us. <br>
  •   8.3 Where we fail to provide the Services or delay in providing such Services due to information network equipment maintenance, information network connectivity failures, errors in computer, communications or other systems, power failures, weather conditions, unexpected accidents, strike actions, labor disputes, revolts, uprisings, riots, lack of productivity or production materials, fires, floods, storms, explosions, wars, failure on the part of banks or other partners, collapse of the digital asset market, act of government, judicial or administrative authorities, other acts that are not within our control or beyond our ability to control, or due to causes on the part of third parties, we shall not assume any responsibility for such failure to provide the Services or delay in providing such Services, or for the consequential loss you may sustain as a result of such failure or delay. <br>
  •   8.4 We cannot guarantee that all the information, programs, texts, etc. contained in this Platform are completely safe, free from the interference and destruction by any malicious programs such as viruses, trojans, etc., therefore, your log-into this Platform or access to any of the Services provided by this Platform, download of any program, information and data from this Platform and your use thereof are your personal decisions and you shall bear all the risks and possible losses arising therefrom. <br>
  •   8.5 We do not make any guarantees and commitments in connection with any of the information, products and business of any third-party websites linked to this Platform, as well as any other forms of content that do not belong to us; your access to any of the Services, information, and products provided by a third-party website is your personal decision and therefore you shall assume any and all the responsibilities arising therefrom. <br>
  •   8.6 We do not make any explicit or implicit warranties regarding your use of the Services provided by this Platform, including but not limited to the applicability, freedom from error or omission, consistency, accuracy, reliability, and suitability for a specific purpose, of the Services provided by this Platform. Furthermore, we do not make any commitments and guarantees regarding the validity, accuracy, correctness, reliability, quality, stability, integrity and timeliness of the technology and information covered by the Services provided by this Platform. Whether to log into this Platform or use the Services provided by this Platform is your personal decision and therefore you shall bear all the risks and possible losses arising therefrom. We do not make any explicit or implicit warranties regarding the market, value, price, etc. of digital assets; you understand and acknowledge that the digital asset market is unstable, that the price and value of assets may fluctuate sharply or collapse at any time, and that the transaction of digital assets is based on your own free will and personal decision and therefore you shall bear all the risks and possible losses arising therefrom. <br>
  •   8.7 The guarantees and commitments set forth in this Agreement shall be the only guarantees and statements that we make in relation to the Services provided by us under this Agreement and through this Platform, and shall supersede any and all the guarantees and commitments arising in any other means and methods, whether in writing or in words, express or implied. All these guarantees and statements represent only our own commitments and guarantees and do not guarantee any third party's compliance with the guarantees and commitments contained in this Agreement. <br>
  •   8.8 We do not waive any of the rights not mentioned in this Agreement and to the maximum extent permitted by the applicable law, to limit, exempt or offset our liability for damages. <br>
  •   8.9 Upon your registration of your account with this Platform, it shall be deemed that you approve any and all operations performed by us in accordance with the rules set forth in this Agreement, and any and all risks arising from such operations shall be assumed by you. <br>
  IX. Termination of this Agreementbr>
  •   9.1 This Platform shall have the right to cancel your account with this Platform in accordance with this Agreement, and this Agreement shall be terminated on the date of cancellation of your account. <br>
  •   9.2 This Platform shall have the right to terminate all the Services provided by this Platform in accordance with this Agreement, and this Agreement shall terminate on the date of termination of all the Services provided by this Platform. <br>
  •   9.3 After the termination of this Agreement, you do not have the right to require this Platform to continue to provide you with any service or perform any other obligation, including but not limited to, requesting this Platform to keep or disclose to you any information in your former account with this Platform, or to forward to you or any third party any information therein that is not read or sent.<br>
  •   9.4 The termination of this Agreement shall not prevent the observant party from demanding the breaching party to assume other liabilities. <br>
  X. Intellectual Property<br>
  •   10.1 All intellectual achievements included in this Platform, including but not limited to, website logos, databases, website design, text and graphics, software, photos, videos, music, sounds and any combination of the aforementioned files, and the intellectual property rights of software compilation, associated source code and software (including applets and scripts) shall be owned by this Platform. You may not reproduce, modify, copy, transmit or use any of the foregoing materials or content for commercial purposes.<br>
  •   10.2 All rights contained in the name of this Platform (including but not limited to business reputation, trademarks, and logos) shall be owned by the Company.<br>
  •   10.3 Upon accepting this Agreement, it shall be deemed that you, on the basis of your own free will, have transferred and assigned exclusively and free of charge to this Platform all copyright of any form of information that you publish on this Platform, including but not limited to reproduction rights, distribution rights, rental rights, exhibition rights, performance rights, public screening rights, broadcasting rights, information network dissemination rights, production rights, adaptation rights, translation rights, compilation rights and other transferable rights that copyright owners are entitled to, and this Platform has the right to file a lawsuit for any infringement on such copyright and obtain full compensation for such infringement. This Agreement shall apply to any content that is published by you on this Platform and is protected by copyright law, regardless of whether the content is generated before or after the signing of this Agreement.<br>
  •   10.4 You shall not illegally use or dispose of the intellectual property rights of this Platform or any other person during your use of the Services provided by this Platform. For any information that you publish on this Platform, you may not publish it on other websites (or media) or authorize other websites (or media) to use such information in any manner whatsoever. <br>
  •   10.5 Your log-into this Platform or access to any of the Services provided by this Platform shall not be seemed as our transfer of any intellectual property to you. <br>
  XI. Information Protection<br>
  •   11.1 Scope of Application <br>
  o   11.1.1 When you register your account with this Platform or use your account with this Platform, you shall provide personal registration information in accordance with the requirements of this Platform, including but not limited to your telephone number, email address, and identity documents. <br>
  o   11.1.2 When you use the Services provided by this Platform, or visit this Platform, this Platform will automatically receive and record the server information that you sent, including but not limited to the IP address, services and the webpage records you request to access. <br>
  o   11.1.3 The relevant data collected by this Platform in connection with your transactions on this Platform, including but not limited to transaction records. <br>
  o   11.1.4 Other personal information of yours legally obtained by this Platform. <br>
  •   11.2 Use of Information <br>
  o   11.2.1 Upon your successful registration with this Platform and without extra consent from you, it shall be deemed that you agree to permit this Platform to collect and use all the information you publish on this Platform, as is specified under 11.1 hereof, and you acknowledge and agree that this Platform can use your information collected by this Platform for certain purposes, including but not limited to the following:<br>
     11.2.1.1 Providing you with the Services provided by this Platform; <br>
     11.2.1.2 Reporting to relevant regulatory departments based on the requirements of the competent authorities in relevant sovereign states or regions; <br>
     11.2.1.3 When you use the Services provided by this Platform, this Platform will use your information for the purposes of authentication, customer service, security, fraud monitoring, archiving, and backup, so as to ensure the security of the products and Services that this Platform offers to you; <br>
     11.2.1.4 Helping this Platform design new products and services, improving the existing Services provided by this Platform; <br>
     11.2.1.5 In order to enable you to understand the specifics of the Services provided by this Platform, you agree to permit this Platform to send to your account marketing campaigns, commercial electronic messages, and targeted advertising that is related to you in replacement of general-purpose ubiquitous advertising; <br>
     11.2.1.6 This Platform may transfer or disclose your information to any third party that is not a related party of this Platform, for the purpose of completing merger, division, acquisition or transfer of assets; <br>
     11.2.1.7 Software certification or management software upgrade; <br>
     11.2.1.8 Inviting you to participate in surveys in connection with the Services provided by this Platform; <br>
     11.2.1.9 Data analysis relating to cooperation with government agencies, public affairs organizations, associations, etc.; <br>
     11.2.1.10 For all other legal purposes as well as other purposes authorized by you. <br>
  o   11.2.2 This Platform will not sell or lend your personal information to any other person unless your permission is obtained in advance. This Platform also does not allow any third party to collect, edit, sell or gratuitously spread your personal information in any manner whatsoever. <br>
  •   11.3 This Platform shall keep confidential the customer identity information and transaction information that it obtains, and shall not provide any entity or individual with customer identification information or transaction information, except where any of the applicable laws, regulations, decrees, orders, etc., of relevant sovereign states or regions requires this Platform to provide such information. <br>
  XII. All the transaction calculations are based on our verification, and all the calculation methods have been posted on the Platform; however, we cannot ensure that your use of this Platform will not be disturbed or free from errors.<br>
  XIII. Export Controls<br>
    You understand and acknowledge that in accordance with relevant laws of the Republic of Malta, you shall not export, re-export, import or transfer any material (including software) on this Platform; therefore, you hereby pledge that you will not voluntarily commit or assist or participate in any of the above export or transfer or other violations of applicable laws and regulations; if you uncover any of the aforementioned activities, you will report to us and provide assistance in handling them.<br>
  XIV. The rights and obligations set forth in this Agreement shall be equally binding on the assignees, the heirs, executors and administrators of the parties hereto who benefit from the rights and obligations. Without our consent, you may not transfer to any third party any of your rights or obligations hereunder; however, we may, at any time, assign our rights and obligations under this Agreement to any third party with thirty (30) days' notice to you. <br>
  XV. Severability<br>
    If any provision of this Agreement is found unenforceable, invalid or illegal by any court of competent jurisdiction, validity of the remaining provisions of this Agreement shall not be affected. <br>
  XVI. No Agency Relationship<br>
    Nothing contained in this Agreement shall be deemed as creating, implying or otherwise treating us as your agent, trustee or other representative, except as otherwise provided in this Agreement. <br>
  XVII. Waiver<br>
    Our or your waiver of the right to hold the other party accountable for breaches of agreement or any other liability as is agreed upon in this Agreement shall not be construed or deemed as a waiver of the right to hold the other party accountable for other breaches of contract; a failure to exercise any right or remedy shall not be construed in any way as a waiver of such right or remedy. <br>
  XVIII. Article Headings<br>
    All headings herein are exclusively for the convenience of wording and are not intended to expand or limit the content or scope of the Terms and Conditions of this Agreement. <br>
  XIX. Applicable Laws<br>
    This Agreement in its entirety is a contract concluded under the laws of the Republic of Malta, and its establishment, interpretation, content and enforcement shall be governed by the relevant laws of the Republic of Malta; any claims or actions arising out of or relating to the Services agreed in this Agreement shall be governed and interpreted and enforced in accordance with the laws of the Republic of Malta. For the avoidance of doubt, this clause shall be expressly applicable to any tort claim against us. The jurisdictional court or venue for any claim or action against us or in relation to us shall be in the Republic of Malta. You have unconditional access to exclusive jurisdiction in court proceedings and appeals in the court of the Republic of Malta. You also unconditionally agree that the venue or jurisdictional court for any dispute or problem relating to this Agreement or any claim and proceeding arising from this Agreement shall be exclusively in the Republic of Malta. The Doctrine of Forum Non Conveniens does not apply to the court of choice under these Terms and Conditions. <br>
  XX. Entry into Force and Interpretation of the Agreement <br>
  •   20.1 This Agreement shall enter into force when you click on the “I Agree” button on the registration page of this Platform, complete the registration procedures, and obtain your account number and password of this Platform, and shall be binding on both you and this Platform.<br>
  •   20.2 The final interpretation of this Agreement shall be vested in this Platform. <br>
  Know-Your-Customer and Anti-Money Laundering Policy<br>
  I. Preamble  <br>
  •   1.1 We pledge to prudently comply with know-your-customer and anti-money-laundering laws and regulations and will not knowingly violate the Know-Your-Customer and Anti-Money Laundering Policy. To the extent of our reasonable control, we will adopt necessary measures and technology to provide you with services that are safe and secure, so as to protect you against the loss caused by money laundering to the greatest extent possible. <br>
  •   1.2 Our Know-Your-Customer and Anti-Money Laundering Policy is a comprehensive system of international policies, including the know-your-customer and anti-money-laundering policies of the jurisdictions which you are subject to. Our robust compliance framework ensures that we meet regulatory requirements and regulatory standards at both the local and global levels, and ensure the operational sustainability of this Platform. <br>
  II. Content of Our Know-Your-Customer and Anti-Money-Laundering Policy <br>
  •   2.1 We promulgate and update the Know-Your-Customer and Anti-Money-Laundering Policy from time to time to meet the standards set by relevant laws and regulations;<br>
  •   2.2 We promulgate and update some of the guidelines and rules in connection with the operation of this Platform, and our staff will provide you with whole-process services in accordance with such guidelines and rules; <br>
  •   2.3 We design and complete the procedures for internal monitoring and transaction control, such as rigorous authentication procedures, and form a professional team responsible for anti-money laundering; <br>
  •   2.4 We adopt a risk-prevention-based approach to carry out due diligence and continuous supervision on our customers; <br>
  •   2.5 Review and regularly inspect existing transactions; <br>
  •   2.6 Report suspicious transactions to the competent authorities; <br>
  •   2.7 Proof documents of identity documents, address certificates and transaction records will be maintained for at least six (6) years; they may be submitted to the regulatory authorities without a separate notice to you; <br>
  •   2.8 Credit cards are prohibited throughout the course of the transaction; <br>
  III. Identity Information and the Verification and Confirmation Thereof <br>
  •   3.1 Identity Information <br>
  o   3.1.1 In accordance with the laws and regulations of relevant jurisdictions and in light of the nature of entities concerned, the content of your information to be collected by us may vary, and in principle, we will collect the following information of yours if you register as an individual: <br>
  o   Basic personal information: your name, address (and permanent address, if the two are different), date of birth and nationality, and other information available. Identity authentication shall be based on documents issued by the government or other similar authorities, such as passports, identity cards or other identity documents as are required and issued by relevant jurisdictions. The address you provide will be validated in an appropriate manner, such as checking the fare ticket of means of transportation you use, your interest rate bills, or voter register.<br>
  o   Valid photo: before you register, you must provide a photograph showing you holding your identity document in front of your chest; <br>
  o   Contact information: telephone/mobile phone number and valid email address.<br>
  o   3.1.2 If you are a company or any other type of legal entity, we will collect the following information of yours to determine the ultimate beneficiary of your account or your trust account. <br>
  o   Your incorporation and registration certificates of the company; a copy of the articles of association and memorandum of the company; the detailed certification materials of the ownership structure and ownership description of the company, and the resolution of the board of directors on designating the authorized agent of the company responsible for the opening and execution of the account of the company with this Platform; the identity documents of the directors, major shareholders of the company as well as the authorized signatory for the company’s account with this Platform, as are required to be provided in accordance with relevant rules; the company’s principal business address, and the company’s mailing address if it is different from the principal business address of the company. If the local address of the company is different from its principal business address, the company shall be deemed to be a high-risk customer, and consequently the company will be required to provide additional documentation. <br>
  o   • Other certification documents, documents issued by competent authorities and other documents we may deem necessary in light of the laws and regulations of relevant jurisdictions and in light of the specific nature of your entity.<br>
  o   3.1.3 We only accept English and Chinese versions of your identity information; if your identity information is not in either of the two languages, you shall have your identity information translated into English and duly notarized. <br>
  •   3.2 Confirmation and Verification <br>
  o   3.2.1 You are required to provide all the pages of your identity documents. <br>
  o   3.2.2 You are required to provide us with a photograph showing you holding your identity documents in front of your chest. <br>
  o   3.2.3 Copies of certification documents shall be checked against the originals thereof. Nonetheless, if a trusted and suitable certifier can prove that such copies are true, accurate and comprehensive duplicates of the originals thereof, such copies shall be deemed as acceptable. Such certifiers include ambassadors, members of the judiciary, magistrates, etc. <br>
  o   3.2.4 The identification the ultimate beneficiary and controller of the account shall be based on the determination of which individuals ultimately own or control the direct customer and/or the determination of whether the ongoing transaction is performed by another person. If you are a business enterprise, the identity of major shareholders thereof (for example, those holding 10% or more of the voting equity in such business enterprise) shall be verified. Generally, a shareholder holding 25% of the shares of the company will be deemed as involving an average level of risk, and the identity of the shareholder shall be verified; a shareholder holding 10% or more of the voting rights or shares is deemed to be involving a high level of risk, and the identity of the shareholder shall be verified.<br>
  IV. Transaction Supervision <br>
  •   4.1 We constantly set and adjust daily trading and cash withdrawal limits based on security requirement and actual state of transactions; <br>
  •   4.2 If the transaction occurs frequently in an account registered by you or is beyond reasonable circumstances, our professional team will assess and determine whether such transaction is suspicious; <br>
  •   4.3 If we identify a specific transaction as suspicious on the basis of our judgement, we may adopt such restrictive measures as suspending the transaction or denying the transaction, and if it is possible, we may even reverse the transaction as soon as possible, and report to the competent authorities, without, however, notifying you; <br>
  •   4.4 We reserve the right to reject registration applications by applicants that do not comply with the international standards of anti-money laundering or who may be regarded as political and public figures; we reserve the right to suspend or terminate a transaction identified as suspicious based on our own judgement, which, however, does not breach any of our obligations and duties to you.</p>
        `,
        },
        ja: {
            title: ``,
            agreementFirst: `
        <p>幣加所(ピカソ)（www.picaex.com）とはPicasso Blockchain Technology（Malta）Limited(以下は公司と略称する)傘下の一つのユーザーに仮想通貨資産を取引する関連サービス(以下"本サービス”もしくは"サービス”と称する)を提供するプラットフォームである。本協議表現上の便利のため、会社及び本サイトが本協議で我々と合弁して述べる。本サイトにアクセス自然人或いはその他の主体が全て本サイトのユーザーであり、便利のため、以下はあなたもしくはその他の第二人称を使用する。本協議表現の便利のため、我々とあなたが本協議では"双方”と称することとする、我々もしくはあなた単独で"一方”と称する。<br>
  重要な注意喚起： <br>
  •   1 仮想通貨資産は如何なるの金融機関、会社、本サイトより発行するではありません； <br>
  •   2 仮想通貨資産は新しく、確認されずの、かつ増加しない可能性もある； <br>
  •   3 仮想通貨資産は主に投機家に多く使われ、小売業及び商業市場での使用は比較的に少ない、仮想通貨資産の取引には、高いリスクが存在します、その一日中絶えずの取引、上がり、下がりに制限がなく、胴元に影響され易い、世界政府政策の影響で大幅に変動する；<br>
  •   4 各国の法律、法規及び規範性の文書の制定もしくは改正により、仮想通貨資産の取引はいつでも停止もしくは禁止される可能性がある。 <br>
  仮想通貨資産取引にはかなり高いリスクがあり、大多数の人に適合しない。あなたがこの投資により、一部或いは全部損失する可能性があることがあり、あなたが損失の許容範囲内で投資金額を決めるべき、仮想通貨資産の投資のリスクを理解した上で了承し、もし質問、疑問がある場合、投資顧問の協力を求めることをおすすめします。また、上述したリスク以外にも、予測不可能のリスクも存在する。慎重に考慮した上で、清楚な判断力で自分の財政状況及び各項のリスクを評価してから、仮想通貨資産の売買を決定してください、かつこれによって発生する如何なる損失も自分でご負担下さい。我々は如何なる責任も負いかねます。<br>
  丁重に告知します： <br>
  •   1 あなたは本サイトがただあなたの仮想通貨資産の情報の取得、取引相手の探す、仮想通貨資産の取引を協議及び取引を行う場であることを了承し、本サイトはあなたの如何なる取引にも参加しません、故にご自分で慎重に関連の仮想通貨資産及び/或いは情報の真実性、合法性及び有効性を判断ししてください。及び発生した損失もご自分で負担してください。<br>
  •   2 本サイトの如何なる意見、情報、討論、分析、価格、アドバイス及びその他のインフォメーションは全て一般的な市場評論であり、アドバイスではありません。我々は情報の依頼による発生した如何なる直接的な、間接的な損失を含むが、それに限らない、に対しても責任を負いかねます。<br>
  •   3 本サイトの内容は通知せずに随時変更するので、サイトインフォメーションの正確性を保障するために、我々は合理的な保護措置を行うが、程度の保証は出来ません，かつ、如何なるの本サイト上のインフォメーション或いは、インターネットに未接続により、発送、受信の遅延、失敗で発生した損失に対しても責任を負いかねます。<br>
  •   4 インターネット形式の取引システムを使用するにも、一定のリスクがあります、ソフトウェアを含むがそれに限らない、ハードウェア及びインターネットの接続の失敗等。我々もインターネットの可用性及び頼れるかどうかをコントロールができないため、我々は非真実、遅延及び接続失敗に対しても如何なる責任も負いかねます。<br>
  •   5 <a href="https://www.picaex.com/" target="_blank">https://www.picaex.com/</a> は当アプリ唯一の対外的な情報を開示するルートである；<br>
  •   6 当アプリが提供する如何なるサービスの全ての支払いについては如何なるのクレジットカードでも使用出来ません；<br>
  •   7 当アプリを使用してマネーウォシュリング、密輸、商業的賄賂等の非合法な行為を従事することを禁止します、発覚した場合は本アプルは全ての使用可能な手段を使用し、アカウントの凍結、関連する権力機関への通報等を含むがそれを限らない。我々はそれによって発生した一切の法的責任を負いかねます。かつ関連責任者に対して責任を追求する権利を有する。<br>
  一、総則 <br>
  •   1.1 『ユーザー協議』(以下‘本協議’若しくは‘本約款’と称する)、は本文、『プライバシー条文』、『あなたの顧客及び反マネーウォシュリング政策』及び本アプリが発表した或いは将来で発表可能の各種規則、声明、説明等で構成される。<br>
  •   1.2 あなたが本アプリが提供する各種のサービスを使用する前に、本協議をちゃんと読んで下さい、もし理解の出来ない箇所若しくはその他の必要があれば、専門の弁護士にお問い合わせ下さい。あなたが一旦当アプリを登録し、本アプリが提供する如何なるサービスを使用し若しくは類似する行為があれば、即ちあなたが本協議の各項の内容を理解して、同意したことと見なす、当アプリが本協議に対して随時変更することも含む。<br>
  •   1.3 あなたが当アプリの要求通りに関連情報を入力することを通して、かつその他の関連のアプリ経由して成功に登録すれば、当アプリの会員になることが可能です。(以下‘会員’と称する)、登録の過程中に‘同意する’をクリックと、デジタル形式で当社と合意する形になります；或いはあなたが当アプリを閲覧する過程中にいかなるの‘同意する’或いは類似意志のをクリックすると、あなたが既に本協議項目下の全ての条文及び約束を同意することとなる。あなたの手書きのサインがなくても、本協議のあなたに対しての法律上の効果に影響しません。<br>
  •   1.4 あなたは当アプリの会員になった後、一つの会員IDとそれに対応するパスワードを与えられ、このIDとパスワードは会員が責任を持って管理することとなる；会員はあなたのアカウントIDで行う全ての行為に対して法的責任を負わなければ、ならない。<br>
  •   1.5 本アプリの会員になることのみが本アプリが提供する仮想通貨取引プラットフォームで取引を行うことが可能、及び当アプリが提供する他のサービスを利用することが可能となる；非会員はサイトの閲覧、及び規定内のサービスのみ利用可能。<br>
  •   1.6 当アプリが提供する如何なる機能或いはサービスを登録或いは利用することが、<br>
  o   1.6.1 本協議全ての条文及び約束条件を受け入れる。<br>
  o   1.6.2 あなたが16歳以上であること若しくは異なる適用可能な法的契約出来る年齢に達したこと、かつ条文を受け入れるには十分な能力があることを確認してください。 <br>
  o   1.6.3 あなたは取引に関わるあなたに属する仮想通貨資産の全ては合法所有であることを保証します。 <br>
  o   1.6.4 あなたがあなた自身の取引行為或いは非取引行為に対しての如何なる収益及び損失を自分でふたんする。 <br>
  o   1.6.5 あなたの登録時に提供した情報は正確であること。 <br>
  o   1.6.6 あなたは如何なる法律の規定を守ることに同意する、税務上の目的に言えば、如何なる取引の利益も申告することを含む。 <br>
  o   1.6.7 本協議はただあなたと我々の間で達成する権利と義務の関係の約束であり、本アプリユーザーとその他のアプリ、サイト、とあなたの間で取引によるトラブルに及ばないものとする。 <br>
  二、協議の改訂 <br>
    我々は不定期に本協議を改訂する権利を保留し、アプリ公示の形式で告知を行い、あなたに単独での告知を行いません、変更後の協議は本協議のトップページにで変更時間を表記します、一旦アプリで発表をすれば、自動的に発効します。あなたは常に本協議の更新時間及び内容を注目すべき、もし関連の変更に不同意が存在すれば、直ちに本アプルの提供するサービスの利用を停止し無ければ、なりません；継続的に利用する場合は、あなたが修訂した協議に同意すると見なす。 <br>
  三、登録 <br>
  •   3.1 登録資格 <br>
  •   あなたが確認した上で承諾する：あなたが登録プログラム	或いはその他の当アプリの規定する方式で実際に当アプリの提供するサービス利用する際、あなたが法律に適用する本協議を同意署名にあたり、資格を有する個人若しくは法人或いはその他の組織であり。あなたが一旦同意をクリックすると、あなた自身が或いはあなたの代理人が既にこの協議内容を同意し、その代理で、当アプリのサービスを利用する。もしあなたが主体としての資格が無ければ、あなたとあなたの代理人がこれによる一切の悪い結果も自ら負担しなければ、なりません。かつ、会社があなたのアカウントを取り消し、若しくは永久に凍結する権利、かつあなた及びあなたの代理人に対して責任を追求する権利を保有する。 <br>
  •   3.2 登録の目的 <br>
  •   あなたが確認し承諾する：あなたの本アプリ登録は法律、法規の違反或いは当アプリの仮想通貨資産の取引秩序の破壊を目的とする行為ではない。 <br>
  •   3.3 登録の流れ <br>
  o   3.3.1 あなたは当アプリのユーザー登録ページの要求通りに有効なメールアドレス、携帯番号等の情報を提供することに同意しあなたがあなたの提供した若しくは確認されたメールアドレス、携帯番号或いは当アプリの許可するその他の手段を使い、当アプリに登録することが可能である。必要があれば、異なる法域の関連の法律法規の規定により、あなたの実名、身分証明証明等の法律、法規及びプライバシー保護条例及び反マネーウォシュリングの規定により登録情報の更新をする必要があります、適時、詳細、正確の要求に符合する。あなたは情報の真実性、完整性及び正確性に対して責任を持ちかつ、これらによる如何なる直接的な、間接的な損失及び不利結果を負担しなければ、なりません。 <br>
  o   3.3.2 もしあなたの所在の主権国家、地域の法律、法規、条例等の規範が携帯番号に対して、実名を要求するであれば、あなたの提供する登録の携帯番号は実名登記されたものであることをどういする。もしあなたは規定取りに提供をしない場合、これによってあなたにもたらす如何なる直接的な損失も、間接的な損失も、あなた自身の負担となります。 <br>
  o   3.3.3 あなたは合法な、完整なかつ有効の登録に必要な情報を提供しかつ認証を通れば、当アプリのアカウント及びパスワードを獲得する権利があたえられる、当アプリのアカウント及びパスワードを得ることが登録成功とみなし、当アプリにログインすることができる。 <br>
  o   3.3.4 あなたは当アプリが送信する管理、運営関連のメール若しくはメッセージの受信を許可する。 <br>
  四、サービス <br>
  本平台只为您通过本平台进行数字资产交易活动（包括但不限于数字资产交易等服务）提供网络交易平台服务，本平台并不作为买家或卖家参与买卖数字资产行为本身；本平台不提供任何国家法定货币充入和提取的相关服务。 当アプリはあなたに当アプリを通して仮想通貨資産の取引活動(仮想通貨資産の取引サービスを含むがそれに限らない)に対してネット上の取引プラットフォームサービスを提供し、当アプリはバイア或いはセーラー本体として仮想通貨資産の取引に参加することはありません；当アプリは如何なる国家の法律上の通貨のチャージ或いは引出しに関連するサービスを提供しません。<br>
  •   4.1 サービス内容 <br>
  o   4.1.1 あなたは当アプリで仮想通貨資産各項商品のタイムリーの相場及び取引情報を閲覧する権利があり、かつ当アプリの提供する取引コマンドを使用して、仮想通貨資産の取引を完了する権利がある。 <br>
  o   4.1.2 あなたは当アプリでその当アプリメンバーズアカウント下の情報を閲覧する権利があり、本アプリの提供する機能で操作を行う権利があります。 <br>
  o   4.1.3 あなたは当アプリが発表した活動規則に基づいた、当アプリの主催する活動等に参加する権利があります。 <br>
  o   4.1.4 当アプリが承諾した提供するその他のサービス。 <br>
  •   4.2. サービス規則 <br>
  あなたは下記の本アプリのサービス規則を守ることを承諾する：<br>
  o   4.2.1 あなたは法律法規、規定及び政策要求の規定を順守しなければなりません。アカウントの全ての仮想通貨資産の来源の合法性を保証し、当アプリで或いは当アプリを利用して、非合法な活動及び第三者の権益を損なうような活動を行ってはなりません。例えば、ネズミ講の材料を送信若しくは受信することやその他の危害のある言論或いは情報等を送受信すること、当アプリの授権を得ずに当アプリのメールタイトルの使用若しくは偽造すること等。<br>
  o   4.2.2 あなたは法律法規を順守し、かつ適切に当アプリのアカウント及びログインパスワード、資金パスワード、登録時に入力した携帯番号、及び携帯の受信した確認コードの安全性を使用し、及び管理すべき。あなたはその当アプリのアカウント及びログインパスワード、資金パスワード及び携帯確認コードでの全ての操作にたいして、全ての責任を負担しなければなりません。あなたが本アプリのアカウント、ログインパスワード、或いは資金パスワード、確認コードが授権を受けずに第三者に使われた、或いはその他のアカウント安全性の問題を気付いたら直ちに当アプリに連絡して、アカウントの一時停止を届出下さい。当アプリは合理のタイミングであなたの届出に対して如何なる措置をとる権利があり、但し当アプリが措置を取る前に既に被害(あなたの如何なる損失を含むが、それに限らない)が発生した場合は責任を負いかねます。あなたは当アプリの同意を得ずに当アプリのアカウントを贈与、借用、賃貸、転売等の方式で他人に処分してはいけません。 <br>
  o   4.2.3 あなたはあなたがあなたの当アプリいおいてのアカウント、パスワード下に発生した全ての活動(情報の漏洩、情報の発表、ネット上で契約若しくはサービスの購入等に同意をクリックすることを含むがそれにかがらない）責任を負担しなければなりません。 <br>
  o   4.2.4 あなたは当アプリ上で仮想通貨資産の取引時に仮想通貨資産の正常進行を悪意干渉してはいけません、取引の秩序を破壊しては行けません；如何なる技術手段或いはその他の方式で当アプリの正常運行及び他のユーザーの当アプリの使用を干渉しては行けません；捏造の事実等ほ方式で当アプリを悪意誹謗するような行為をしては行けません。 <br>
  o   4.2.5 もしあなたは取引の原因で、たのユーザーとの間で紛糾があった場合は、司法と行政以外のルートで当アプリに対して関連情報の提供をしては行けません。 <br>
  o   4.2.6 あなたが当アプリを使用する過程中に、発生した納税義務、及び一切のハードウェア、ソフトウェア、サーバー及びその他の費用は全てあなたの個人負担となります。 <br>
  o   4.2.7 あなたは当アプリが不定時に発表及び更新する新しい本協議及びその他のサービス条文、操作規則を順守しなければなりません、随時当アプリの使用を中止する権利を有する。 <br>
  •   4.3 製品規則 <br>
  o   4.3.1 コイン、コイン取引の製品規則 <br>
  あなたが当アプリを使用し、当アプリを通じて他のユーザーとコインコインの取引するにおいては下記の取引規則をちゃんと守ることを承諾する。 <br>
     4.3.1.1 取引情報の閲覧 <br>
     あなたが当アプリでコインコイン取引情報の閲覧時に、取引情報に含まれた全ての内容をちゃんと読むべき、価格、委託量、手数料、買い入れ、売り出しの傾向等を含むがそれらに限らない、あなたが取引情報に含まれた全ての内容を受け入れたら、取引を行うべき。<br>
     4.3.1.2 委託の提出 <br>
     取引情報を閲覧し、間違いがないことを確認した後、あなたが取引委託の提出が可能となる。取引委託の提出は、即ちあなたが当アプリに取引を結びつけることを授権する。当アプリはあなたの条件を全て満足する結びつきが現れるとあなたに別途通知せずに自動的に取引を完了させる。 <br>
     4.3.1.3 取引明細の確認 <br>
     あなたは管理センターの取引明細であなたの成約記録を確認することができる、自分の詳細な取引記録を確認する。 <br>
     4.3.1.4 委託の撤回/変更、成約になる前に、あなたが随時委託を撤回若しくは変更することができるとする。 <br>
  五、当アプリの権利と義務 <br>
  •   5.1 もしあなたが本協議で定めた登録資格を有して無ければ、当アプリはあなたの登録を拒絶する権利があるとする、登録済みのに対して、当アプリはあなたのメンバーズアカウントを削除することができるとす、当アプリはあなた或いはあなたの代理人に責任を追求する権利を保留する。同時に、当アプリはその他の如何なる状況下であなたの登録を認めるか否かを決定権利を保留する。 <br>
  •   5.2 当アプリがアカウントの使用者はアカウントの初期登録者ではないことを発覚した場合は、このアカウントを停止或いは中止する権利を有する。 <br>
  •   5.3 当アプリは技術的な検査測定を通して、人工的抜き取り検査等の方式で合理的にあなたの提供した情報が明らかの間違い、非実、失効、不完整の存在が発覚した場合はあなたに変更、補完するよう通知し、或いは当アプリの一項目若しくは多項目のサービスの提供を中止する権利があります。中止は当アプリが通知の発表する日より有効とします。 <br>
  •   5.4 当アプリは当アプリ上の表示した如何なる情報に明らかの間違いの存在を発覚した場合は、その情報に対しての訂正を可能とする。 <br>
  •   5.5 当アプリは随時当アプリの提供するサービスを中止することが可能とする、当アプリがサービスの中止若しくは変更する権利を通知せずに行使することができるとする；当アプリの一項目或いは多項目サービスの中止はアプリ上で発表する日より有効とする。 <br>
  •   5.6 当アプリは当アプリの正常な運行を保障するために必要な技術的な手段及び管理措置を実行すべく、かつ必要な、信頼可能な取引環境及び頼れる取引サービスを提供し、仮想通貨資産の取引秩序を守る。 <br>
  •   5.7 もしあなたがメンバーズアカウント及びパスワードを使用し、当アプリに未ログインが一年間以上続いた場合は、当アプリはそのアカウントをキャンセルすることができるとし、キャンセルされたアカウントは再度他人に対して登録を開放することができるとする。 <br>
  •   5.8 当アプリは技術的な投入の強化をして、セキュリティ措置の向上をする等であなたの資産の安全性を保障し、予見可能なリスクの出現する前にあなたに通知する義務がある。 <br>
  •   5.9 当アプリは随時各項法律法規、当アプリの規定にふさわしくない内容を通知せずに削除することができるとする。 <br>
  •   5.10 当アプリはあなたの所属する主権国家或いは地域の法律法規、規則、命令等規範の要求によりあなたに更なる情報或いは資料の請求ができるとし、かつ合理的な措置を取引、当地の規範の要求に合わせる、あなたにはそれに合わせる義務を有するものとする；当アプリはあなたの所属する主権国家或いは地域の法律法規、規則、命令等の規範の要求により、一時若しくは永久にあなたに対しての一部或いは全部のサービスを停止する権利を有するものとする。 <br>
  六、賠償 <br>
  •   6.1 如何なる状況においても、我々のあなたに対しての直接的な損害の賠償はあなたの当アプリを使用する三ヶ月の費用の合計を超えないものとする。<br>
  •   6.2 もしあなたは本協議若しくはその他の法律法規を違反するような行為があった場合、あなたは我々に対して200万米ドル以上を賠償し、かつそれによって発生した全ての費用(弁護士費用を含む）、損失を補うに不十分のな場合は、あなたが補填するものとする。 <br>
  七、禁令救済を求める権利 <br>
  我々とあなたが違約若しくは違約可能な状況に対しての救済措置は我々の全部の損失を補うには不十分であることを認める、よって非違約側は違約若しくは違約可能の状況で禁令救済及び普通の方法或いはバランス法の許可したその他の全ての救済措置を求めることが可能とする。 <br>
  八、責任制限と免責 <br>
  •   8.1 あなたは了解して同意した場合は、如何なる状況においても、我々下記各項に対しての責任を負わないものとする： <br>
  o   8.1.1 収入の損失； <br>
  o   8.1.2 取引利益或いは契約損失； <br>
  o   8.1.3 業務の中断； <br>
  o   8.1.4 省ける予想できる貨幣の損失； <br>
  o   8.1.5 情報の損失； <br>
  o   8.1.6 機会、商誉或いは名誉の損失； <br>
  o   8.1.7 データーの破損或いは損失； <br>
  o   8.1.8 代替製品或いはサービスを購入するコスト；<br>
  o   8.1.9 如何なる侵害(過失を含む）による、違約或いはその他の原因で発生し　　　　た間接的な、特殊的な或いは付加性のある損失或いは損害、この損失或いは損害は我々が予見できるどうか；我々は事前にこのような損失或いは損害の可能性があることを告知されたかどうかを問わない。<br>
  o   8.1.1-8.1.9条はそれぞれ独立である。<br>
  •   8.2 あなたは了解した上で同意する、我々は下記の任意の状況があなたに損失をもたらしても責任を負わないものとする： <br>
  o   8.2.1 我々はあなたの具体的の取引事項に重大な違法或いは違約状況が存在する可能性があると疑うには十分な理由があった場合。 <br>
  o   8.2.2 我々はあなたが当アプリで違法或いは不当な行為を疑うには十分な理由があった場合。 <br>
  o   8.2.3 通过本平台服务购买或获取任何数据、信息或进行交易等行为或替代行为产生的费用及损失。 <br>
  o   8.2.4 您对本平台服务的误解。 <br>
  o   8.2.5 任何非因我们的原因而引起的与本平台提供的服务有关的其它损失。 <br>
  •   8.3 我们对由于信息网络设备维护、信息网络连接故障、电脑、通讯或其他系统的故障、电力故障、天气原因、意外事故、罢工、劳动争议、暴乱、起义、骚乱、生产力或生产资料不足、火灾、洪水、风暴、爆炸、战争、银行或其他合作方原因、数字资产市场崩溃、政府行为、 司法或行政机关的命令、其他不在我们可控范围内或我们无能力控制的行为或第三方的原因而造成的不能服务或延迟服务，以及造成的您的损失，我们不承担任何责任。 <br>
  •   8.4 我们不能保证本平台包含的全部信息、程序、文本等完全安全，不受任何病毒、木马等恶意程序的干扰和破坏，故您登陆、使用本平台任何服务或下载及使用该下载的任何程序、信息、数据等均是您个人的决定并自行承担风险及可能产生的损失。 <br>
  •   8.5 我们对本平台中链接的任何第三方网站的任何信息、产品及业务及其他任何形式的不属于我们的主体的内容等不做任何保证和承诺，您如果使用第三方网站提供的任何服务、信息及产品等均为您个人决定且承担由此产生的一切责任。 <br>
  •   8.6 我们对于您使用本平台服务不做任何明示或暗示的保证，包括但不限于本平台提供服务的适用性、没有错误或疏漏、持续性、准确性、可靠性、适用于某一特定用途。同时，我们也不对本平台提供的服务所涉及的技术及信息的有效性、准确性、正确性、可靠性、质量、稳定、完整和及时性作出任何承诺和保证。是否登陆或使用本平台提供的服务是您个人的决定且自行承担风险及可能产生的损失。我们对于数字资产的市场、价值及价格等不做任何明示或暗示的保证，您理解并了解数字资产市场是不稳定的，价格和价值随时会大幅波动或崩盘，交易数字资产是您个人的自由选择及决定且自行承担风险及可能产生的损失。 <br>
  •   8.7 本协议中规定的我们的保证和承诺是由我们就本协议和本平台提供的服务的唯一保证和陈述，并取代任何其他途径和方式产生的保证和承诺，无论是书面的或口头的，明示的或暗示的。所有这些保证和陈述仅仅代表我们自身的承诺和保证，并不保证任何第三方遵守本协议中的保证和承诺。 <br>
  •   8.8 我们并不放弃本协议中未提及的在法律适用的最大范围内我们享有的限制、免除或抵销我们损害赔偿责任的任何权利。 <br>
  •   8.9 您注册后即表示认可我们按照本协议中规定的规则进行的任何操作，产生的任何风险均由您承担。 <br>
  九、协议的终止 <br>
  •   9.1 本平台有权依据本协议约定注销您的本平台账号，本协议于账号注销之日终止。 <br>
  •   9.2 本平台有权依据本协议约定终止全部本平台服务，本协议于本平台全部服务终止之日终止。 <br>
  •   9.3 本协议终止后，您无权要求本平台继续向其提供任何服务或履行任何其他义务，包括但不限于要求本平台为您保留或向您披露其原本平台账号中的任何信息， 向您或第三方转发任何其未曾阅读或发送过的信息等。 <br>
  •   9.4 本协议的终止不影响守约方向违约方要求其他责任的承担。 <br>
  十、知识产权 <br>
  •   10.1 本平台所包含的全部智力成果包括但不限于网站标志、数据库、网站设计、文字和图表、软件、照片、录像、音乐、声音及其前述组合，软件编译、相关源代码和软件 (包括小应用程序和脚本) 的知识产权权利均归本平台所有。您不得为商业目的复制、更改、拷贝、发送或使用前述任何材料或内容。 <br>
  •   10.2 本平台名称中包含的所有权利 (包括但不限于商誉和商标、标志) 均归公司所有。 <br>
  •   10.3 您接受本协议即视为您主动将其在本平台发表的任何形式的信息的著作权， 包括但不限于：复制权、发行权、出租权、展览权、表演权、放映权、广播权、信息网络传播权、摄制权、改编权、翻译权、汇编权 以及应当由著作权人享有的其他可转让权利无偿独家转让给本平台所有，本平台有权利就任何主体侵权单独提起诉讼并获得全部赔偿。 本协议效力及于您在本平台发布的任何受著作权法保护的作品内容， 无论该内容形成于本协议签订前还是本协议签订后。 <br>
  •   10.4 您在使用本平台服务过程中不得非法使用或处分本平台或他人的知识产权权利。您不得将已发表于本平台的信息以任何形式发布或授权其它网站（及媒体）使用。 <br>
  •   10.5 您登陆本平台或使用本平台提供的任何服务均不视为我们向您转让任何知识产权。 <br>
  十一、信息保护 <br>
  •   11.1 适用范围 <br>
  o   11.1.1 在您注册网站账号或者使用账户时，您根据本平台要求提供的个人注册信息，包括但不限于电话号码、邮箱信息、身份证件信息。 <br>
  o   11.1.2 在您使用本平台服务时，或访问本平台网页时，本平台自动接收并记录的您浏览器上的服务器数值，包括但不限于IP地址等数据及您要求取用的网页记录。 <br>
  o   11.1.3 本平台收集到的您在本平台进行交易的有关数据，包括但不限于交易记录。 <br>
  o   11.1.4本平台通过合法途径取得的其他您个人信息。 <br>
  •   11.2 信息使用 <br>
  o   11.2.1 不需要您额外的同意，您在本平台注册成功即视为您同意本平台收集并使用其在本平台的各类信息，如11.1条所列，您了解并同意，本平台可以将收集的您信息用作包括但不限于下列用途： <br>
     11.2.1.1 向您提供本平台服务； <br>
     11.2.1.2 基于主权国家或地区相关主管部门的要求向相关部门进行报告； <br>
     11.2.1.3 在您使用本平台服务时，本平台将您的信息用于身份验证、客户服务、安全防范、诈骗监测、存档和备份用途，确保本平台向您提供的产品和服务的安全性； <br>
     11.2.1.4 帮助本平台设计新产品及服务，改善本平台现有服务； <br>
     11.2.1.5为了使您解本平台服务的具体情况，您同意本平台向其发送营销活动通知、商业性电子信息以及提供与您相关的广告以替代普遍投放的广告； <br>
     11.2.1.6 本平台为完成合并、分立、收购或资产转让而将您的信息转移或披露给任何非关联的第三方； <br>
     11.2.1.7 软件认证或管理软件升级； <br>
     11.2.1.8 邀请您参与有关本平台服务的调查； <br>
     11.2.1.9 用于和政府机关、公共事务机构、协会等合作的数据分析； <br>
     11.2.1.10 用作其他一切合法目的以及经您授权的其他用途。 <br>
  o   11.2.2 本平台不会向其他任何人出售或出借您的个人信息，除非事先得到您的许可。本平台也不允许任何第三方以任何手段收集、编辑、出售或者无偿传播您的个人信息。 <br>
  •   11.3 本平台对所获得的客户身份资料和交易信息等进行保密，不得向任何单位和个人提供客户身份资料和交易信息，应相关主权国家或地区法律法规、政令、命令等规定要求本平台提供的除外。 <br>
  十二、计算所有的交易计算结果都经过我们的核实，所有的计算方法都已经在网站上公示，但是我们不能保证网站的使用不会受到干扰或没有误差。 <br>
  十三、出口控制您理解并承认，根据马耳他共和国相关法律，您不得将本平台上的任何材料（包括软件）出口、再出口、进口或转移，故您保证不会主动实施或协助或参与任何上述违反法规的出口或有关转移或其他违反适用的法律和法规的行为；如发现此类情形，会向我们积极报告并协助我们处理。 <br>
  十四、转让本协议中约定的权利及义务同样约束从该权利义务中获取到利益的各方的受让人，继承人，遗嘱执行人和管理员。您不得在我们不同意的前提下转让给任何第三人，但我们可随时将我们在本协议中的权利和义务转让给任何第三人，并给予您提前30天的通知。 <br>
  十五、可分割性如本协议中的任何条款被任何有管辖权的法院认定为不可执行的，无效的或非法的，并不影响本协议的其余条款的效力。 <br>
  十六、非代理关系本协议中的任何规定均不可被认为创造了、暗示了或以其他方式将我们视为您的代理人、受托人或其他代表人，本协议有其他规定的除外。 <br>
  十七、弃权我们或您任何一方对追究本协议约定的违约责任或其他责任的弃权并不能认定或解释为对其他违约责任的弃权；未行使任何权利或救济不得以任何方式被解释为对该等权利或救济的放弃。 <br>
  十八、标题所有标题仅供协议表述方便，并不用于扩大或限制该协议条款的内容或范围。 <br>
  十九、适用法律本协议全部内容均为根据马耳他共和国法律订立的合同，其成立、解释、内容及执行均适用马耳他共和国相关法律规定；任何因或与本协议约定的服务有关而产生的索赔或诉讼，都应依照马耳他共和国的法律进行管辖并加以解释和执行。为避免疑义，这一条款明确适用于任何针对我们的侵权索赔。任何针对我们或者是和我们有关的索赔或诉讼的管辖法院或诉讼地均在马耳他共和国。您无条件地获得在马耳他共和国法院进行诉讼和上诉的排他性的管辖权。您也无条件地同意与本协议款有关的争议或问题或产生的任何索赔请求和诉讼的发生地或法院均排他性得在马耳他共和国。不方便法院的原则不适用于根据本服务条款的选择的法院。 <br>
  二十、协议的生效和解释 <br>
  •   20.1 本协议于您点击本平台注册页面的同意注册并完成注册程序、获得本平台账号和密码时生效，对本平台和您均具有约束力。 <br>
  •   20.2 本协议的最终解释权归本平台所有。 <br>
  了解你的客户和反洗钱政策 <br>
  一、导言 <br>
  •   1.1我们保证审慎遵守“了解你的客户”和反洗钱相关的法律法规且不得故意违反该《了解你的客户和反洗钱政策》。在我们合理控制的范围内我们将采取必要的措施和技术为您提供安全的服务，尽可能使您免于遭受犯罪嫌疑人的洗钱行为带来的损失。 <br>
  •   1.2我们的了解你的客户和反洗钱政策是一个综合性的国际政策体系，包括您隶属的不同法律辖区的了解你的客户和反洗钱政策。我们健全合规的框架确保我们在本地和全球层面均符合监管要求和监管水平，并确保本平台持续性运行。 <br>
  二、了解你的客户和反洗钱政策如下： <br>
  •   2.1颁布了解你的客户和反洗钱政策并时时更新以满足相应的法律法规规定的标准； <br>
  •   2.2颁布和更新运行本平台的一些指导原则和规则，且我们的员工将按照该原则和规则的指导提供服务； <br>
  •   2.3 设计并完成内部监测和控制交易的程序，如以严格的手段验证身份，安排组建专业团队专门负责反洗钱工作； <br>
  •   2.4 采用风险预防的方法对客户进行尽职调查和持续的监督; <br>
  •   2.5 审查和定期检查已发生的交易; <br>
  •   2.6 向主管当局报告可疑交易; <br>
  •   2.7身份证明文件、地址证明文件和交易记录的证明文件将会维持至少六年，如被提交给监管部门，恕不另行通知您。 <br>
  •   2.8 整个交易过程中，信用卡被禁止使用； <br>
  三、身份信息与核实确认 <br>
  •   3.1 身份信息 <br>
  o   3.1.1 根据不同的司法管辖区的不同规定及不同的实体类型，我们收集的您的信息内容可能不一致，原则上将向注册的个人收集以下信息： <br>
  o   个人基本信息：您的姓名，住址（及永久地址，如果不同） ，出生日期及国籍等可获得的其他情况。身份验证应该是根据官方或其他类似权威机构发放的文件，比如护照，身份证或其他不同的辖区要求的和引发的身份证明文件。您提供的地址将使用适当的方法进行验证，比如检查乘用交通工具的票据或利率票据或检查选民登记册等。 <br>
  o   有效的照片：在您注册之前，您须提供您将您的身份证件放在胸前的照片； <br>
  o   联系方式：电话/手机号码和/或有效的电子邮件地址。 <br>
  o   3.1.2如果您是一个公司或其他合法实体，我们将收集以下信息以确定您或信托帐户的最终受益人。 <br>
  o   公司注册、登记证；公司的章程与备忘录副本；公司的股权机构和所有权说明的详细证明材料，证明决定本平台账户的开立以及执行的授权委托人的董事会决议；按照要求需要提供的公司董事、大股东及本平台账户有权签字人的身份证明文件；该公司的主要营业地址，如果与公司的邮寄地址不同，提供邮寄地址。如果公司在本地的地址与它的主要营业地址不一致的，则被视为风险较高的客户，需要提交额外附加文件。 <br>
  o   •根据不同的司法管辖区的不同规定及不同的实体类型，我们要求的其他认证和权威部门发布的文件以及我们认为必要的文件。 <br>
  o   3.1.3 我们只接受英语版本或汉语版本的身份信息，如不是，请您将您的身份信息翻译成英文的版本并加以公证。 <br>
  •   3.2确认核实 <br>
  o   3.2.1我们要求您提供身份证明文件的全部页面内容。 <br>
  o   3.2.2 我们要求您提供您将您的身份证明文件放在您胸前的照片。 <br>
  o   3.2.3证明文件的副本一般应核和原始凭证进行核对。然而，如果某个可信赖的合适的认证人可证明该副本文件是原始文件准确而全面的复制的，该副本可接受。这样的认证人包括大使、司法委员、地方治安官等。 <br>
  o   3.2.4 对识别最终受益人和账户控制权的要求是确定哪些个人最终所有或控制直接客户，和/或确定正在进行的交易是由他人代为执行。如果是企业，则大股东的身份（例如那些持有10％或以上的投票权益）应被验证。一般，持股25 ％会被认定为正常风险内，其股东身份须验证；持股10%或拥有更多的投票权或股票时被认定为高风险的情况，股东身份须加以验证。 <br>
  四、监控交易 <br>
  •   4.1 我们根据安全性和实际交易情况时时设置和调整日常交易和提币最高限额; <br>
  •   4.2如果交易频繁集中发生在某个注册用户或存在超乎合理的情况，我们的专业团队将评估并决定他们是否可疑; <br>
  •   4.3我们凭借自身的判断认定为可疑交易的情况，我们可能会采取暂停该交易、拒绝该交易等限制性措施，甚至如果可能将尽快逆转该交易，同时向主管部门报告，但不会通知您; <br>
  •   4.4我们保留拒绝来自于不符合国际反洗钱标准辖区的人或可被视为政治公众人物的人的注册申请，我们保留随时暂停或终止根据我们自身判断为可疑交易的交易，但我们这样做并不违反对您的任何义务和责任。</p>
        `,
        },
    };

    constructor(public appSettings: AppSettingProvider) {
        this.initBetsTitle();
        this.initTradeTime();

        if (this.SIM_DATA) {
            this.initMinuteOffset();
        }
    }

    initMinuteOffset() {
        const dateMoment = moment.utc();
        const currentMinute = dateMoment.hours() * 60 + dateMoment.minutes();
        const minutePeriods = this._tradingMinutePeriods;

        switch (this._minuteFixType) {
            case MinuteFixType.BeforeTrading:
                // 设置为上午开盘之前 31 分钟
                // （北京时间 8:59 ，实时数据清除之前 1 分钟）。
                this._minuteOffset =
                    currentMinute -
                    minutePeriods[0].start +
                    this.TRADE_DAY_SWITCH_MINUTES_BEFORE_TRADING +
                    1;
                break;
            case MinuteFixType.BeforeAuction:
                this._minuteOffset =
                    currentMinute -
                    minutePeriods[0].start +
                    this.AUCTION_MINUTES_BEFORE_TRADING +
                    1;
                break;
            case MinuteFixType.Morning:
                // 设定为早上开盘后一小时左右。
                this._minuteOffset =
                    Math.round(currentMinute / 30) * 30 -
                    minutePeriods[0].start -
                    60;
                break;
            case MinuteFixType.Noon:
                // 设置为下午开盘之前 2 分钟
                this._minuteOffset = currentMinute - minutePeriods[1].start + 2;
                break;
            case MinuteFixType.Afternoon:
                // 设置为下午开盘后一小时左右。
                this._minuteOffset =
                    Math.round(currentMinute / 30) * 30 -
                    minutePeriods[1].start -
                    60;
                break;
            case MinuteFixType.AfterTrading:
                break;
        }

        // console.log(this._minuteOffset);
    }

    initTradeTime() {
        const regTime = /^([01]\d|2[0-4]):([0-5]\d|60)$/;
        const dateMoment = moment.utc();
        const timeArray = [];
        const minutePeriods = [];

        if (this.tradingTime.length !== 2) {
            throw "tradingTime setting error!";
        }

        this.tradingTime.forEach(({ start, end }) => {
            // 注意此处需要将 start 的检测放在后面，
            // 这样下面才可以直接使用 RegExp.$1 与 RegExp.$2 。
            if (!regTime.test(end) || !regTime.test(start) || start > end) {
                throw "tradingTime setting error!";
            }

            let hour = +RegExp.$1;
            let minute = +RegExp.$2;
            dateMoment.hours(hour);
            dateMoment.minutes(minute);

            let timeString;
            while ((timeString = dateMoment.format("HH:mm")) <= end) {
                timeArray.push(timeString);
                dateMoment.add(1, "minutes");
            }

            const startMinutes =
                hour * 60 + minute + this.TO_UTC_MINUTES_OFFSET;
            const endMinutes =
                dateMoment.hours() * 60 +
                dateMoment.minutes() -
                1 +
                this.TO_UTC_MINUTES_OFFSET;
            minutePeriods.push({
                start: startMinutes,
                end: endMinutes,
            });
        });

        this._tradingTimeArray = timeArray;
        this._tradingMinutePeriods = minutePeriods;

        console.log("inittradetime:", timeArray);
    }

    private initBetsTitle() {
        for (let i = 5; i >= -5; i--) {
            if (i === 0) {
                continue;
            }

            this._betsTitle.push(`${i > 0 ? "卖" : "买"}${Math.abs(i)}`);
        }
    }

    /**
     * accountType
     * 判断用户账号类型.
     * 邮箱 0 手机 1 客户号 2
     */
    public accountType(str) {
        if (
            /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test(
                str,
            )
        ) {
            return 0;
        } else if (this.RegExp_Tel.findIndex(reg => reg.test(str)) !== -1) {
            return 1;
        } else {
            return 2;
        }
    }

    //是否为推荐邮箱
    public accountEmailProposal(email) {
        let emailType = /@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.exec(
            email,
        );
        let _proposals: any = {
            "@qq.com": true,
            "@163.com": true,
            "@sina.com": true,
            "@gmail.com": true,
            "@126.com": true,
        };
        if (emailType) {
            return _proposals[emailType[0]];
        } else {
            return false;
        }
    }
}
