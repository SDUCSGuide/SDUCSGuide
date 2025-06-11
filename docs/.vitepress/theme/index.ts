// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from 'vitepress/theme-without-fonts'
import './my-fonts.css'
import { onMounted } from "vue";
import "./custom.css";
import "./style.css";
import googleAnalytics from 'vitepress-plugin-google-analytics'
import NotionStyleMusicPlayer from './components/NotionStyleMusicPlayer.vue'

const boundItems = new WeakSet();

export default {
  ...DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    });
  },
  enhanceApp({ app, router, siteData }) {
    app.component('NotionStyleMusicPlayer', NotionStyleMusicPlayer)
    googleAnalytics({
      id: 'G-LHRV52L0X7', //跟踪ID，在analytics.google.com注册即可
    })
    if (typeof window !== "undefined") {
      waitForSidebarItems();
    }
  },
} satisfies Theme;

function waitForSidebarItems(retry = 20) {
  // const sidebarRoot = document.querySelector('.VPSidebar')
  // if (!sidebarRoot) {
  //   console.warn('❌ 未找到 .VPSidebar 容器，无法监听侧边栏')
  //   return
  // }

  const observer = new MutationObserver(() => {
    const items = document.querySelectorAll(".VPSidebarItem .item");
    if (items.length > 0) {
      //observer.disconnect() // 只绑定一次即可
      bindSidebarExpandAnimation(items);
    }
  });

  observer.observe(document, {
    childList: true,
    subtree: true,
  });
}

function bindSidebarExpandAnimation(items) {
  items.forEach((item) => {
    const container = item.closest(".VPSidebarItem");
    const content = container?.querySelector(".items");
    if (!(content instanceof HTMLElement) || !container) return;
    if (boundItems.has(container)) return;
    boundItems.add(container);
    console.log("✅ 监听到侧边栏加载，绑定逻辑");
    const observer = new MutationObserver(() => {
      const isCollapsed = container.classList.contains("collapsed");

      if (!isCollapsed) {
        // 展开
        content.style.maxHeight = content.scrollHeight + "px";

        const onTransitionEnd = () => {
          content.style.maxHeight = "none"; // ✅ 展开后允许内容自适应
          content.removeEventListener("transitionend", onTransitionEnd);
        };
        content.addEventListener("transitionend", onTransitionEnd);
      } else {
        // 🧠 如果之前是 none，需要先重设为 scrollHeight，再转为 0px
        content.style.maxHeight = content.scrollHeight + "px"; // 强制触发过渡
        // ⚠️ 关键：移除 none，否则动画不生效
        requestAnimationFrame(() => {
          content.style.maxHeight = "0px";
        });

        const onTransitionEnd = () => {
          content.style.maxHeight = "0px";
          content.removeEventListener("transitionend", onTransitionEnd);
        };
        content.addEventListener("transitionend", onTransitionEnd);
      }
    });

    observer.observe(container, {
      attributes: true,
      attributeFilter: ["class"],
    });
  });
}
