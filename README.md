# 初恋资源库

一个**纯静态**资料库站点:内容放在 `data/resources.json`,页面自动渲染,无需后端、无需构建。

## 目录结构

```
初恋资源库/
├── index.html            # 列表页(搜索 + 分类筛选)
├── resource.html         # 详情页(?id=xxx)
├── assets/
│   ├── app.js            # 渲染逻辑(列表 + 详情)
│   └── styles.css        # 样式
└── data/
    └── resources.json    # ← 你的内容放这里
```

## 添加一条资料

编辑 `data/resources.json`,在数组里加一项:

```json
{
  "id": "唯一标识(英文,推荐 kebab-case)",
  "title": "资料标题",
  "category": "分类名(可选)",
  "tags": ["标签1", "标签2"],
  "summary": "列表里显示的一句话摘要",
  "body": "正文,支持换行分段\n第二段"
}
```

保存后在页面自动可见(无需重启任何东西)。

## 本地运行

纯静态站,`fetch(data/resources.json)` 需要 HTTP 协议,`file://` 直开会因 CORS 失败。任选一种:

- 推荐(VS Code):装 **Live Server** 扩展,右键 `index.html` → "Open with Live Server"
- 或命令行(任选其一):
  - `npx serve .`
  - `python -m http.server 8000` → 浏览器访问 `http://localhost:8000`

## 部署:GitHub + Cloudflare Pages

1. **推送到 GitHub**
   - 新建一个仓库(私有/公开均可),把整个目录推上去。
   - 例如:
     ```
     git init
     git add .
     git commit -m "init static resource library"
     git branch -M main
     git remote add origin git@github.com:<你的用户名>/初恋资源库.git
     git push -u origin main
     ```

2. **在 Cloudflare 创建 Pages 项目**
   - 登录 [Cloudflare](https://dash.cloudflare.com/) → 左侧 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**(选 GitHub)。
   - 选刚才的仓库。
   - 构建配置:
     - **Build command:** 留空(纯静态无需构建)
     - **Build output directory:** `./`(整个仓库根目录)
     - **Root directory:** `./`
   - 点 **Deploy**。首次构建约 30 秒,之后每次 push 自动重新部署。

3. **自定义域名(可选)**
   - Pages 项目 → **Custom domains** → 绑定你的域名;Cloudflare 自动签发 HTTPS。

> 之后改内容只需要:改 `data/resources.json` → `git push` → 自动上线。

## 已知限制 / 升级方向

| 需求 | 现状 | 升级方式 |
|------|------|----------|
| 大量图片/视频/PDF | 目前 JSON 只存文字 | 用 Cloudflare **R2**(对象存储)存媒体,JSON 里引用 URL |
| 用户登录/收藏/上传 | 无 | 改用 **Cloudflare Workers + D1/KV**,或接入 Supabase/Firebase |
| 国内访问速度慢 | 无 ICP 备案 | 备案后挂 Cloudflare 国内节点,或改用阿里云 OSS + CDN |

## 风险提醒

若资料库包含**非你原创、无版权或敏感主题**的内容,GitHub 可能收到 DMCA 封仓,Cloudflare 也可能屏蔽或要求下架。上线前请先确认内容合规。
