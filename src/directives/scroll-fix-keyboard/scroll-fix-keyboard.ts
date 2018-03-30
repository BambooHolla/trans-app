import { Directive, ElementRef, Renderer2, Input, AfterViewInit } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard';
import { Content } from 'ionic-angular';

/**
 * Generated class for the ScrollFixKeyboardDirective directive.
 *
 * See https://angular.io/api/core/Directive for more info on Angular
 * Directives.
 */
@Directive({
  selector: '[scroll-fix-keyboard]' // Attribute selector
})
export class ScrollFixKeyboardDirective implements AfterViewInit{

  @Input("scroll-fix-keyboard") content: Content;

  constructor(
    private el: ElementRef,
    private keyboard: Keyboard,    
    private renderer2: Renderer2,    
  ) {

  }

  ngAfterViewInit() {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    console.log('Hello ScrollFixKeyboardDirective Directive', this.content);
    this.keyboard.onKeyboardShow()
      .subscribe(() => {
        let position_y = (this.el.nativeElement as HTMLElement).offsetTop;
        const scroll_parent = (this.el.nativeElement as HTMLElement).offsetParent;
        this.content.scrollTo(undefined, position_y, 300)
      })
  }

}
