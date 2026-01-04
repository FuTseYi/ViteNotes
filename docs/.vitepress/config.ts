import { defineConfig, type HeadConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'
import { withMermaid } from 'vitepress-plugin-mermaid'
import timeline from "vitepress-markdown-timeline"
import { writeFile } from 'fs/promises'
import { join } from 'path'

// ========== 一、站点配置（统一管理 SEO 和资源配置）==========
const SITE_CONFIG = {
  // 站点标题配置
  title: "ViteNotes-謝懿Shine'AI知识库",  // 浏览器标签页标题、SEO 标题
  siteTitle: "ViteNotes",  // 左上角导航栏标题（非SEO）
  description: "系统整理数据科学、机器学习与人工智能的学习路径、课堂笔记与实战练习。Record end-to-end learning journeys across data science, machine learning and AI.",
  
  // SEO 配置
  url: 'https://notes.xieyi.org',  // 网站域名，示例: 'https://yourdomain.com'（留空则不生成 sitemap）
  keywords: 'AI,机器学习,深度学习,数据科学,pandas,GNN,pytorch,学习笔记,vitepress',
  author: '謝懿Shine',
  
  // 资源配置
  favicon: {
    href: '/favicon/emoji-work.png',// 网站图标
    type: 'image/png'  // 支持: image/png, image/svg+xml, image/x-icon 等(tips:手动修改匹配)
  },
  logo: '/favicon/emoji-work.png',// 左上角图标
  
  // robots.txt 排除目录（根据项目实际情况调整）
  robotsDisallow: [
    '/*assets/',     // 任意层级名为 assets 的文件夹（兼容主流爬虫的通配符）
    '/.vitepress/',  // VitePress 配置
  ],
}

/**
 * 将 Markdown 文件路径转换为网站 URL 路径
 * 兼容 rewrites 和国际化路由配置
 */
function getPageUrl(relativePath: string): string {
  return relativePath
    .replace(/\\/g, '/')              // Windows 路径 -> Unix 路径
    .replace(/\.md$/, '.html')        // .md -> .html
    .replace(/\/index\.html$/, '/')    // /index.html -> /
    .replace(/^index\.html$/, '')      // 根 index.html -> ''
    .replace(/^/, '/')                 // 确保以 / 开头
    .replace(/\/\/+/g, '/')            // 去除多余斜杠
}

// ========== 二、侧边栏自动化生成 ==========
const commonSidebarConfig = {
  useTitleFromFileHeading: true,
  useFolderTitleFromIndexFile: true,
  useFolderLinkFromIndexFile: true,
  hyphenToSpace: true,
  collapsed: true,
  excludePattern: ['public', 'assets', 'docs'],
  manualSortFileNameByPriority: [ // 手动排序文件名优先级
    'guide',
    'Appendix',
    '80-MachineLearning'
  ],
}

// 为侧边栏所有链接添加国际化路径前缀
const addPrefix = (items: any, prefix: string): any => {
  if (Array.isArray(items)) {
    return items.map(item => ({
      ...item,
      link: item.link ? prefix + item.link.replace(/^\//, '') : undefined,
      items: item.items ? addPrefix(item.items, prefix) : undefined
    }))
  }
  return items
}

// 生成侧边栏（支持国际化前缀）
const createSidebar = (root: string, prefix = '/') => {
  const sidebar = generateSidebar({ documentRootPath: root, ...commonSidebarConfig })
  return prefix === '/' ? sidebar : addPrefix(sidebar, prefix)
}

// ========== 三、VitePress 配置 ==========

export default withMermaid(defineConfig({

  // 路由重写：将 en 目录映射到根路径,作为默认语言内容
  rewrites: {
    'en/index.md': 'index.md',            // 英文首页映射到根路径
    'en/:dir/:rest*': ':dir/:rest*',      // 英文内容映射到根路径
    // zh 目录保持 /zh/ 前缀（无需路由重写，直接跳转到/zh/）
  },
  
  // 排除目录
  srcExclude: ['**/docs/**'],
  
  //主题配置（全局配置，会被下方 locales 中的配置继承）
  themeConfig: {
    logo: SITE_CONFIG.logo,//左上角logo
    siteTitle: SITE_CONFIG.siteTitle,//左上角标题
    socialLinks: [//外部链接图标配置    
      { icon: 'github', link: 'https://github.com/FuTseYi/ViteNotes' },
      { 
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M19 22q-1.65 0-2.825-1.175T15 18v-4.5q0-1.05.725-1.775T17.5 11t1.775.725T20 13.5V18h-2v-4.5q0-.2-.15-.35T17.5 13t-.35.15t-.15.35V18q0 .825.588 1.413T19 20t1.413-.587T21 18v-4h2v4q0 1.65-1.175 2.825T19 22M3 18q-.825 0-1.412-.587T1 16V4q0-.825.588-1.412T3 2h16q.825 0 1.413.588T21 4v6h-3.5q-1.45 0-2.475 1.025T14 13.5V18zm8-7l8-5V4l-8 5l-8-5v2z"/></svg>'
        },
        link: 'mailto:tseyi.wk@icloud.com',
      },
    ],
    
    //底部版权信息配置
    footer: { 
      message: '© 2025–Present 謝懿Shine. All Rights Reserved.',
      copyright: 
                'Powered by <a href="https://vuejs.org/" target="_blank">Vue</a> and ' +
                '<a href="https://github.com/FuTseYi" target="_blank">謝懿Shine</a>'
    },

    // 全局搜索配置&UI语言设置(英文en无需再次配置)
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
          // 添加其他语言示例：
          // fr: { translations: { /* 法语翻译 */ } }
        }
      }
    }
  },


  // ========== 国际化页面配置 ==========
  locales: {
    // ---------- 英文配置 ----------拥有默认英文UI文本,无需再次配置
    root: {
      label: 'English',//国际化时下拉菜单显示的语言名称
      lang: 'en',// 这里我用en,但共存中文内容(若是专业文档,最好是对应语言对应主题)
      title: SITE_CONFIG.title,
      description: SITE_CONFIG.description,
      themeConfig: {
        nav: [
          { text: 'Home🏠️', link: '/' },
        ],
        // 由于 rewrites 已将 en 映射到根路径，侧边栏也使用根路径
        sidebar: createSidebar('docs/en', '/'),// '/'决定“链接挂到哪里”（这些文档对应的网站路径以哪个前缀开头）
      }
    },
    
    // ---------- 中文配置（未来启用时取消注释）----------
    /*zh: {
      label: '中文',
      lang: 'zh-CN',
      title: SITE_CONFIG.title,
      description: SITE_CONFIG.description,
      themeConfig: {
        nav: [
          { text: '主页', link: '/zh/' },
          { 
            text: '课程内容', 
            items: [
              { text: '第一章 Git简介', link: '/zh/lecture01/' },
              { text: '第二章 Git基础命令', link: '/zh/lecture02/' },
              { text: '第三章 Git分支管理', link: '/zh/lecture03/' },
              { text: '第四章 Git工具', link: '/zh/lecture04/' },
              { text: '第五章 Git内部原理', link: '/zh/lecture05/' },
              { text: '第六章 GitFlow工作流实战', link: '/zh/lecture06/' },
              { text: '第七章 Git提交规范', link: '/zh/lecture07/' },
              { text: '第八章 Github/Gitee使用说明', link: '/zh/lecture08/' },
              { text: '第九章 Git可视化工具下载', link: '/zh/lecture09/' },
              { text: '第十章 Git团队协作以及合并时的diff工具', link: '/zh/lecture10/' }
            ]
          },
        ],
        sidebar: createSidebar('docs/zh', '/zh/'),
        
        // 中文 UI 文本配置
        outlineTitle: '页面导航',
        lastUpdatedText: '最后更新于',
        darkModeSwitchLabel: '主题',
        sidebarMenuLabel: '菜单',
        returnToTopLabel: '回到顶部',
        langMenuLabel: '多语言',
        
        docFooter: {
          prev: '上一页',
          next: '下一页'
        }
       }
     }*/

  },

// ========== 四、默认设置 ==========
  
  // 1.显示最后更新时间
  lastUpdated: true,
  
  // 2. Markdown 增强配置
  markdown: {
    math: true,// 开启数学公式 ($$ E=mc^2 $$)
    lineNumbers: true, // 开启行号
    languageAlias: {   // 语言别名，消除 gitignore/env 警告
      'gitignore': 'ini',
      'env': 'properties'
    },
    config: (md) => {// 注册时间线插件
      md.use(timeline);
    },
  },

  // 3. Mermaid 配置
  mermaid: {// refer to mermaid config options
  },
  mermaidPlugin: {
    class: "mermaid my-class", // set additional css classes for parent container 
  },

  // 4. Vite 构建配置
  vite: {
    // SSR（服务端渲染）配置
    ssr: {
      noExternal: ['vitepress-plugin-mermaid', 'mermaid'],// 将这些包打包到输出中，解决 Mermaid 图表在 SSR 时的兼容性问题
    },
    // 优化mermaid配置
    optimizeDeps: {
      include: ['mermaid'],// 提前预构建 mermaid，提升开发环境性能
    },
    // 开发服务器配置
    server: {
      host: '0.0.0.0',      // 监听所有网络接口（可从局域网访问）
      port: 5173,           // 默认端口
      strictPort: false,    // 端口被占用时自动尝试下一个端口
      allowedHosts: true    // 允许所有主机访问（跳过 host 检查）
    }
    },

// ========== 五、SEO 优化配置 ==========
  
  // 基础 head 标签（全局生效）
  head: [
    ['meta', { name: 'keywords', content: SITE_CONFIG.keywords }],
    ['meta', { name: 'author', content: SITE_CONFIG.author }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['link', { rel: 'icon', href: SITE_CONFIG.favicon.href, type: SITE_CONFIG.favicon.type }],
  ],
  
  // Sitemap 自动生成（需配置 SITE_CONFIG.url）
  ...(SITE_CONFIG.url ? { sitemap: { hostname: SITE_CONFIG.url } } : {}),
  
  // 动态生成每个页面的 SEO meta 标签（标题、描述、URL、社交分享图）
  transformHead: ({ pageData }) => {
    if (!SITE_CONFIG.url) return []
    
    const pageUrl = `${SITE_CONFIG.url}${getPageUrl(pageData.relativePath)}`
    const title = pageData.frontmatter.title || pageData.title
    const description = pageData.frontmatter.description || pageData.description
    const image = `${SITE_CONFIG.url}${SITE_CONFIG.logo}`
    
    return [
      // 规范链接（避免重复内容）
      ['link', { rel: 'canonical', href: pageUrl }],
      // Open Graph（Facebook、微信等）
      ['meta', { property: 'og:url', content: pageUrl }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:image', content: image }],
      // Twitter Card
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }],
      ['meta', { name: 'twitter:image', content: image }],
    ] as HeadConfig[]
  },
  
  // 构建完成后自动生成 robots.txt
  buildEnd: async (siteConfig) => {
    const disallowRules = SITE_CONFIG.robotsDisallow
      .map(path => `Disallow: ${path}`)
      .join('\n')
    
    const robotsContent = [
      'User-agent: *',
      'Allow: /',
      '',
      '# 排除资源文件',
      disallowRules,
      '',
      ...(SITE_CONFIG.url ? [`Sitemap: ${SITE_CONFIG.url}/sitemap.xml`] : []),
    ].join('\n')
    
    await writeFile(join(siteConfig.outDir, 'robots.txt'), robotsContent, 'utf-8')
  },
}))
