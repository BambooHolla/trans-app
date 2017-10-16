import { Component, Input } from '@angular/core';

/**
 * Generated class for the RichText component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'rich-text',
  templateUrl: 'rich-text.html'
})
export class RichText {
  @Input() dataSource:object 
  constructor() {

  }

}
