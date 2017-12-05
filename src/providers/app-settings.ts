import { Injectable } from '@angular/core';
import { AppSettingProvider } from '../bnlc-framework/providers/app-setting/app-setting';

import * as moment from 'moment';

enum MinuteFixType {
  // 交易开始之前（ 9:00 之前，早于集合竞价）
  BeforeTrading,
  // 集合竞价之前（ 9:15 之前）
  BeforeAuction,
  Morning,
  Noon,
  Afternoon,
  AfterTrading
}

@Injectable()
export class AppSettings {
  // http://192.168.16.185:40001/api/v1/bngj/news/swagger
  // public readonly SERVER_URL: string = 'http://119.23.68.40:11890';
  // public readonly SERVER_URL: string = 'http://192.168.16.101:40001'; //company mac server
  public get SERVER_URL() {
    return AppSettingProvider.SERVER_URL;
  } //test server
  // public readonly SERVER_URL: string = 'http://192.168.16.14:40001'; //company server
  // public readonly SERVER_URL: string = 'http://192.168.16.185:40001'; //zhiguang server
  // public readonly SERVER_URL: string = 'http://110.86.32.3:40001'; //company ip
  public get SERVER_PREFIX() {
    return AppSettingProvider.SERVER_PREFIX;
  }
  // public readonly SOCKET_URL: string = 'http://192.168.16.230:10011';
  // public readonly SOCKET_URL: string = 'http://192.168.16.235:10011';
  public readonly SOCKET_URL: string = 'http://119.23.68.40:11880'; //原gjs,现不用
  public readonly SOCKET_PREFIX: string = '/socket/v1/bngj';

  public readonly Platform_Type: string = '002'; //平台类型： 001高交所、002币加所、003本能理财
  /**
   * 产品/10^9
   * 钱/100
   * ^保留4位
   */
  public readonly Product_Price_Rate: number = 1e8;
  public readonly Price_Rate: number = 1e2;

  public readonly Charts_Array_Length: number = 60 * 24;

  // 虚假登录开关
  public readonly FAKE_LOGIN: boolean = false;

  //模拟数据开关
  public readonly SIM_DATA: boolean = false;

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

  public readonly KDATA_UNITS = ['day', 'week', 'month'];

  // 将本地时间转换为 UTC 时间时，分钟的偏移量。
  // 北京时间为东八区，需要扣除 8 小时。
  private readonly TO_UTC_MINUTES_OFFSET = -8 * 60;

