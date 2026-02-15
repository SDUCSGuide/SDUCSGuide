const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 配置
const CONFIG = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
  REPO_OWNER: 'SDUCSGuide',
  REPO_NAME: 'SDUCSGuide',
  OUTPUT_FILE: 'CONTRIBUTORS.md',
  INDEX_FILE: 'index.md',
  AVATAR_SIZE: 50,
};

// 手动添加的贡献者（非 GitHub 用户或使用本地头像的）
const MANUAL_CONTRIBUTORS = [
  {
    name: 'Jo',
    avatar: './assets/Jo-de-tou.png',
    link: null,
  },
  {
    name: 'rucz',
    avatar: './assets/rucz.jpg',
    link: null,
  },
];

// 读取上次的贡献者信息（从 CONTRIBUTORS.md 提取）
const getLastContributorsInfo = () => {
  const filePath = path.join(__dirname, CONFIG.OUTPUT_FILE);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    // 提取所有头像 URL 和用户名，作为指纹
    const avatarMatches = content.matchAll(/src="([^"]+)".*?alt="([^"]+)"/g);
    const contributors = [];
    
    for (const match of avatarMatches) {
      contributors.push({
        avatar: match[1],
        name: match[2],
      });
    }
    
    return contributors;
  } catch (error) {
    return null;
  }
};

// 比较贡献者列表是否有变化（只比较关键信息）
const hasContributorsChanged = (oldList, newList) => {
  if (!oldList || oldList.length !== newList.length) {
    return true;
  }
  
  for (let i = 0; i < newList.length; i++) {
    if (oldList[i].name !== newList[i].name || 
        oldList[i].avatar !== newList[i].avatar) {
      return true;
    }
  }
  
  return false;
};

// 计算字符串的 MD5 哈希
const md5Hash = (str) => {
  return crypto.createHash('md5').update(str).digest('hex');
};

// 规范化 HTML 内容
const normalizeHTML = (html) => {
  return html
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+$/gm, '')  // 移除行尾空格
    .trim();
};

