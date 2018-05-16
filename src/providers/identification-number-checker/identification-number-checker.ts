import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the IdentificationNumberCheckerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class IdentificationNumberCheckerProvider {

	//前面是校验护照、身份证，后面有校验全球手机号
	constructor() {}

	//验证护照是否正确
	checkPassport(str){
		var Expression=/^[a-zA-Z0-9]{5,17}$/;
 		
		if(Expression.test(str)==true){
			return true;
		}else{
			return false;
		} 
	};
	
	checkIdCardNo(e) {
		//15位和18位身份证号码的基本校验
		var check = /^\d{15}|(\d{17}(\d|x|X))$/.test(e);
		if (!check) return false;
		//判断长度为15位或18位
		if (e.length == 15) {
			return this.check15IdCardNo(e);
		} else if (e.length == 18) {
			return this.check18IdCardNo(e);
		} else {
			return false;
		}
	}
	//校验15位的身份证号码
	check15IdCardNo(e) {
		//15位身份证号码的基本校验
		var check = /^[1-9]\d{7}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}$/.test(
			e
		);
		if (!check) return false;
		//校验地址码
		var addressCode = e.substring(0, 6);
		check = this.checkAddressCode(addressCode);
		if (!check) return false;
		var birDayCode = '19' + e.substring(6, 12);
		//校验日期码
		return this.checkBirthDayCode(birDayCode);
	}

	//校验18位的身份证号码
	check18IdCardNo(e) {
		//18位身份证号码的基本格式校验
		var check = /^[1-9]\d{5}[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}(\d|x|X)$/.test(
			e
		);
		if (!check) return false;
		//校验地址码
		var addressCode = e.substring(0, 6);
		check = this.checkAddressCode(addressCode);
		if (!check) return false;
		//校验日期码
		var birDayCode = e.substring(6, 14);
		check = this.checkBirthDayCode(birDayCode);
		if (!check) return false;
		//验证校检码
		return this.checkParityBit(e);
	}

	checkAddressCode(e) {
		var check = /^[1-9]\d{5}$/.test(e);
		if (!check) return false;
		if (this.provinceAndCitys[parseInt(e.substring(0, 2))]) {
			return true;
		} else {
			return false;
		}
	}

	checkBirthDayCode(birDayCode) {
		var check = /^[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))$/.test(
			birDayCode
		);
		if (!check) return false;
		var yyyy = parseInt(birDayCode.substring(0, 4), 10);
		var mm = parseInt(birDayCode.substring(4, 6), 10);
		var dd = parseInt(birDayCode.substring(6), 10);
		var xdata = new Date(yyyy, mm - 1, dd);
		if (xdata > new Date()) {
			return false; //生日不能大于当前日期
		} else if (
			xdata.getFullYear() == yyyy &&
			xdata.getMonth() == mm - 1 &&
			xdata.getDate() == dd
		) {
			return true;
		} else {
			return false;
		}
	}

	provinceAndCitys = {
		11: '北京',
		12: '天津',
		13: '河北',
		14: '山西',
		15: '内蒙古',
		21: '辽宁',
		22: '吉林',
		23: '黑龙江',
		31: '上海',
		32: '江苏',
		33: '浙江',
		34: '安徽',
		35: '福建',
		36: '江西',
		37: '山东',
		41: '河南',
		42: '湖北',
		43: '湖南',
		44: '广东',
		45: '广西',
		46: '海南',
		50: '重庆',
		51: '四川',
		52: '贵州',
		53: '云南',
		54: '西藏',
		61: '陕西',
		62: '甘肃',
		63: '青海',
		64: '宁夏',
		65: '新疆',
		71: '台湾',
		81: '香港',
		82: '澳门',
		91: '国外'
	};

	checkParityBit(e) {
		var parityBit = e.charAt(17).toUpperCase();
		if (this.getParityBit(e) == parityBit) {
			return true;
		} else {
			return false;
		}
	}

	getParityBit(idCardNo) {
		var id17 = idCardNo.substring(0, 17);

		var power = 0;
		for (var i = 0; i < 17; i++) {
			power += parseInt(id17.charAt(i), 10) * parseInt(this.powers[i]);
		}

		var mod = power % 11;
		return this.parityBit[mod];
	}

	powers = [
		'7',
		'9',
		'10',
		'5',
		'8',
		'4',
		'2',
		'1',
		'6',
		'3',
		'7',
		'9',
		'10',
		'5',
		'8',
		'4',
		'2'
	];
	parityBit = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];


