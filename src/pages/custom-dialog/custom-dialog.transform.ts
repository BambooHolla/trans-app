import { Animation } from "ionic-angular/animations/animation";
import { isPresent } from "ionic-angular/util/util";
import { PageTransition } from "ionic-angular/transitions/page-transition";
import { ViewController, Transition } from "ionic-angular";
import { ElementRef } from "@angular/core";

export class CustomDialogPopIn extends Transition {
  init() {
    super.init();
    const ele: HTMLElement = this.enteringView.pageRef().nativeElement;
    const backdropEle = ele.querySelector("ion-backdrop");
    const backdrop = new Animation(this.plt, backdropEle);
    const wrapper = new Animation(
      this.plt,
      ele.querySelector(".modal-wrapper"),
    );
    const content = new Animation(
      this.plt,
      ele.querySelector(".scroll-content"),
    );
    const dialog_wrapper = new Animation(
      this.plt,
      ele.querySelector(".dialog-wrapper"),
    );

    wrapper.beforeStyles({ opacity: 1, transform: "none" });
    content.fromTo("background-color", "transparent", "rgba(0, 0, 0, 0.6)");

    backdrop.fromTo("opacity", 0.01, 0.4);
    dialog_wrapper.fromTo("scale", 0.6, 1).fromTo("opacity", 0.4, 1);

    this.element(this.enteringView.pageRef())
      .easing("cubic-bezier(0.36,0.66,0.04,1)")
      .duration(400)
      .add(backdrop)
      .add(dialog_wrapper)
      .add(content)
      .add(wrapper);
  }
}

export class CustomDialogPopOut extends Transition {
  init() {
    const ele = this.leavingView.pageRef().nativeElement;
    const backdrop = new Animation(this.plt, ele.querySelector("ion-backdrop"));
    const content = new Animation(
      this.plt,
      ele.querySelector(".scroll-content"),
    );
    const dialog_wrapper = new Animation(
      this.plt,
      ele.querySelector(".dialog-wrapper"),
    );

    content.fromTo("opacity", 0.99, 0);
    dialog_wrapper.fromTo("scale", 1, 0.6);
    backdrop.fromTo("opacity", 0.5, 0);

    this.easing("ease-in-out")
      .duration(200)
      .add(backdrop)
      .add(dialog_wrapper)
      .add(content);
  }
}
