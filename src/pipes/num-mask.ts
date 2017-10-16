import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the  pipe.
 *
 * See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 * Angular Pipes.
 */
@Pipe({
  name: 'numMask',
})
export class NumMaskPipe implements PipeTransform {
  transform(value: any, left = 3, right = 4) {
    if (value === undefined || value === null) return value

      value = value.toString();
      let span = value.length - left - right;
      if(span <= 0 || left < 0 || right < 0){
        return value;
      } else {
        return value.slice(0, left) + '*'.repeat(span) + 
          (right > 0 ? value.slice(-right) : '');
      }
  }
}
