/*
    该脚本用于自动根据内容生成目录，根据pages下的内容生成
*/
import path from 'node:path';
import fs from 'node:fs';
// 文件根目录
const DIR_PATH = path.resolve();
// 白名单,过滤不是文章的文件和文件夹
const WHITE_LIST = [
  'index.md',
  '.vitepress',
  'node_modules',
  '.idea',
  'public',
  '.gitbook',
  'join.md',
];

// 判断是否是文件夹
const isDirectory = (path) => fs.lstatSync(path).isDirectory();

// 取差值
const intersections = (arr1, arr2) =>
  Array.from(new Set(arr1.filter((item) => !new Set(arr2).has(item))));

// 获取.md文件的一级标题
function extractTitleFromMarkdown(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  for (const line of lines) {
    const match = line.match(/^# (.+)/);
    if (match) return match[1].trim();
  }

  // 如果没有找到一级标题，就用文件名代替
  return path.basename(filePath, '.md');
}

// 把方法导出直接使用
function getList(params, path1, pathname) {
  // 存放结果
  const res = [];
  // 开始遍历params
  for (let file in params) {
    // 拼接目录
    const dir = path.join(path1, params[file]);
    // 判断是否是文件夹
    const isDir = isDirectory(dir);
    if (isDir) {
      // 如果是文件夹,读取之后作为下一次递归参数
      const files = fs.readdirSync(dir);
      const readmeDir = path.join(dir, '/README.md');
      let folderName = params[file];
      let folderPath = undefined;
      const tailname = 'README.md';
      if (fs.existsSync(readmeDir)) {
        folderName = extractTitleFromMarkdown(readmeDir);
        folderPath = `${pathname}/${params[file]}/${tailname}`;
        // console.log(folderPath)
      }
      res.push({
        text: folderName,
        link: folderPath,
        collapsed: true,
        items: getList(files, dir, `${pathname}/${params[file]}`),
      });
    } else {
      // 获取名字
      const name = path.basename(params[file]);
      // 排除非 md 文件
      const suffix = path.extname(params[file]);
      if (suffix !== '.md') {
        continue;
      }
      if (name == 'README.md') {
        continue;
      }
      const filename = extractTitleFromMarkdown(dir);
      // console.log(`${pathname}/${name}`)
      res.push({
        text: filename,
        link: `${pathname}/${name}`,
      });
    }
  }
  return res;
}

export const set_sidebar = (pathname) => {
  // 获取pathname的路径,DIRPATH为/home/zhangshuai/SDUCSGuide，PATHNAME为/docs/pages
  // console.log(DIR_PATH)
  const dirPath = path.join(DIR_PATH, '/docs', pathname);
  // 读取pathname下的所有文件或者文件夹
  const files = fs.readdirSync(dirPath);
  // 过滤掉
  const items = intersections(files, WHITE_LIST);
  // console.log(items)
  // getList 函数后面会讲到
  return getList(items, dirPath, pathname);
};
