import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the IdentificationNumberCheckerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class IdentificationNumberCheckerProvider {
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

}
