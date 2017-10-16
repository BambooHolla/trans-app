import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[liked]' // Attribute selector
})
export class LikedDirective {
  
  constructor(private el: ElementRef) { }

  @Input('liked')
  set redFont(value) {
    if (value) {
      this.el.nativeElement.style.color = "#ea3333";
      this.el.nativeElement.getElementsByClassName('thumb')[0].style.backgroundColor = "#ea3333";
    } else {
      this.el.nativeElement.style.color = "#fff";
      this.el.nativeElement.getElementsByClassName('thumb')[0].style.backgroundColor = "#fff";      
    }
  }
}
