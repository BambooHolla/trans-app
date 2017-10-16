import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the TimespanPipe pipe.
 *
 * See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 * Angular Pipes.
 */
@Pipe({
  name: 'timespanPipe',
})
export class TimespanPipe implements PipeTransform {
  /**
   * change the datetime to the time span from now.
   */
  transform(dateTime: Date, ...args):string {
    //数据存在性判断.
    if (!dateTime){
      return "未知时间"
    }

    const now = new Date();
    let timespan = now.getTime() - dateTime.getTime();
    let tmpDate: Date = new Date();
    
    //TODO:bugfix now的时间不是传入数值的时间,导致有些情况下处理异常
    // console.log('timespan: ', dateTime.getTime())
    // console.log('timespan:now ', now.getTime())

    const year = 1000 * 60 * 60 * 24 * 365;
    const month = 1000 * 60 * 60 * 24 * 30;
    const day = 1000 * 60 * 60 * 24;
    const hour = 1000 * 60 * 60;
    const minute = 1000 * 60;  

    if(timespan < 0){
      return `${dateTime.getFullYear()}-${dateTime.getMonth() + 1}-${dateTime.getDate()} ${dateTime.getHours() > 10 ? dateTime.getHours() : "0" + dateTime.getHours()}:${dateTime.getMinutes() > 10 ? dateTime.getMinutes() : "0" + dateTime.getMinutes()}`;
    } else if (timespan > year) {      
      return Math.floor(timespan / year) + "年前";
    } else if (timespan > month) {      
      return Math.floor(timespan / month) + "月前";
    } else if (timespan > 2*day) {
      //以时间或日期计算存在中间相交情况,故有以下判断
      if (tmpDate.setDate(now.getDate() - 2) && tmpDate.getDate() === dateTime.getDate()) {
        return `前天 ${dateTime.getHours() > 10 ? dateTime.getHours() : "0" + dateTime.getHours()}:${dateTime.getMinutes() > 10 ? dateTime.getMinutes() : "0" + dateTime.getMinutes()}`;
      }else{
        return Math.floor(timespan / day) + "天前";
      }
    } else if (tmpDate.setDate(now.getDate() - 2) && tmpDate.getDate() === dateTime.getDate()) {      
      return `前天 ${dateTime.getHours() > 10 ? dateTime.getHours() : "0" + dateTime.getHours()}:${dateTime.getMinutes() > 10 ? dateTime.getMinutes() : "0" + dateTime.getMinutes()}`;
    } else if (tmpDate.setDate(now.getDate() - 1) && tmpDate.getDate() === dateTime.getDate()) {            
      return `昨天 ${dateTime.getHours() > 10 ? dateTime.getHours() : "0" + dateTime.getHours()}:${dateTime.getMinutes() > 10 ? dateTime.getMinutes() : "0" + dateTime.getMinutes()}`;
    } else if (now.getDate() === dateTime.getDate()) {
      if(timespan < minute){
        return "刚刚";
      } else if (timespan < hour) {
        return Math.floor(timespan / minute) + "分钟前";
      }else{
        return `今天 ${dateTime.getHours() > 10 ? dateTime.getHours() : "0" + dateTime.getHours()}:${dateTime.getMinutes() > 10 ? dateTime.getMinutes() : "0" + dateTime.getMinutes()}`;
      }
    }else{
      return dateTime.toString();
    }
    
    // if(timespan<0){
    //   return `${dateTime.getFullYear()}-${dateTime.getMonth()}-${dateTime.getDate()} ${dateTime.getHours() > 10 ? dateTime.getHours() : "0" + dateTime.getHours()}:${dateTime.getMinutes() > 10 ? dateTime.getMinutes() : "0" + dateTime.getMinutes()}`;
    // } else if (timespan < day){
      
    // } else {
    //   console.log("else")
    //   return dateTime.toString();
    // }
  }
}
