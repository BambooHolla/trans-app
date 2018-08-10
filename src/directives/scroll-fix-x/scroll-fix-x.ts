import { Directive, ElementRef, HostListener } from "@angular/core";

/**
 * scrollFixX 指令作用于 ion-scroll 元素上，要求 scroll 的内容使用水平滚动方向。
 * 点击某个子元素时，动态调整水平滚动位置，以便让激活的目标尽量显示在水平居中的位置，
 * 这样可以方便用户操作，并且在元素较多时可以让用户知道后面还有更多元素。
 * scrollLeft 是 DOM 元素的属性（ property ），一般由用户的拖动行为来改变，
 * 不是 css 属性，无法使用 css 动画实现；
 * 浏览器原生的 scrollIntoView() 方法则只能让元素纵向滚动到视口。
 * 因此只能自行实现编程方式的水平位移及动画。
 */
@Directive({
    selector: "ion-scroll[scrollFixX]", // Attribute selector
})
export class ScrollFixXDirective {
    scrollTimer: number = null;

    constructor(private el: ElementRef) {}

    // 使用事件委托方式，监听容器元素（ ion-scroll ）上的点击事件，
    // 而不是监听每个后代元素上的事件。
    @HostListener("click", ["$event.target"])
    onClick(target: HTMLElement) {
        /* ion-scroll 渲染后的层级结构为：
     *
     * <ion-scroll>
     *   <div class="scroll-content">
     *     <div class="scroll-zoom-wrapper">
     *        <-- 子元素列表 -->
     *     </div>
     *   </div>
     * </ion-scroll>
     *
     * 控制滚动的 scrollLeft 属性作用在 .scroll-content 元素上，
     * 而滚动的子元素是 .scroll-zoom-wrapper 元素的子级元素。
     */
        const scrollElem = this.el.nativeElement as HTMLElement;
        const scrollContent = scrollElem.querySelector(
            ".scroll-content",
        ) as HTMLElement;
        // querySelectorAll 的返回值是 NodeList ，不是真正的数组，
        // 需要使用 Array.from() 转换为数组，以便后面使用。
        const items = Array.from(
            scrollElem.querySelectorAll(".scroll-zoom-wrapper > *"),
        ) as HTMLElement[];
        if (!scrollContent || !items.length) {
            return;
        }

        // 从 .scroll-zoom-wrapper 的子级元素中查找匹配的元素，
        // 点击事件的触发目标要么就是某个子元素，要么是某个子元素的后代元素。
        // nodeA.compareDocumentPosition(nodeB) 的结果与 16 进行按位“与”运算，
        // 若计算结果为 16 ，代表 nodeB 元素是 nodeA 元素的后代元素。
        const index: number = items.findIndex(
            item =>
                item === target ||
                (item.compareDocumentPosition(target) & 16) === 16,
        );

        if (index === -1) {
            return;
        }

        const activeItem = items[index];
        const contentWidth = parseFloat(
            window.getComputedStyle(scrollContent).width,
        );
        const originalScrollLeft = scrollContent.scrollLeft;
        // FIXME ：此处样式计算只使用了 width ，而没有考虑 margin 等因素。
        const totalWidth = items.reduce(
            (all, item) =>
                all + parseFloat(window.getComputedStyle(item).width),
            0,
        );
        const prevTotalWidth = activeItem.offsetLeft;
        const currentWidth = parseFloat(
            window.getComputedStyle(activeItem).width,
        );

        const leftSpacing = (contentWidth - currentWidth) / 2;
        // 计算 scrollLeft 的目标值，以便激活的元素能尽量显示在水平居中位置，
        // 并且对计算出的值进行有效性限制。
        const destScrollLeft = Math.min(
            totalWidth - contentWidth,
            Math.max(0, prevTotalWidth - leftSpacing),
        );

        if (originalScrollLeft !== destScrollLeft) {
            const spacing = destScrollLeft - originalScrollLeft;
            let count = 0;

            if (this.scrollTimer) {
                clearInterval(this.scrollTimer);
            }

            // 每 16 毫秒触发一次，一共 20 次，即动画大约延续 0.32 秒。
            this.scrollTimer = setInterval(() => {
                scrollContent.scrollLeft =
                    originalScrollLeft + (spacing * ++count) / 20;
                if (count === 20) {
                    clearInterval(this.scrollTimer);
                    this.scrollTimer = null;
                }
            }, 16);
        }
    }
}
