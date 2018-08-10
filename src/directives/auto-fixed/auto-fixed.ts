import { Directive, ElementRef, OnInit, Input, HostListener, Renderer2 } from "@angular/core";
import { Content, ScrollEvent } from "ionic-angular";

@Directive({
    selector: '[auto-fixed]'
})
export class AutoFixedDirective {
    // 元素距离顶部的原始距离
    toTop: number = 0;
    // 吸顶元素
    toTopElement: any;
    // 吸顶元素id
    @Input('auto-fixed') selector: string = '';
    // 吸顶元素的高度
    toHeight:number = 0;
    // title元素
    titleElement: any;
    // title元素的高度
    titleElementHegiht:number = 0;
    // 新闻轮播图元素
    newsElement: any;
    // 新闻轮播图元素的高度
    newsElementHeight:number = 0;
    // 公告元素
    noticeElement: any;
    // 公告元素的高度
    noticeElementHeight: number = 0;
    constructor(private er: ElementRef, private content: Content, private renderer2: Renderer2) {
        
        setTimeout(() => {
            // 吸顶元素
            this.toTopElement = this.er.nativeElement.querySelector('#' + this.selector);
            this.toTop = this.toTopElement.offsetTop;
            this.toHeight = this.toTopElement.offsetHeight
            // title元素
            this.titleElement = document.querySelector('#fixedElement-title');
            this.titleElementHegiht = this.titleElement.offsetHeight;
            // 新闻轮播元素
            this.newsElement = this.er.nativeElement.querySelector('.news-slides');
            this.newsElementHeight = this.newsElement.offsetHeight;
             // 公告元素
             this.noticeElement = this.er.nativeElement.querySelector('.notice-box');
             this.noticeElementHeight = this.noticeElement.offsetHeight;
            //  this.noticeElement = this.er.nativeElement.querySelector('page-quotations-v2 .scroll-content');
            //  this.renderer2.setStyle(this.noticeElement,'padding-bottom',this.noticeElementHeight + this.newsElementHeight+'px')
            //  debugger
        }, 100);
        this.content.ionScroll.subscribe((scrollEvent: ScrollEvent) => {
            // 吸顶元素的下一个元素
            const nextElement = this.er.nativeElement.querySelector('.fixedElement-margin-top')
            // 顶部title 元素
            
            if (scrollEvent.scrollTop >= (this.toTop - this.titleElementHegiht)) {
                this.renderer2.setStyle(this.toTopElement, 'position', 'fixed');
                this.renderer2.setStyle(this.toTopElement, 'top', (this.titleElementHegiht-1.4) + "px");
                this.renderer2.setStyle(nextElement,'margin-top',this.toHeight + 'px')
                this.renderer2.setStyle(this.titleElement,"opacity",'1');
            } else {
                this.renderer2.setStyle(this.toTopElement, 'position', 'static');
                this.renderer2.setStyle(nextElement,'margin-top','1px')
                this.renderer2.setStyle(this.titleElement,"opacity",(scrollEvent.scrollTop/(this.toTop - this.titleElementHegiht)));
                if(!scrollEvent.scrollTop) {
                    this.renderer2.setStyle(this.titleElement,"visibility",'hidden');
                } else {
                    this.renderer2.setStyle(this.titleElement,"visibility",'visible');
                }
            }
           
        })
    }

}