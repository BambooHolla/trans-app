## 工作原理

[list-ani]绑定在**ele**上，指令的动画对象固定是`ele.children`，;

吴祖贤说兼容性从IOS 9+开始兼容，所以现在另外写一个基于MutationObserver的实现。而且动画的进度会更为合理，因为是根据最后一个动画的Item来确定下一个动画的开始时间。

~在使用中，子元素必须有`#aniItem`的标志，从而可以通过`@ContentChildren("aniItem") contentEles: QueryList<any>`取得。并且通过`contentEles.changes.subscribe`来监听子元素变动。~

~这部分工作本来是可以通过使用`MutationObserver`接口来监听子元素变动来实现，但是考虑到其兼容性与Angular的兼容性不一致，故所用了以上比较不合理的实现方式。~

~后期如果确定了safari兼容的版本等级，可行的情况下（[6.1+](https://caniuse.com/#search=MutationObserver)）就可以改进这个插件。~

## ChangeLog

