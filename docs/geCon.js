const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
  REPO_OWNER: 'SDUCSGuide',
  REPO_NAME: 'SDUCSGuide',
  OUTPUT_FILE: 'CONTRIBUTORS.md',
  INDEX_FILE: 'index.md',
  AVATAR_SIZE: 50, // 统一头像大小
};

// 手动添加的贡献者（非 GitHub 用户或使用本地头像的）
const MANUAL_CONTRIBUTORS = [
  {
    name: 'Jo',
    avatar: './assets/Jo-de-tou.png',
    link: null, // 如果有链接可以填写
  },
  {
    name: 'rucz',
    avatar: './assets/rucz.jpg',
    link: null,
  },
];

// 获取 GitHub 贡献者
const getGitHubContributors = async () => {
  const url = `https://api.github.com/repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/contributors`;
  
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': CONFIG.GITHUB_TOKEN ? `token ${CONFIG.GITHUB_TOKEN}` : '',
        'Accept': 'application/vnd.github.v3+json',
      },
      timeout: 10000,
      proxy: false,
    });
    
    return response.data.map(contributor => ({
      name: contributor.login,
      avatar: contributor.avatar_url,
      link: contributor.html_url,
      contributions: contributor.contributions,
    }));
  } catch (error) {
    console.error('❌ 获取 GitHub 贡献者失败:', error.message);
    if (error.response) {
      console.error('   状态码:', error.response.status);
      console.error('   提示:', error.response.status === 403 ? 'API 限流，请添加 GITHUB_TOKEN' : '');
    }
    return [];
  }
};

// 生成单个头像的 HTML
const generateAvatarHTML = (contributor) => {
  const { name, avatar, link } = contributor;
  const imgTag = `<img src="${avatar}" alt="${name}" style="width: ${CONFIG.AVATAR_SIZE}px; height: ${CONFIG.AVATAR_SIZE}px; border-radius: 50%;"/>`;
  
  return `
<div style="margin: 2px;">
  ${link ? `<a href="${link}">` : '<a>'}
    ${imgTag}
  </a>
</div>`;
};

// 生成完整的 Markdown 内容
const generateMarkdown = (allContributors) => {
  let content = '<div style="display: flex; flex-wrap: wrap;">\n';
  
  allContributors.forEach(contributor => {
    content += generateAvatarHTML(contributor);
  });
  
  content += '\n</div>\n';
  return content;
};

// 更新 index.md 文件中的贡献者部分
const updateIndexFile = (contributorsHTML) => {
  const indexPath = path.join(__dirname, CONFIG.INDEX_FILE);
  
  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.md 文件不存在');
    return false;
  }
  
  let content = fs.readFileSync(indexPath, 'utf-8');
  
  // 匹配贡献者部分的开始和结束标记
  const startMarker = '<div style="display: flex; flex-wrap: wrap;">';
  const endMarker = '</div>';
  
  const startIndex = content.indexOf('## 贡献者');
  if (startIndex === -1) {
    console.error('❌ 未找到"## 贡献者"标记');
    return false;
  }
  
  // 找到贡献者部分的 div 开始和结束位置
  const divStartIndex = content.indexOf(startMarker, startIndex);
  if (divStartIndex === -1) {
    console.error('❌ 未找到起始 div 标签');
    return false;
  }
  
  // 找到对应的结束 div（需要匹配最外层的）
  let divEndIndex = divStartIndex;
  let depth = 0;
  let found = false;
  
  while (divEndIndex < content.length && !found) {
    const nextStart = content.indexOf('<div', divEndIndex + 1);
    const nextEnd = content.indexOf('</div>', divEndIndex + 1);
    
    if (nextEnd === -1) break;
    
    if (nextStart !== -1 && nextStart < nextEnd) {
      depth++;
      divEndIndex = nextStart;
    } else {
      if (depth === 0) {
        divEndIndex = nextEnd + 6; // 6 是 '</div>' 的长度
        found = true;
      } else {
        depth--;
        divEndIndex = nextEnd;
      }
    }
  }
  
  if (!found) {
    console.error('❌ 未找到匹配的结束 div 标签');
    return false;
  }
  
  // 替换内容
  const newContent = 
    content.substring(0, divStartIndex) + 
    contributorsHTML + 
    content.substring(divEndIndex);
  
  fs.writeFileSync(indexPath, newContent, 'utf-8');
  return true;
};

// 主函数
const main = async () => {
  console.log('🚀 开始生成贡献者列表...\n');
  
  // 获取 GitHub 贡献者
  console.log('📡 正在从 GitHub API 获取贡献者...');
  const githubContributors = await getGitHubContributors();
  console.log(`✅ 获取到 ${githubContributors.length} 位 GitHub 贡献者\n`);
  
  // 合并手动添加的贡献者（放在最前面）
  const allContributors = [...MANUAL_CONTRIBUTORS, ...githubContributors];
  console.log(`📊 总共 ${allContributors.length} 位贡献者\n`);
  
  // 生成 Markdown 内容
  const contributorsHTML = generateMarkdown(allContributors);
  
  // 保存到 CONTRIBUTORS.md（中间文件）
  fs.writeFileSync(CONFIG.OUTPUT_FILE, contributorsHTML, 'utf-8');
  console.log(`✅ 已生成 ${CONFIG.OUTPUT_FILE}`);
  
  // 更新 index.md
  if (updateIndexFile(contributorsHTML)) {
    console.log(`✅ 已更新 ${CONFIG.INDEX_FILE}`);
  } else {
    console.log(`⚠️  更新 ${CONFIG.INDEX_FILE} 失败，请手动复制内容`);
  }
  
  console.log('\n✨ 完成！');
};

main();