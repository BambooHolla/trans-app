## 加密用的特殊字符
# !#%&(@$^*)~_+

# 对于需要启动loading动画,cordova目前无有效插件可供使用，找到修改原生框架生成文件，用原生方法进行修改
> 注：（适用于android，IOS暂无发现）,连接[http://students.ceid.upatras.gr/~besarat/JB/Blog/Entries/2015/3/13_cordova_how_to_create_animated_splashscreen_android.html]
> 最后一步的修改.java文件，需要到./platforms/android/src/com/picaex/app/MainActivity.java修改

## 一键生成启动图  ionic cordova resources --splash
## git 
#### （这里只是列举基本用法，具体分支的创建需观看项目技术文档内的gitflow文档）
多人进行项目操作，使用`git checkout -b <name>`创建一个属于你的分支，操作完成需要合并到`develop`分支，后上传到`develop`分支。
其中完整过程如：
1. `git checkout -b <name>`, 创建并切换到你的分支
2. 改动
3. `git add .`, 保存改动
4. `git checkout develop` -> `git pull origin develop`，拉取最新项目代码
5. `git checkout <name>`  -> `git rebase develop`，切回你的分支，将最新的项目代码合到你的分支
6. （冲突解决）`git rebase develop`的过程中可能会有冲突，需解决冲突，不能跳过
7. `git commit -m "..."` 
8. `git push origin <name>`，保存你的分支内容，上传一份
9. `git checkout develop` -> `git merge --no-ff <name>`，合并分支（merge会覆盖，确认develop是最新的）
10. `git push origin develop`，上传

## 打包
#### 依赖包添加一次就可以
`ionic cordova platform add android/ios`，添加对应依赖包，参考[https://ionicframework.com/docs/cli/cordova/platform/](https://ionicframework.com/docs/cli/cordova/platform/)


* android打包
    > 1. `ionic cordova platform add android`，添加依赖包
    > 2. `npm run ionic:build:android` ，打包

### 长按保存图片（未实现，有说要用，之后又没用到，先放着） 依赖包安装步骤
ionic cordova plugin add cordova-plugin-photo-library --variable PHOTO_LIBRARY_USAGE_DESCRIPTION="To choose photos"
npm install --save @ionic-native/photo-library
Add this plugin to your app's module

### 检查网络状态 安装步骤 （已经实现）
文档(https://ionicframework.com/docs/native/network/)
1. Install the Cordova and Ionic Native plugins:
> $ ionic cordova plugin add cordova-plugin-network-information
> $ npm install --save @ionic-native/network
2. Add this plugin to your app's module

### android8 热更新失败解决
1. https://www.cnblogs.com/wupeng88/p/8567958.html(https://www.cnblogs.com/wupeng88/p/8567958.html)