// 国家/地区		语言代码	国家/地区			语言代码
// 简体中文(中国)	zh-cn		繁体中文(台湾地区)	zh-tw
// 繁体中文(香港)	zh-hk		英语(香港)			en-hk
// 英语(美国)		en-us		英语(英国)			en-gb
// 英语(全球)		en-ww		英语(加拿大)		en-ca
// 英语(澳大利亚)	en-au		英语(爱尔兰)		en-ie
// 英语(芬兰)		en-fi		芬兰语(芬兰)		fi-fi
// 英语(丹麦)		en-dk		丹麦语(丹麦)		da-dk
// 英语(以色列)		en-il		希伯来语(以色列)	he-il
// 英语(南非)		en-za		英语(印度)			en-in
// 英语(挪威)		en-no		英语(新加坡)		en-sg
// 英语(新西兰)		en-nz		英语(印度尼西亚)	en-id
// 英语(菲律宾)		en-ph		英语(泰国)			en-th
// 英语(马来西亚)	en-my		英语(阿拉伯)		en-xa
// 韩文(韩国)		ko-kr		日语(日本)			ja-jp
// 荷兰语(荷兰)		nl-nl		荷兰语(比利时)		nl-be
// 葡萄牙语(葡萄牙)	pt-pt		葡萄牙语(巴西)		pt-br
// 法语(法国)		fr-fr		法语(卢森堡)		fr-lu
// 法语(瑞士)		fr-ch		法语(比利时)		fr-be
// 法语(加拿大)		fr-ca		西班牙语(拉丁美洲)	es-la
// 西班牙语(西班牙)	es-es		西班牙语(阿根廷)	es-ar
// 西班牙语(美国)	 es-us		西班牙语(墨西哥)	es-mx
// 西班牙语(哥伦比亚)es-co		西班牙语(波多黎各)	es-pr
// 德语(德国)		de-de		德语(奥地利)		de-at
// 德语(瑞士)		de-ch		俄语(俄罗斯)		ru-ru
// 意大利语(意大利)	it-it		希腊语(希腊)		el-gr
// 挪威语(挪威)		no-no		匈牙利语(匈牙利)	hu-hu
// 土耳其语(土耳其)	tr-tr		捷克语(捷克共和国)	cs-cz
// 斯洛文尼亚语		sl-sl		波兰语(波兰)		pl-pl
// 瑞典语(瑞典)		sv-se		西班牙语(智利)
	private _PHONES_AND_EMAIL_EXP = {
		"ar-DZ": /^(\+?213|0)(5|6|7)\d{8}$/,
		"ar-SY": /^(!?(\+?963)|0)?9\d{8}$/,
		"ar-SA": /^(!?(\+?966)|0)?5\d{8}$/,
		"en-US": /^(\+?1)?[2-9]\d{2}[2-9](?!11)\d{6}$/,
		"cs-CZ": /^(\+?420)? ?[1-9][0-9]{2} ?[0-9]{3} ?[0-9]{3}$/,
		"de-DE": /^(\+?49[ \.\-])?([\(]{1}[0-9]{1,6}[\)])?([0-9 \.\-\/]{3,20})((x|ext|extension)[ ]?[0-9]{1,4})?$/,
		"da-DK": /^(\+?45)?(\d{8})$/,
		"el-GR": /^(\+?30)?(69\d{8})$/,
		"en-AU": /^(\+?61|0)4\d{8}$/,
		"en-GB": /^(\+?44|0)7\d{9}$/,
		"en-HK": /^(\+?852\-?)?[569]\d{3}\-?\d{4}$/,
		"en-IN": /^(\+?91|0)?[789]\d{9}$/,
		"en-NZ": /^(\+?64|0)2\d{7,9}$/,
		"en-ZA": /^(\+?27|0)\d{9}$/,
		"en-ZM": /^(\+?26)?09[567]\d{7}$/,
		"es-ES": /^(\+?34)?(6\d{1}|7[1234])\d{7}$/,
		"fi-FI": /^(\+?358|0)\s?(4(0|1|2|4|5)?|50)\s?(\d\s?){4,8}\d$/,
		"fr-FR": /^(\+?33|0)[67]\d{8}$/,
		"he-IL": /^(\+972|0)([23489]|5[0248]|77)[1-9]\d{6}/,
		"hu-HU": /^(\+?36)(20|30|70)\d{7}$/,
		"it-IT": /^(\+?39)?\s?3\d{2} ?\d{6,7}$/,
		"ja-JP": /^(\+?81|0)\d{1,4}[ \-]?\d{1,4}[ \-]?\d{4}$/,
		"ms-MY": /^(\+?6?01){1}(([145]{1}(\-|\s)?\d{7,8})|([236789]{1}(\s|\-)?\d{7}))$/,
		"nb-NO": /^(\+?47)?[49]\d{7}$/,
		"nl-BE": /^(\+?32|0)4?\d{8}$/,
		"nn-NO": /^(\+?47)?[49]\d{7}$/,
		"pl-PL": /^(\+?48)? ?[5-8]\d ?\d{3} ?\d{2} ?\d{2}$/,
		"pt-BR": /^(\+?55|0)\-?[1-9]{2}\-?[2-9]{1}\d{3,4}\-?\d{4}$/,
		"pt-PT": /^(\+?351)?9[1236]\d{7}$/,
		"ru-RU": /^(\+?7|8)?9\d{9}$/,
		"sr-RS": /^(\+3816|06)[- \d]{5,9}$/,
		"tr-TR": /^(\+?90|0)?5\d{9}$/,
		"vi-VN": /^(\+?84|0)?((1(2([0-9])|6([2-9])|88|99))|(9((?!5)[0-9])))([0-9]{7})$/,
		"zh-CN": /^(\+?0?86\-?)?1[345789]\d{9}$/,
		"zh-TW": /^(\+?886\-?|0)?9\d{8}$/,
		"email": /^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/
	  };

	  checkIphone(iphone){
		let validation = false;
		if(!iphone) return false
		for( let iphoneExp in this._PHONES_AND_EMAIL_EXP){
			validation = this._PHONES_AND_EMAIL_EXP[iphoneExp].test(iphone);
			if(validation) break;
		}
		return validation;
	  }
} 
