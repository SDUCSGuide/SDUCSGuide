# 技术手册

这里是指南的技术手册，主要涉及指南目前采用的技术内容，欢迎指正我们的错误和补充优秀内容

## 结构

指南的文件为以下结构
```
.
├── docs                    文档主目录
|   ├──.vitepress           VitePress 的配置目录
│   ├── assets              文档用到的图片文件
│   ├── CONTRIBUTORS.md     脚本生成的中间文件，为贡献者列表
│   ├── geCon.js            生成贡献者列表的脚本
│   ├── guideManual.md      本技术手册
│   ├── index.md            主页内容
│   ├── join.md             贡献指南
│   ├── pages               所有文档
│   └── public              打包后复制到跟路径的资源文件
├── node_modules            通过 npm 安装的依赖包
├── package.json            项目配置和依赖声明
├── package-lock.json       锁定项目依赖的具体版本
└── README.md               github 的 README 界面
```

修改的配置都存于`.vitepress`文件夹中，因此再介绍下这个文件夹的内容
```
.
├── cache
├── config.mts    主配置文件，定义网站的导航栏、侧边栏、logo、语言、主题
├── generateSidebar.js      根据文件的标题自动生成侧边栏脚本
├── plugins                 插件（目前无）
└── theme                   基于官方主题的配置文件
    ├── components          自定义 vue 组件
    ├── custom.css          自定义 CSS 样式
    ├── index.ts            主题主入口，注册组件、样式
    ├── my-fonts.css        字体配置
    └── style.css           CSS 样式默认配置
```


## 已有的优化工作

- 更流畅的侧边栏展开动画与更美观的选中效果，在`index.ts`文件中借助`waitForSidebarItems()`函数为侧边栏附加展开事件，使得自动展开需要的高度，动画和样式借助`custom.css`和`style.css`进行调整

- 加入了自动生成侧边栏的脚本，可以根据每个文档标题生成左侧目录中的名称

- 借助 `github token` 获取贡献者列表来及时更新贡献者名单

- 格式化文档内容和代码

- 固定右侧滚动条防止页面跳动

## 本地运行 `VitePress` 进行开发

进入 `docs` 文件夹，执行命令 `npm run docs: dev`，如果缺少相关依赖，可以执行 `npm install` 或 `npm install --dev` 进行安装。运行起来之后进入本地的站点就可以访问

## 格式化所有内容

### `prettier` 格式化

已经加入 `prettier` 格式化脚本自动在每次部署时格式化

### 盘古格式化

借助 `VSCode` 的 `Pangu-Markdown-VSCode` 对发布的页面进行重新排版，使得中英文之间空格更加美观，这个空格叫盘古之白。但有一个小的 bug，如果加粗内容以右括号结尾会导致加粗失败且显示 `*`，因此推荐使用后搜索 ` ) *` 将其替换为 ` )*`

排版后记得检查渲染后页面是否有错误，如图片不能加载、出现不该有的符号等等

## 分支问题

分支不一致解决方式
-   当遇到分支不一致时，首先切换到本地目标分支 ( 这里用 main 作演示 ) `git checkout main`，拉取远程仓库最新代码 `git pull origin main`
-   如果没有冲突的地方，可以直接 `git pull --rebase` 后进行提交
-   如果遇到冲突就需要借助 `git merge origin/main` 操作合并，其中 `origin/main` 为远程分支名称
-   如果遇到无法自动合并的文件，可以使用 `git diff` 查找相关文件，会一一显示需要手动合并冲突的文件
-   通常展示为以下格式
```
<<<<<<< HEAD
 ( 你本地的代码 )
=======
 ( 远程的代码 )
>>>>>>> origin/main
```
-   找到无法自动合并的文件手动合并，合并冲突后的文件需要手动再次 `add` 一遍并且 `commit`
-   此时就可以合并掉冲突，推送到仓库即可

回退分支解决方式
-   当想要回退分支时，`git log` 查看日志，选择想要回退分支的编号
-   `git reset --hard XXXXX` 其中 `hard` 表示删掉回退节点后的提交，换为 `soft` 则表示不删去回退节点后的提交

## TODO List

-   借助 `pangu` 脚本自动应用中英文格式化
-   统一资源文件命名格式
-   路由重写
-   优化贡献者列表
-   设置图片路径的脚本
-   现有脚本的整理