  private _tradingTime = [
    { start: '09:30', end: '11:30' },
    { start: '13:00', end: '15:00' }
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
    riskNote: {
      title: '风险提示书',
      agreementFirst:
        '<div class="xy_cont_title">币加所风险提示书</div>' +
        '<span class="fwb">尊敬的会员：</span>' +
        '<p class="ti">由于股权交易过程中，可能会面临各种风险因素，<span class="fwb">币加所</span>郑重提示：</p>' +
        '股权交易是非保本的交易，在进行交易时存在盈利的可能，也存在亏损的风险。在您选择股权进行交易前，请注意及审慎评估投资风险，仔细阅读交易规则、本风险提示书，了解产品的具体情况，慎重考虑自身情况是否适合进行此类交易，自行审慎决定购买与自身风险承受能力和资产管理需求匹配的产品。在您购买相关产品后，您也应随时关注产品的相关信息和风险。若您选择参与本中心股权交易，则视为您已仔细阅读前述规定以及本风险提示书并自愿自行承担股权交易带来的风险。请客观理性地认识到股权交易的风险包括但不限于：' +
        '<br><span class="fwb">一、宏观经济风险：</span>' +
        '<p class="ti">我国宏观经济形势的变化以及企业价值取向的变化，存在可能影响股权价格上下波动的情形；国际宏观经济形势变化也会对股权交易市场产生影响，存在导致股权交易价格波动的情形。</p>' +
        '<span class="fwb">二、政策法规：</span>' +
        '<p class="ti">股权交易作为一种创新交易模式，法律和政策及自身的交易规则还需要在实践中不断完善，国家法律、法规及政策的变化以及影响价格波动的其他因素出现，都可能影响股权众筹的股权交易价格；或者由于本中心根据国家法律、法规及政策变化等原因而对本中心相关规则进行修订，可能影响交易主体资格、交易规则等各个方面的变化，从而可能导致本中心交易的股权价格异常波动。</p>' +
        '<span class="fwb">三、市场风险：</span>' +
        '<p class="ti">股权转让交易的产品种类、数额的变化及市场人员和资金的参与程度等市场因素，可能导致本中心交易的股权价格异常波动。</p>' +
        '<span class="fwb">四、鉴定评估风险：</span>' +
        '<p class="ti">由于国内目前尚无权威的评估机构和统一的估值程序及完备的结算科技企业估值方法，估值会与实际市场价不一致，估值意见书仅供会员参考，不作为您主张其他权益的依据。</p>' +
        '<span class="fwb">五、技术风险：</span>' +
        '<p class="ti">由于交易的进行、信息的显示及资金的划付均运用电子通讯技术并通过互联网传输来实现的，存在被网络黑客和计算机病毒攻击的可能，或者通讯技术或相关软件具有存在缺陷的可能，互联网传输故障也可能造成您的交易指令无法及时传输，这些风险均可导致您的交易申报无法成交或者无法全部成交，或者转账资金不能及时到账、交易延迟、中止甚至无法完成交易等。</p>' +
        '<span class="fwb">六、不可抗力风险：</span>' +
        '<p class="ti">诸如地震、台风、火灾、水灾、战争、瘟疫、社会动乱等不可抗力因素可能导致股权众筹交易系统的瘫痪或无法正常交货；本中心无法控制和不可预测的系统故障、设备故障、通讯故障、电力故障等也可能导致交易系统非正常运行甚至瘫痪或导致会员无法及时了解相关信息；银行无法控制和不可预测的系统故障、设备故障、通讯故障、电力故障等也可能导致资金转账系统非正常运行甚至瘫痪，这些风险可能导致您的交易申报无法成交或者无法全部成交，或者转账资金不能及时到账等。</p>' +
        '<span class="fwb">七、账号密码泄露风险：</span>' +
        '<p class="ti">由于会员使用计算机被病毒侵入、黑客攻击等导致的密码泄露、账号泄露或会员的身份被冒用，可能导致无法正确下达申报指令、恶意虚假申报或申报失败、延迟、错误等。</p>' +
        '<span class="fwb">八、会员软硬件系统风险：</span>' +
        '<p class="ti">电脑设备及软件系统与所提供的网上交易系统不相匹配，导致无法下达申报指令或申报失败、延迟等。</p>' +
        '<span class="fwb">九、其他风险：</span>' +
        '<p class="ti">密码失密、操作不当、交易决策失误的等原因可能会使会员发生亏损；网上申报、热键操作完毕后未及时退出，他人进行恶意操作而造成的损失；网上交易未及时退出还可能导致遭遇黑客攻击，从而造成损失。在会员参与股权众筹交易时，任何人给予的保证获利或不会发生亏损的任何承诺都是没有根据的，类似的承诺不会减少发生亏损的可能。本中心没有授权任何个人或组织进行委托投资理财业务，为保护会员的合法权益，请不要与任何人签订股权交易委托代理协议，否则由此引起的一切后果将由您本人承担。</p>' +
        '<p class="ti"><span class="fwb">本《风险提示书》提示事项仅为列举，并不能详细列明从事股权众筹产品交易的全部风险和可能影响股权众筹市场异常波动的所有情形，其他不可预见的风险因素也可能会给您带来损失。</span>敬请对此有清醒的认识。您在进行股权交易前，应确保自己已经做好足够的风险评估和财务安排，避免因参与交易而遭受难以承受的损失。</p>' +
        '<p class="ti"><span class="fwb ti">特别提示：本中心敬告，上述风险及其他不可预见的风险因素可能给您带来的损失，均由您自行承担，本交易中心和管理人不承担。</span>您应当根据自身的经济条件和心理承受能力认真制定交易策略，尤其是决定购买有较大潜在风险的品种时，更应当清醒地认识到股权交易的风险。</p>' +
        '<span class="fwb">我们郑重地提醒您，认真阅读并谨记以下劝导：</span>' +
        '<br>1、请合理配置个人资产，不要以个人全部资产投入本中心交易市场。' +
        '<br>2、请理性管理个人财富，不要拿生活必须资金、自用住房抵押贷款或其他借款投入股权投资市场。' +
        '<br>3、请客观评估自己抗风险能力，选择恰当的交易品种。' +
        '<br>4、请正确运用交易策略，留有适当资金以备不时之需。' +
        '<br>5、请认真了解所交易的股权众筹产品，不能仅凭市场传言盲目操作。' +
        '<br>6、请认真了解并掌握股权交易所需的必要知识和相关法规，提高自我保护的能力。' +
        '<br><span class="fwb ti">本中心再次郑重提醒，股权众筹产品交易有风险，请分清风险和收益之间的关系，树立正确的投资理念，谨慎交易，理性操作，注意身心健康与资金安全。</span>' +
        '<div class="mt10 tr">币加所</div>'
    },
    initiationAgreement: {
      title: '投资人员入会协议',
      agreementFirst:
        '协议编号：____________' +
        '<br>会员名称：____________' +
        '<br>会员账号：____________' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;填表说明' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;一、在签署文件和填表前，申请人应当充分阅读并完全理解币加所有关规章和制度，并确知享有的权利和承担的义务。本协议须提交以下文件和资料：' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1、申请人身份证复印件（正反面）；' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2、申请人银行卡号' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3、投资人会员入会申请表；' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4、风险提示书' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;二、本文件须用黑色墨水笔逐项填写或签字，字迹工整、清晰，不得涂改。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;三、本文件一式两份，经批准后，双方各执一份。' +
        '<br>甲方：____________' +
        '<br>乙方：币加所' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;根据《中华人民共和国合同法》、《中华人民共和国电子签名法》《计算机系统安全保护条例》及《第三方电子商务交易平台服务规范》等有关国家相关法律法规，为明确甲乙双方的责任，维护有关各方的合法权益，控制市场风险，甲乙双方根据币加所相关文件和规定，遵循平等、自愿、互惠的原则，达成如下协议：' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1、服务内容：' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1.1 甲方根据币加所相关规定，在乙方网络平台按照规定申请成为乙方投资人会员（“合格投资者会员”），享有乙方为投资人会员提供的所有服务，并可在乙方的交易平台上进行品种的投资、交易。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1.2 甲方所能享受的服务参照乙方交易规则、会员管理制度等相关文件确定。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1.3 乙方有权根据业务发展需要，单方面调整对投资人会员的服务专案及内容且无须事先通知甲方，甲方对此无异议。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.甲方权利与义务：' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.1甲方权利' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（1）甲方自愿成为乙方的投资人会员，并可以自主在乙方交易平台上进行投资、交易。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（2）甲方有权注销自己的乙方投资人会员资格并承担由此带来的一切责任。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（3）甲方如对乙方服务有疑问、建议或意见，可以拨打乙方服务电话、登录乙方官方网站或到乙方营业场所进行咨询。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（4）对乙方作出的不同意甲方投资人会员及其他申请的决定，甲方可以向乙方咨询，并可以在条件符合时重新提出申请。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.2甲方义务' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（1）甲方保证符合币加所要求，其自身不存在任何法律、法规、乙方交易规则、管理制度所规定的禁止或限制其成为乙方会员及禁止或限制其从事投资、交易的情形。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（2）甲方保证已阅读乙方的管理制度及其他相关文件，知晓交易方法并同意遵守该等文件。甲方已阅读并理解《币加所交易风险提示书》，知晓交易风险并自愿承担交易风险。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（3）甲方保证提交给乙方的所有资料均真实、合法、完整。因所提交资料的瑕疵而产生的一切法律责任，由甲方承担。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（4）甲方保证其在乙方平台上投资资金的来源合法。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（5）甲方必须妥善保管其在乙方交易平台上的帐号、密码、手机号码、邮箱、证件号码等个人资讯，因泄露、保管不善使上述个人资讯泄露而导致的风险及损失由甲方承担。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（6）甲方须到乙方指定的官方网站登录个人帐户，下载交易软件，不得通过其他链接进行登录及下载。因甲方通过其他网站提供的链接登录个人帐户、下载交易软件而产生的一切风险及责任，由甲方承担。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（7）对于通过甲方帐户、密码而发出的交易指令，全部视为甲方发出，甲方承诺对上述交易指令承担全部责任。乙方一旦执行甲方通过帐户、密码提交的交易指令后，甲方无权要求变更或撤销该交易指令。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（8）甲方必须遵守乙方对所提供服务的相关规则和收费标准，乙方对相关服务规则和收费标准进行变更的，只需按本协议规定在网站上进行公告即对甲方生效，无需单独通知甲方，甲方对此无异议。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（9）甲方在申请成为乙方投资人会员时所提交的资料等注册资讯如有更改，应按照乙方规定，及时在乙方网站或乙方营业场所进行变更。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（10）乙方可根据业务发展的需要，对提供给甲方的服务内容进行增加、调整或停止，并自行判断是否须甲方办理确认手续，甲方对此无异议，并配合完成。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（11）甲方应按照乙方交易规则进行交易，不得诋毁乙方声誉以及恶意攻击乙方网站及网络交易系统。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（12）因乙方的系统出现故障、错账等原因而导致甲方获得不当得利，甲方同意乙方从其账户扣划不当得利及其孳息，及/或暂停对甲方提供的服务。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（13）甲方须按照乙方规定缴纳交易佣金及其他相关费用。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（14）甲方已经认真阅读本协议，特别是涉及乙方免责等重要条款，并自愿遵守本协议条款。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3.乙方权利与义务' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3.1乙方权利' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（1） 乙方有权根据其对投资人会员的要求以及甲方的个人资产、信用等情况，作出是否同意甲方申请的决定。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（2） 乙方有权对所提供的服务内容、收费标准、会员管理制度、交易规则等规定进行调整，有权对官方网站及交易软件进行升级、优化。上述资讯在官方网站或营业场所进行公布时即对甲方发生效力，并不需事先告知甲方。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（3） 乙方根据业务发展需要，可对提供给甲方的服务内容进行增加、调整或停止，并可自行判断是否需要甲方办理确认手续。如需要，乙方可通过电话、短信、邮件、官方网站公布等途径告知甲方。如不需要，乙方可自行办理该事宜。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（4）发生下列情况时，乙方可冻结甲方帐户，并有权根据实际情况作出终止甲方投资人会员资格、移交司法部门等决定，以保障自己的合法权利。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;a、甲方提交的资料存在虚假、重大遗漏或重大隐瞒，严重违反乙方的管理制度、交易制度等。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;b、甲方利用乙方的交易平台从事非法活动。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;c、甲方在乙方的投资资金来源非法。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;d、甲方诋毁乙方声誉，或恶意攻击乙方网站、交易软件等。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;e、甲方不按照乙方的规定，恶意操作，损害或威胁乙方及其他人的合法利益的。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;f、其他违反法律，法规，乙方交易制度、管理制度，对乙方及其他人的合法利益造成损害的行为。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（5）对于通过甲方帐户、密码而发出的交易指令，全部视为甲方发出。乙方按照上述交易指令行事，产生的一切结果均由甲方承担。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（6）乙方因下列行为未能及时、正确的执行甲方的交易指令时，乙方不承担任何责任：' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;a、任何原因造成的甲方交易指令资讯不明、不完整等情况。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;b、甲方帐户存在被冻结、被扣划等强制措施。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;c、甲方帐户资金不足，或投资资金来源非法。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;d、甲方的交易指令出于任何非法目的。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;e、甲方未按照乙方规定正确操作。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;f、不可抗力、网络攻击或病毒攻击、系统故障、通讯设施故障、电力设施故障或其他不可归责于乙方的情况。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（7）因甲方所投资的交易产品本身的任何问题而导致的甲方风险和损失，乙方不承担任何责任。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（8）甲方取得交易产品权益时，即视为同意授权乙方作为代理人，代为托管交易标的物，代为办理交易产品的托管、登记事宜，乙方须将上述相关事宜向甲方公示。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3.2乙方义务' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（1）在条件相同时，乙方须平等地为每一位投资人会员提供服务。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（2）在系统及甲方交易指令均不存在异常时，乙方应准确、及时的执行甲方的交易指令。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（3）对于甲方提出的与甲方投资人会员服务相关的咨询，乙方应认真、及时的做出解答。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（4） 乙方应认真维护官方网站和交易软件的安全及稳定运作。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（5） 乙方可在法律许可、监管部门要求及甲方同意的范围内使用甲方资料及帐户交易记录。乙方需对甲方的资料和帐户交易记录尽保密义务，但法律另有规定或监管部门另有要求的除外。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4.纠纷解决条款：' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4.1 本协议适用中华人民共和国相关法律。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4.2 协议中未尽事宜，参照相关法律、乙方业务规定或业内通行的惯例解决。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4.3 如因执行本协议发生纠纷，双方应进行协商。协商不成的，可向乙方所在地有管辖权的法院提起诉讼。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5.协议的变更或终止：' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5.1 乙方通过官方网站或其他途径发布的与本协议相关的公告，为本协议不可分割的一部分。如公告与本协议有冲突之处，以公告内容为准。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5.2 因甲方申请,乙方撤销或其他原因导致的甲方投资人会员资格被注销后，本协定终止' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5.3 在甲方违法、不正当操作或者存在其他违反法律、法规、本协议或乙方相关业务规定的情况下，乙方可单方面中止或终止本协议。在本协议中止或终止后，甲方之前发出的交易指令仍然有效，乙方根据其交易指令行事的后果由甲方承担。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5.4 本协议任何条款因任何原因被确认无效，均不影响其他条款的效力。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5.5 甲方应认真阅读本协议,甲方自愿接受本协议约束。' +
        '<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5.6 甲方启动其实名会员帐户时，该协议即生效。' +
        '<br>甲方（签章）：' +
        '<br>代表人（签字）：' +
        '<br>签署日期：年  月  日' +
        '<br><br>乙方（签章）：币加所' +
        '<br>代表人（签字）：' +
        '<br>签署日期：年  月  日'
    },
    partnershipAgreement: {
      title: '投资人会员《合伙协议》、《转让协议》',
      agreementFirst:
        '<div class="xy_cont_title">有限合伙投资协议、有限合伙财产份额转让协议<br>《____合伙企业（有限合伙）合伙协议》 <br><br>第一章 总则 </div>' +
        '<p class="ti"><span class="fwb">第一条&nbsp;&nbsp;</span>为维护合伙企业、合伙人的合法权益，规范合伙企业的组织和行为，根据《中华人民共和国合伙企业法》（以下简称《合伙企业法》）和其他有关法律、行政法规的规定，制订本协议。</p>' +
        '<p class="ti"><span class="fwb">第二条&nbsp;&nbsp;</span>本合伙企业是由普通合伙人和有限合伙人组成的有限合伙企业，普通合伙人对合伙企业的债务承担无限连带责任，有限合伙人以其认缴的出资额为限对合伙企业债务承担责任。</p>' +
        '<p class="ti"><span class="fwb">第三条&nbsp;&nbsp;</span>本协议自生效之日起，即对全体合伙人具有约束力。 </p>' +
        '<p class="ti"><span class="fwb">第四条&nbsp;&nbsp;</span>本协议中的各项条款与法律、法规、规章不符的，以法律、法规、规章的规定为准。</p>' +
        '<div class="xy_cont_title">第二章 合伙企业的名称和主要经营场所 </div>' +
        '<p class="ti"><span class="fwb">第五条&nbsp;&nbsp;</span>合伙企业名称：</p>' +
        '<p class="ti">____________________________合伙企业（有限合伙）</p>' +
        '<p class="ti"><span class="fwb">第六条&nbsp;&nbsp;</span>合伙企业主要经营场所：___________________ </p>' +
        '<div class="xy_cont_title">第三章 合伙企业的目的、经营范围与期限 </div>' +
        '<p class="ti"><span class="fwb">第七条&nbsp;&nbsp;</span>合伙企业的目的：通过合伙，将有不同资金条件和不同技术、管理能力的人或企业组织起来，集中多方力量共同从事对中小科技企业股权投资，相互弥补各自的缺陷，实现一方在一定期限内难以实现的经营目的，分享经营所得。 </p>' +
        '<p class="ti"><span class="fwb">第八条&nbsp;&nbsp;</span>合伙企业的经营范围：股权投资管理</p>' +
        '<p class="ti">（注：根据实际情况具体填写，但以登记机关核定为准。） </p>' +
        '<p class="ti">合伙企业根据实际情况，可改变经营范围，但是应当于全体合伙人决定之日起十五日内办理变更登记。  </p>' +
        '<p class="ti"><span class="fwb">第九条&nbsp;&nbsp;</span>合伙企业的期限：长期</p>' +
        '<div class="xy_cont_title">第四章 合伙人的姓名（名称）、住所 </div>' +
        '<p class="ti"><span class="fwb">第十条&nbsp;&nbsp;</span>合伙企业由    个合伙人共同出资设立，其中普通合伙人____个，有限合伙人____个。</p>' +
        '<p class="ti">1、普通合伙人</p>' +
        '<p class="ti">1）姓名或名称： __________________________</p>' +
        '<p class="ti">2）住所：_________________________________</p>' +
        '<p class="ti">2、有限合伙人</p>' +
        '<p class="ti">1）合伙人姓名： __________________________</p>' +
        '<p class="ti">2）身份证号码： __________________________</p>' +
        '<p class="ti">3）住所：_________________________________</p>' +
        '<p class="ti">4）联系电话： ____________________________</p>' +
        '<div class="xy_cont_title">第五章 合伙人的出资方式、数额和缴付期限 </div>' +
        '<p class="ti"><span class="fwb">第十一条&nbsp;&nbsp;</span>普通合伙人负责合伙企业的合伙事务管理。全体合伙人以货币出资。</p>' +
        '<p class="ti">1、普通合伙人出资表：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（单位：元） </p>' +
        '<table class="table_default table_info">' +
        '<tbody>' +
        '<tr><td width="35%">序号</td><td>1</td></tr> ' +
        '<tr> <td width="35%">普通合伙人姓名</td> <td>&nbsp;</td> </tr> ' +
        '<tr> <td width="35%">出资额</td> <td>&nbsp;</td> </tr> ' +
        '<tr> <td width="35%">出资方式</td> <td>&nbsp;</td> </tr>' +
        ' <tr> <td width="35%">出资比例</td> <td>&nbsp;</td> </tr> ' +
        '<tr> <td width="35%">缴付期限</td> <td>&nbsp;</td> </tr> ' +
        '</tbody> </table> ' +
        '<p class="ti">2、有限合伙人出资表：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（单位：元）</p>' +
        '<table class="table_default table_info">' +
        '<tbody>' +
        '<tr><td width="35%">序号</td><td>1</td></tr>' +
        '<tr><td width="35%">有限合伙人姓名</td><td>&nbsp;</td></tr>' +
        '<tr><td width="35%">出资额</td><td>&nbsp;</td></tr>' +
        '<tr><td width="35%">出资方式</td><td>&nbsp;</td></tr>' +
        '<tr><td width="35%">出资比例</td><td>&nbsp;</td></tr>' +
        '<tr><td width="35%">缴付期限</td><td>&nbsp;</td></tr>' +
        '</tbody></table>' +
        '<p class="ti">全体合伙人应当按照合伙协议的约定按期足额缴纳出资；未按期足额缴纳的，应当承担补缴义务，并对其他合伙人承担违约责任</p>' +
        '<div class="xy_cont_title">第六章 利润分配、亏损分担方式 </div>' +
        '<p class="ti"><span class="fwb">第十二条&nbsp;&nbsp;</span>全部盈利和亏损由全体合伙人按实缴出资比例分红和分担。</p>' +
        '<div class="xy_cont_title">第七章 普通合伙人及合伙事务的执行 </div> ' +
        '<p class="ti"><span class="fwb">第十三条&nbsp;&nbsp;</span>有限合伙企业由_______执行合伙事务。委派_______作为执行事务合伙人委派代表，执行事务合伙人应当每年向其他合伙人报告事务执行情况以及合伙企业的经营和财务状况，其执行合伙事务所产生的收益归合伙企业，所产生的费用和亏损由合伙企业承担。合伙企业应当向执行事务合伙人支付管理报酬。有限合伙人不执行合伙事务，不得对外代表有限合伙企业。 </p>' +
        '<p class="ti"><span class="fwb">第十四条&nbsp;&nbsp;</span>不执行合伙事务的合伙人有权监督执行事务的合伙人，检查其执行合伙企业事务的情况。执行事务合伙人应当定期向其他合伙人报告事务执行情况及合伙企业的经营状况和财务状况，其执行合伙事务产生的收益归合伙企业所有，所产生的费用、亏损或民事责任由合伙企业承担。 </p>' +
        '<p class="ti"><span class="fwb">第十五条&nbsp;&nbsp;</span>执行事务合伙人由合伙人推举产生，应具备以下条件：</p>' +
        '<p class="ti">（一）按期缴付出资，对合伙企业的债务承担无限连带责任； </p>' +
        '<p class="ti">（二）具有完全民事行为能力；</p>' +
        '<p class="ti">（三）无犯罪记录，无不良经营记录。</p>' +
        '<p class="ti"><span class="fwb">第十六条&nbsp;&nbsp;</span>执行事务合伙人拥有《合伙企业法》及本协议规定的执行合伙事务的职权，包括： </p>' +
        '<p class="ti">（一）负责合伙企业的经营管理工作，执行合伙企业的投资及其他业务； </p>' +
        '<p class="ti">（二）管理、维持合伙企业的资产； </p>' +
        '<p class="ti">（三）采取为维持合伙企业合法存续、以合伙企业身份开展经营活动所必需的一切行动； </p>' +
        '<p class="ti">（四）开立、维持和撤销合伙企业的银行账户，开具支票和其他付款凭证； </p>' +
        '<p class="ti">（五）聘用专业人士、中介及顾问机构对合伙企业提供服务； </p>' +
        '<p class="ti">（六）订立和修改托管协议； </p>' +
        '<p class="ti">（七）为合伙企业的利益决定提起诉讼或应诉，进行仲裁；与争议对方进行协商、和解等；</p>' +
        '<p class="ti">（八）根据法律、法规规定处理合伙企业的涉税事项；</p>' +
        '<p class="ti">（九）代表合伙企业对外签署文件；</p>' +
        '<p class="ti">（十）采取为实现合伙目的、维护或争取合伙企业合法权益所必需的其他行动；</p>' +
        '<p class="ti">（十一）根据法律、法规规定或协议约定属于执行事务合伙人的其他职权。 </p>' +
        '<p class="ti">执行事务合伙人违反法律法规的规定，或者不按照合伙协议约定或全体合伙人决定执行合伙事务，给合伙企业或其他合伙人造成损失的，执行事务合伙人应向合伙企业或其他合伙人承担赔偿责任。  </p>' +
        '<p class="ti"><span class="fwb">第十七条&nbsp;&nbsp;</span>执行事务合伙人有下列情形之一的，经其他合伙人一致同意，可以决定将其除名，并推举新的执行事务合伙人：</p>' +
        '<p class="ti">（一）未按期履行出资义务；/p&gt; </p>' +
        '<p class="ti">（二）因故意或重大过失给合伙企业造成特别重大损失； </p>' +
        '<p class="ti">（三）执行合伙事务时有不正当行为； </p>' +
        '<p class="ti">（四）发生合伙协议约定的其他事由。 </p>' +
        '<p class="ti">对执行事务合伙人的除名决议应当书面通知被除名人，被除名人接到除名通知书之日，除名生效，被除名人退伙。 </p>' +
        '<p class="ti">被除名人对除名有异议的，可以自接到除名通知之日起三十日内，向人民法院起诉。 </p>' +
        '<p class="ti"><span class="fwb">第十八条&nbsp;&nbsp;</span>有限合伙人不执行合伙事务，不得对外代表合伙企业。有限合伙人的下列行为，不视为执行合伙事务： </p>' +
        '<p class="ti">（一）参与决定普通合伙人入伙、退伙； </p>' +
        '<p class="ti">（二）对企业的经营管理提出建议；</p>' +
        '<p class="ti">（三）参与选择承办有限合伙企业审计业务的会计师事务所； </p>' +
        '<p class="ti">（四）获取经审计的有限合伙企业财务会计报告； </p>' +
        '<p class="ti">（五）对涉及自身利益的情况，查阅有限合伙企业财务会计账簿等财务资料； </p>' +
        '<p class="ti">（六）在有限合伙企业中的利益受到侵害时，向有责任的合伙人主张权利或者提起诉讼； </p>' +
        '<p class="ti">（七）执行事务合伙人怠于行使权利时，督促其行使权利或者为了本企业的利益以自己的名义提起诉讼； </p>' +
        '<p class="ti">（八）依法为本企业提供担保。 </p>' +
        '<p class="ti"><span class="fwb">第十九条&nbsp;&nbsp;</span>合伙人对合伙企业有关事项作出决议，合伙人的表决权根据各合伙人的实缴出资比例确定，具体表决方式由合伙人另行约定。</p>' +
        '<p class="ti"><span class="fwb">第二十条&nbsp;&nbsp;</span>合伙人的出资、以合伙企业名义取得的收益和以合伙企业名义依法取得的其他财产，均为合伙企业的财产。除本协议另有约定外，在合伙企业清算前，合伙人不得请求分割合伙企业的财产。</p>' +
        '<p class="ti"><span class="fwb">第二十一条&nbsp;&nbsp;</span>执行事务合伙人的除名条件和更换程序 </p>' +
        '<p class="ti">因执行事务合伙人违反本协议约定致使有限合伙受到重大损害或承担有限合伙无力偿还或解决的重大债务、责任时，经全体合伙人一致同意，有限合伙可将执行事务合伙人除名，对执行事务合伙人的除名决议应当书面通知被除名人，被除名人接到除名通知之日，除名生效，被除名人退伙。</p>' +
        '<p class="ti">执行事务合伙人按照本协议约定被除名后，经全体合伙人一致同意，可以决定更换执行事务合伙人并选择接任的新执行事务合伙人，新执行事务合伙人应签署书面文件确认同意受本协议约束并履行本协议规定的应由执行事务合伙人履行的职责和义务。</p>' +
        '<p class="ti">如执行事务合伙人按照本协议约定被除名同时有限合伙没有选定接任的执行事务合伙人，则有限合伙解散，进入清算程序。</p>' +
        '<p class="ti"><span class="fwb">第二十二条&nbsp;&nbsp;</span>除本合同第二十三条规定的决定事项外，本合伙企业的所有决定事项由普通合伙人决定。</p>' +
        '<p class="ti"><span class="fwb">第二十三条&nbsp;&nbsp;</span>合伙企业的下列事项应当经普通合伙人和80%以上的有限合伙人一致同意：</p>' +
        '<p class="ti">（一）改变合伙企业的名称；</p>' +
        '<p class="ti">（二）本合伙企业有限合伙人持有资产上公开信息发布与转让平台进行转让信息发布和转让，以及从前述平台退出公开信息发布和转让； </p>' +
        '<p class="ti">（三）处分合伙企业的不动产；</p>' +
        '<p class="ti">（四）以合伙企业名义为他人提供担保、借款、产生负债； </p>' +
        '<p class="ti"><span class="fwb">第二十四条&nbsp;&nbsp;</span>有限合伙人不得同本有限合伙企业进行交易，全体合伙人包括普通合伙人和有限合伙人都不得将其在有限合伙企业中的财产份额出质。 </p>' +
        '<p class="ti"><span class="fwb">第二十五条&nbsp;&nbsp;</span>有限合伙人不可以增加或者减少对合伙企业的出资；有限合伙人向合伙人或合伙人以外的人转让其在合伙企业中的全部或者部分财产份额时，无须经其他合伙人同意；合伙人向合伙人或合伙人以外的人转让其在合伙企业中的财产份额的，其他合伙人无优先购买权，应当参与竞价转让。合伙人的出资、以合伙企业名义取得的收益和依法取得的其他财产，均为合伙企业的财产，合伙人在合伙企业清算前，不得请求分割合伙企业的财产。 </p>' +
        '<div class="xy_cont_title">第八章 入伙与退伙 </div>' +
        '<p class="ti"><span class="fwb">第二十六条&nbsp;&nbsp;</span>新合伙人入伙，无须经其他有限合伙人同意，只需与有限合伙财产份额转让人签订转让协议，并由执行事务合伙人办理相关注册备案手续即可。新入伙的有限合伙人对入伙前有限合伙企业的债务，以其认缴的出资额为限承担责任。</p>' +
        '<p class="ti"><span class="fwb">第二十七条&nbsp;&nbsp;</span>在合伙企业存续期间，未经普通合伙人同意，有限合伙人不可以退伙。</p>' +
        '<p class="ti"><span class="fwb">第二十八条&nbsp;&nbsp;</span>普通合伙人不可以退伙。</p>' +
        '<p class="ti"><span class="fwb">第二十九条&nbsp;&nbsp;</span>普通合伙人违反本协议第十九条的规定退伙的，应当赔偿由此给合伙企业造成的损失。</p>' +
        '<p class="ti"><span class="fwb">第三十条&nbsp;&nbsp;</span>当然退伙：</p>' +
        '<p class="ti">普通合伙人具有下列情形之一的，当然退伙：</p>' +
        '<p class="ti">（一）作为合伙人的自然人死亡或者被依法宣告死亡；</p>' +
        '<p class="ti">（二）个人丧失偿债能力；</p>' +
        '<p class="ti">（三）作为合伙人的法人或者其他组织依法被吊销营业执照、责令关闭、撤销，或者被宣告破产； </p>' +
        '<p class="ti">（四）法律规定或者合伙协议约定合伙人必须具有相关资格而丧失该资格； </p>' +
        '<p class="ti">（五）合伙人在合伙企业中的全部资产被人民法院强制执行。</p>' +
        '<p class="ti">有限合伙人具有下列情形之一的，当然退伙： </p>' +
        '<p class="ti">（一）作为合伙人的自然人死亡或者被依法宣告死亡； </p>' +
        '<p class="ti">（二）作为合伙人的法人或者其他组织依法被吊销营业执照、责令关闭、撤销，或者被宣告破产；</p>' +
        '<p class="ti">（三）法律规定或者合伙协议约定合伙人必须具有相关资格而丧失该资格； </p>' +
        '<p class="ti">（四）合伙人在合伙企业中的全部资产被人民法院强制执行。 </p>' +
        '<p class="ti">作为有限合伙人的自然人在有限合伙企业存续期间丧失民事行为能力的，其他合伙人不得因此要求其退伙。</p>' +
        '<p class="ti"><span class="fwb">第三十一条&nbsp;&nbsp;</span>合伙人有下列情形之一的，经其他合伙人一致同意，可以决议将其除名： </p>' +
        '<p class="ti">（一）未履行出资义务； </p>' +
        '<p class="ti">（二）因故意或者重大过失给合伙企业造成损失；</p>' +
        '<p class="ti">（三）执行合伙事务时有不正当行为； </p>' +
        '<p class="ti">（四）发生合伙协议约定的事由。 </p>' +
        '<p class="ti">对合伙人的除名决议应当书面通知被除名人。被除名人接到除名通知之日，除名生效，被除名人退伙。被除名人对除名决议有异议的，可以自接到除名通知之日起三十日内，向人民法院起诉。</p>' +
        '<p class="ti"><span class="fwb">第三十二条&nbsp;&nbsp;</span>合伙人死亡或者被依法宣告死亡的，对该合伙人在合伙企业中的财产份额享有合法继承权的继承人，无需经其他合伙人同意，从继承开始之日起，取得该合伙企业的合伙人资格。 </p>' +
        '<div class="xy_cont_title">第九章 有限合伙人与普通合伙人互换程序 </div>' +
        '<p class="ti"><span class="fwb">第三十三条&nbsp;&nbsp;</span>本有限合伙企业的有限合伙人与普通合伙人不得发生互换。</p>' +
        '<div class="xy_cont_title">第十章 争议解决办法 </div>' +
        '<p class="ti"><span class="fwb">第三十四条&nbsp;&nbsp;</span>合伙人对合伙事项发生争议，实行有限合伙人按合伙财产份额持有比例，超过80%比例的通过的表决办法解决。</p>' +
        '<p class="ti"><span class="fwb">第三十五条&nbsp;&nbsp;</span>合伙人对表决通过的合伙事务争议事项不服的，可以向本有限合伙企业注册地人民法院提起诉讼。 </p>' +
        '<div class="xy_cont_title">第十一章 合伙企业的解散与清算 </div>' +
        '<p class="ti"><span class="fwb">第三十六条&nbsp;&nbsp;</span>合伙企业有下列情形之一的，应当解散：</p>' +
        '<p class="ti">（一）合伙期限届满，合伙人决定不再经营；</p>' +
        '<p class="ti">（二）合伙协议约定的解散事由出现； </p>' +
        '<p class="ti">（三）全体合伙人决定解散；</p>' +
        '<p class="ti">（四）合伙人已不具备法定人数满三十天； </p>' +
        '<p class="ti">（五）合伙协议约定的合伙目的已经实现或者无法实现； </p>' +
        '<p class="ti">（六）依法被吊销营业执照、责令关闭或者被撤销；</p>' +
        '<p class="ti">（七）法律、行政法规规定的其他原因。</p>' +
        '<p class="ti"><span class="fwb">第三十七条&nbsp;&nbsp;</span>合伙企业解散，应当由清算人进行清算。清算人由普通合伙人担任；经全体合伙人过半数同意，也可以自合伙企业解散事由出现后十五日内指定一个或者数个合伙人，或者委托第三人，担任清算人。清算人自被确定之日起十日内将合伙企业解散事项通知债权人，并于六十日内在报纸上公告。清算人在清算期间执行下列事务：</p>' +
        '<p class="ti">（一）清理合伙企业财产，分别编制资产负债表和财产清单；</p>' +
        '<p class="ti">（二）处理与清算有关的合伙企业未了结事务；</p>' +
        '<p class="ti">（三）清缴所欠税款；</p>' +
        '<p class="ti">（四）清理债权、债务； </p>' +
        '<p class="ti">（五）处理合伙企业清偿债务后的剩余财产； </p>' +
        '<p class="ti">（六）代表合伙企业参加诉讼或者仲裁活动。</p>' +
        '<p class="ti">清算期间，合伙企业不得开展与清算无关的经营活动。合伙企业财产在支付清算费用和职工工资、社会保险费用、法定补偿金以及缴纳所欠税款、清偿债务后的剩余财产，由合伙人按照实缴出资比例分配、分担（可另作约定，但不得约定将全部利润分配给部分合伙人或者由部分合伙人承担全部亏损）；清算结束，清算人应当编制清算报告，经全体合伙人签名、盖章后，在十五日内向企业登记机关报送清算报告，申请办理合伙企业注销登记。合伙企业注销后，合伙人对合伙企业存续期间的债务仍应承担无限连带责任。</p>' +
        '<div class="xy_cont_title">第十二章 违约责任 </div>' +
        '<p class="ti"><span class="fwb">第三十八条&nbsp;&nbsp;</span>合伙人对合伙协议约定必须经全体合伙人一致同意始得执行的事务擅自处理，给合伙企业或者其他合伙人造成损失的，依法承担赔偿责任。 </p>' +
        '<p class="ti"><span class="fwb">第三十九条&nbsp;&nbsp;</span>合伙人执行合伙事务，或者合伙企业从业人员利用职务上的便利，将应当归合伙企业的利益据为己有的，或者采取其他手段侵占合伙企业财产的，应当将该利益和财产退还合伙企业；给合伙企业或者其他合伙人造成损失的，依法承担赔偿责任。合伙企业登记事项发生变更，执行合伙事务的合伙人未按期申请办理变更登记的，应当赔偿由此给合伙企业、其他合伙人或者善意第三人造成的损失。</p>' +
        '<p class="ti"><span class="fwb">第四十条&nbsp;&nbsp;</span>不具有事务执行权的合伙人擅自执行合伙事务，给合伙企业或者其他合伙人造成损失的，依法承担赔偿责任。</p>' +
        '<p class="ti"><span class="fwb">第四十一条&nbsp;&nbsp;</span>合伙人违反合伙协议的约定，从事与本合伙企业相竞争的业务或者与本合伙企业进行交易的，该收益归合伙企业所有；给合伙企业或者其他合伙人造成损失的，依法承担赔偿责任。</p>' +
        '<p class="ti"><span class="fwb">第四十二条&nbsp;&nbsp;</span>清算人未依照本法规定向企业登记机关报送清算报告，或者报送清算报告隐瞒重要事实，或者有重大遗漏的，由此产生的费用和损失，由清算人承担和赔偿。 </p>' +
        '<div class="xy_cont_title">第十三章 其他事项 </div>' +
        '<p class="ti"><span class="fwb">第四十三条&nbsp;&nbsp;</span>经全体合伙人协商一致可以修改或者补充合伙协议。</p>' +
        '<p class="ti"><span class="fwb">第四十四条&nbsp;&nbsp;</span>本协议由合伙人各持一份，并报合伙企业登记机关一份。</p>' +
        '<p class="ti">本协议未尽事宜，按国家有关规定执行。</p>' +
        '<div class="mt10 tr">全体合伙人签名、盖章：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日 </div>' +
        '<div class="xy_cont_title">有限合伙企业财产份额转让协议 </div>' +
        '<p class="ti">甲方（转让人）： </p>' +
        '<p class="ti">乙方（受让人）：</p>' +
        '<p class="ti">甲方持有______________合伙企业（有限合伙）财产份额（财产份额股权代码（*********）_______份，根据《中华人民共和国合伙企业法》、《合同法》、《_______合伙企业（有限合伙）合伙协议》及其他有关法律、行政法规的规定，甲乙双方本着平等自愿的原则制订本协议： </p>' +
        '<p class="ti">第一条 甲方同意将持有的财产份额_______份，转让给乙方，转让价格为人民币________元。乙方同意按本条前述价格购买本协议项下甲方持有并愿意转让的财产份额。</p>' +
        '<p class="ti">第二条 乙方受让甲方的财产份额后，即成为本合同项下所属的合伙企业的新有限合伙人，乙方同意遵守甲方签订的有限合伙协议，并继承甲方在前述合伙企业中作为有限合伙人的全部权利、义务、责任和债务。 </p>' +
        '<p class="ti">第三条 本合同为电子合同，一经双方交易确认、资金交割即可生效。 双方同意遵守国家法律法规，自行缴纳因本协议产生的各项税费。</p>' +
        '<p class="ti">第四条 本协议生效后甲方在前述合伙企业中所持有的财产份额所对应的权利、责任、义务、债务，全部归属乙方，乙方拥有再次向他人转让本协议项下合伙企业份额资产的权利。 </p>' +
        '<p class="ti">第五条 本协议甲乙双方若通过电子盘实施交易，电子盘交易一旦确认，本协议即刻生效。 </p>' +
        '<p class="ti">甲方：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;乙方：</p>' +
        '<p class="ti">日期：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;日期：</p>'
    }
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
          Math.round(currentMinute / 30) * 30 - minutePeriods[0].start - 60;
        break;
      case MinuteFixType.Noon:
        // 设置为下午开盘之前 2 分钟
        this._minuteOffset = currentMinute - minutePeriods[1].start + 2;
        break;
      case MinuteFixType.Afternoon:
        // 设置为下午开盘后一小时左右。
        this._minuteOffset =
          Math.round(currentMinute / 30) * 30 - minutePeriods[1].start - 60;
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
      throw 'tradingTime setting error!';
    }