// 获取 GitHub 贡献者（带重试）
const getGitHubContributors = async (retries = 3) => {
  const url = `https://api.github.com/repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/contributors`;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': CONFIG.GITHUB_TOKEN ? `Bearer ${CONFIG.GITHUB_TOKEN}` : '',
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'SDUCSGuide-Contributors-Bot',
        },
        timeout: 15000,
      });
      
      return response.data.map(contributor => ({
        name: contributor.login,
        avatar: contributor.avatar_url,
        link: contributor.html_url,
        contributions: contributor.contributions,
      }));
    } catch (error) {
      console.error(`❌ 尝试 ${i + 1}/${retries} 失败:`, error.message);
      if (error.response) {
        console.error('   状态码:', error.response.status);
        if (error.response.status === 403) {
          console.error('   提示: API 限流，请添加 GITHUB_TOKEN');
        }
      }
      
      if (i < retries - 1) {
        const delay = Math.pow(2, i) * 1000;
        console.log(`   等待 ${delay/1000} 秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('⚠️  所有重试均失败');
  return [];
};

// 生成单个头像的 HTML
const generateAvatarHTML = (contributor) => {
  const { name, avatar, link } = contributor;
  const imgTag = `<img src="${avatar}" alt="${name}" style="width: ${CONFIG.AVATAR_SIZE}px; height: ${CONFIG.AVATAR_SIZE}px; border-radius: 50%;"/>`;
  
  if (link) {
    return `<div style="margin: 2px;">
  <a href="${link}">
    ${imgTag}
  </a>
</div>`;
  } else {
    return `<div style="margin: 2px;">
  <a>
    ${imgTag}
  </a>
</div>`;
  }
};

// 生成完整的 Markdown 内容
const generateMarkdown = (allContributors) => {
  const avatars = allContributors.map(c => generateAvatarHTML(c)).join('\n');
  return `<div style="display: flex; flex-wrap: wrap;">
${avatars}
</div>`;
};

// 提取当前贡献者部分的内容
const extractCurrentContributors = (content) => {
  const startMarker = '<div style="display: flex; flex-wrap: wrap;">';
  const endMarker = '</div>';
  
  const startIndex = content.indexOf('## 贡献者');
  if (startIndex === -1) return null;
  
  const divStartIndex = content.indexOf(startMarker, startIndex);
  if (divStartIndex === -1) return null;
  
  // 找到对应的结束 div
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
        divEndIndex = nextEnd + 6;
        found = true;
      } else {
        depth--;
        divEndIndex = nextEnd;
      }
    }
  }
  
  if (!found) return null;
  
  return {
    content: content.substring(divStartIndex, divEndIndex),
    startIndex: divStartIndex,
    endIndex: divEndIndex,
  };
};

// 更新 index.md 文件
const updateIndexFile = (contributorsHTML) => {
  const indexPath = path.join(__dirname, CONFIG.INDEX_FILE);
  
  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.md 文件不存在');
    return { updated: false, reason: 'file_not_found' };
  }
  
  let content = fs.readFileSync(indexPath, 'utf-8');
  const extracted = extractCurrentContributors(content);
  
  if (!extracted) {
    console.error('❌ 未找到贡献者部分');
    return { updated: false, reason: 'section_not_found' };
  }
  
  // 规范化并比较内容
  const currentNormalized = normalizeHTML(extracted.content);
  const newNormalized = normalizeHTML(contributorsHTML);
  
  // 使用 MD5 比较
  const currentHash = md5Hash(currentNormalized);
  const newHash = md5Hash(newNormalized);
  
  if (currentHash === newHash) {
    console.log('ℹ️  index.md 内容未改变，跳过更新');
    return { updated: false, reason: 'no_change' };
  }
  
  // 内容有变化，更新文件
  const newContent = 
    content.substring(0, extracted.startIndex) + 
    contributorsHTML + 
    content.substring(extracted.endIndex);
  
  fs.writeFileSync(indexPath, newContent, 'utf-8');
  return { updated: true, reason: 'content_changed' };
};

// 更新 CONTRIBUTORS.md 文件
const updateContributorsFile = (contributorsHTML) => {
  const filePath = path.join(__dirname, CONFIG.OUTPUT_FILE);
  
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, contributorsHTML, 'utf-8');
    return { updated: true, reason: 'new_file' };
  }
  
  const currentContent = fs.readFileSync(filePath, 'utf-8');
  const currentNormalized = normalizeHTML(currentContent);
  const newNormalized = normalizeHTML(contributorsHTML);
  
  if (md5Hash(currentNormalized) === md5Hash(newNormalized)) {
    console.log('ℹ️  CONTRIBUTORS.md 内容未改变，跳过更新');
    return { updated: false, reason: 'no_change' };
  }
  
  fs.writeFileSync(filePath, contributorsHTML, 'utf-8');
  return { updated: true, reason: 'content_changed' };
};

// 主函数
const main = async () => {
  console.log('🚀 开始生成贡献者列表...\n');
  
  if (process.env.CI) {
    console.log('✓ 检测到 CI 环境\n');
  }
  
  // 获取 GitHub 贡献者
  console.log('📡 正在从 GitHub API 获取贡献者...');
  const githubContributors = await getGitHubContributors();
  console.log(`✅ 获取到 ${githubContributors.length} 位 GitHub 贡献者\n`);
  
  // 合并所有贡献者
  const allContributors = [...MANUAL_CONTRIBUTORS, ...githubContributors];
  console.log(`📊 总共 ${allContributors.length} 位贡献者\n`);
  
  // 🔍 提前检查：读取上次的贡献者信息
  console.log('🔍 检查贡献者是否有变化...');
  const lastContributors = getLastContributorsInfo();
  
  // 构建当前贡献者的简化信息（用于比较）
  const currentContributorsInfo = allContributors.map(c => ({
    name: c.name,
    avatar: c.avatar,
  }));
  
  const hasChanged = hasContributorsChanged(lastContributors, currentContributorsInfo);
  
  if (!hasChanged) {
    console.log('✨ 贡献者列表无变化，跳过更新\n');
    console.log('💡 提示：没有检测到变化，不会修改任何文件');
    return 1; // 返回 1 表示没有变化
  }
  
  console.log('🔄 检测到变化，开始更新...\n');
  
  // 生成 HTML 内容
  const contributorsHTML = generateMarkdown(allContributors);
  
  // 更新 CONTRIBUTORS.md
  const contribResult = updateContributorsFile(contributorsHTML);
  if (contribResult.updated) {
    console.log(`✅ 已更新 ${CONFIG.OUTPUT_FILE}`);
  } else {
    console.log(`⏭️  ${CONFIG.OUTPUT_FILE} 无需更新`);
  }
  
  // 更新 index.md
  const indexResult = updateIndexFile(contributorsHTML);
  if (indexResult.updated) {
    console.log(`✅ 已更新 ${CONFIG.INDEX_FILE}`);
  } else {
    console.log(`⏭️  ${CONFIG.INDEX_FILE} 无需更新`);
  }
  
  console.log('\n✨ 完成！');
  
  const hasChanges = contribResult.updated || indexResult.updated;
  if (!hasChanges) {
    console.log('💡 提示：内容生成后发现未变化');
  }
  
  return hasChanges ? 0 : 1;
};

main()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('💥 发生错误:', error);
    process.exit(1);
  });