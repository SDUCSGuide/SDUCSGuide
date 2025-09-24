import { defineConfig } from "vitepress";
import type { HeadConfig } from "vitepress";
import { set_sidebar } from "./generateSidebar.js";


// https://vitepress.dev/reference/site-config

export default defineConfig({
  base: "/SDUCSGuide/",
  title: "SDUCS 本科指南",
  head: [
    ["link", { rel: "icon", href: "/SDUCSGuide/favicon.png" }], // 这里写你的图标文件名
    // 你也可以用 '/favicon.ico' 或 '/SDUicon.png'，但路径一定要以 / 开头
    // ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Source+Han+Sans:wght@400;700&display=swap' }],
    // TODO: 引入pangu 
  ],
  themeConfig: {
    logo: "/favicon.png",
    nav: [
      { text: "首页", link: "/" },
      { text: "启程", link: "/pages/0qian-yan/README" },
      { text: "贡献指南", link: "/join" },
<<<<<<< HEAD
      // { text: "技术手册", link: "/guideManual" },
=======
      { text: "技术手册", link: "/guideManual" },
>>>>>>> 579b4c8 (update_index_image)
      {
        text: "ShareSDU",
        link: "https://sharesdu.com",
        target: "_blank",
      },
      {
        text: "GitHub",
        link: "https://github.com/SDUCSGuide/SDUCSGuide.git",
        target: "_blank",
      },
      
    ],
    outline: {
      level: [1, 4], // 显示 ##、###、#### 标题
      label: "Outline", // 右侧目录标题
    },
    sidebar: {
      "/pages": set_sidebar("/pages"),
    },
  },
  vite: {
    css: {
      preprocessorOptions: {
        css: {
          additionalData: `@import "./my-font.css";`,
        },
      },
    },
  },
});