    this.tradingTime.forEach(({ start, end }) => {
      // 注意此处需要将 start 的检测放在后面，
      // 这样下面才可以直接使用 RegExp.$1 与 RegExp.$2 。
      if (!regTime.test(end) || !regTime.test(start) || start > end) {
        throw 'tradingTime setting error!';
      }

      let hour = +RegExp.$1;
      let minute = +RegExp.$2;
      dateMoment.hours(hour);
      dateMoment.minutes(minute);

      let timeString;
      while ((timeString = dateMoment.format('HH:mm')) <= end) {
        timeArray.push(timeString);
        dateMoment.add(1, 'minutes');
      }

      const startMinutes = hour * 60 + minute + this.TO_UTC_MINUTES_OFFSET;
      const endMinutes =
        dateMoment.hours() * 60 +
        dateMoment.minutes() -
        1 +
        this.TO_UTC_MINUTES_OFFSET;
      minutePeriods.push({
        start: startMinutes,
        end: endMinutes
      });
    });

    this._tradingTimeArray = timeArray;
    this._tradingMinutePeriods = minutePeriods;

    console.log('inittradetime:', timeArray);
  }

  private initBetsTitle() {
    for (let i = 5; i >= -5; i--) {
      if (i === 0) {
        continue;
      }

      this._betsTitle.push(`${i > 0 ? '卖' : '买'}${Math.abs(i)}`);
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
        str
      )
    ) {
      return 0;
    } else if (/^1[34578]\d{9}$/.test(str)) {
      return 1;
    } else {
      return 2;
    }
  }
}
