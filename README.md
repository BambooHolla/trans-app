## 代码风格格式化

在上传代码的时候建议将代码统一风格格式化
建议运行`npm run format:diff`来统一风格格式化那些变动的、新增的文件。
在release的时候，运行`npm run fotmat:all`来格式化所有文件。

## git 

多人进行项目操作，使用`git checkout -b <name>`创建一个属于你的分支，操作完成需要合并到`develop`分支，后上传到`develop`分支。
其中完整过程如：
1. `git checkout -b <name>`,创建并切换到你的分支
2. `git add .`,保存改动
3. `git checkout develop` -> `git pull origin develop`，拉取最新项目代码
4. `git checkout <name>`  -> `git rebase develop`，切回你的分支，将最新的项目代码合到你的分支
5. （冲突解决）`git rebase develop`的过程中可能会有冲突，需解决冲突，不能跳过
6. `git commit -m "..."` （`git push origin <name>`），缓存改动，如果你想保存你的分支内容，最好也上传一份
7. `git checkout develop` -> `git merge --no-ff <name>`，合并分支
8. `git push origin develop`，上传

## 关于android签名


