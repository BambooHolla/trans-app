import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the RiseOrFall pipe.
 *
 * See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 * Angular Pipes.
 */
@Pipe({
  name: 'riseOrFall',
})
export class RiseOrFallPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: number): string {
    // console.log('RiseOrFallPipe:',value)
    if (
      isNaN(value)
      // || Math.abs(value) < 1e-8
      // || Number(value) === 0
    ) {
      return '';
    }

    return value >= 0 ? 'color-rise' : 'color-fall';
  }
}
