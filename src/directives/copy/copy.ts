import { Directive, ElementRef, OnInit, Input } from "@angular/core";
import * as Clipboard from "clipboard";
/**
 * Generated class for the CopyDirective directive.
 *
 * See https://angular.io/api/core/Directive for more info on Angular
 * Directives.
 */
@Directive({
  selector: "[copy]" // Attribute selector
})
export class CopyDirective implements OnInit {
  constructor(public elementRef: ElementRef) {}
  @Input("copy")text =""
  clip: any;
  ngOnInit() {
    this.clip = new Clipboard(this.elementRef.nativeElement, {
      text: ()=>this.text
    });
  }
}
