import { Component, Input } from '@angular/core';

@Component({
  selector: 'bn-header',
  templateUrl: 'bn-header.html'
})
export class BnHeaderComponent {

  @Input()
  headerTitle: string;

  constructor() {

  }

}
