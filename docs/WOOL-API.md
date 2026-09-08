# 羊毛福利专区 · 接口契约

给站长 / 后续对接方看的。页面只认这套接口，**换后端实现不用改页面代码**。

---

## 一、总览

| 方法 | 路径 | 用途 |
|---|---|---|
| `GET` | `/api/wool/:id/comments` | 拉取某条羊毛的留言 |
| `POST` | `/api/wool/:id/comments` | 发留言 |
| `DELETE` | `/api/wool/:id/comments?id=xxx` | 撤回留言（管理员） |

所有响应统一结构：`{ ok: boolean, ... }`。失败时带 `error` 字段（中文，可直接展示给用户）。

`:id` = `data/wool.ts` 里每条羊毛的 `id` 字段，如 `cursor-student`。

---

## 二、数据结构

```ts
type WoolComment = {
  id: string;                              // 留言唯一 id
  woolId: string;                          // 属于哪条羊毛
  nick: string;                            // 昵称，≤24 字
  body: string;                            // 正文，纯文本，≤500 字
  createdAt: string;                       // ISO 时间
  replyTo?: string;                        // 回复目标 id，顶级留言为空
  status: "visible" | "pending" | "hidden";
};
```

`status` 说明：`visible` 展示 / `pending` 待审 / `hidden` 已隐藏。

---

## 三、接口细节

### GET 拉取留言

```
GET /api/wool/cursor-student/comments
```

```json
{ "ok": true, "items": [ /* WoolComment[] */ ], "total": 12 }
```

> 只返回 `status !== "hidden"` 的。前端按 `replyTo` 组装成两层树（**只支持两层**，不做无限嵌套）。

### POST 发留言

```
POST /api/wool/cursor-student/comments
Content-Type: application/json

{ "nick": "小明", "body": "我刚试了，需要 .edu 邮箱", "replyTo": "可选" }
```

成功：`{ "ok": true, "item": WoolComment }`
失败：`{ "ok": false, "error": "…" }` + 状态码

| 状态码 | 场景 |
|---|---|
| 400 | 昵称/正文为空、超长、JSON 非法 |
| 429 | 60 秒内超过 3 条 |
| 503 | 后端存储没配好 |
| 502 | 写入失败 |

### DELETE 撤回（管理员）

```
DELETE /api/wool/:id/comments?id=123456
X-Admin-Key: <WOOL_ADMIN_KEY>
```

未设 `WOOL_ADMIN_KEY` 时接口直接 503，等于默认关闭。

---

## 四、存储层怎么换

实现都在 `lib/wool-comments.ts`，是个 provider 模式：

```ts
type Provider = {
  list(woolId: string): Promise<WoolComment[]>;
  add(c: NewComment): Promise<WoolComment | null>;
  hide(id: string): Promise<boolean>;
};
```

**换后端只需要新写一个 Provider，页面和 API 路由一行不动。**

### 当前实现

| Provider | 说明 |
|---|---|
| `github` | 用一个 GitHub Issue 承载全部交流，每条留言 = 一条 Issue comment，body 存 JSON，按 `woolId` 分组。**零数据库、零新增服务**，站长在 GitHub 上直接可见可删 |
| `memory` | 进程内数组，重启即清空。本地联调用，不污染仓库 |

### 要接别的后端

在 `lib/wool-comments.ts` 里加一个 provider（比如 `cloudbase` / `supabase`），
实现上面三个方法，然后在 `current()` 里接上分支即可：

```ts
if (p === "cloudbase") return cloudbaseProvider;
```

---

## 五、环境变量

| 变量 | 说明 |
|---|---|
| `WOOL_COMMENTS_PROVIDER` | `github` / `memory`，不填则生产走 github、开发走 memory |
| `WOOL_TALK_ISSUE` | github provider 用的 Issue 号（**先在仓库建一个 Issue，把号码填进来**） |
| `VLAB_GH_TOKEN` | 复用站点已有的 GitHub 写 token，需要 `issues: write` |
| `WOOL_COMMENTS_MODERATE` | 设为 `1` 则新留言先进 `pending`，需人工放行 |
| `WOOL_ADMIN_KEY` | 管理员密钥，不设则 DELETE 接口关闭 |

> ⚠️ 生产环境必须配 `WOOL_TALK_ISSUE` 和 `VLAB_GH_TOKEN`，否则接口返回 503，
> 前端会提示「交流服务未配置」—— 不会假装成功。

---

## 六、已知限制

1. **限流是进程内的**。Vercel 多实例之间不共享，挡误触够用，挡不了专业攻击。真要防刷得上 Upstash / Vercel KV 做分布式限流
2. **留言没有用户体系**。昵称随便填，任何人都能冒名。要实名得接 GitHub OAuth 或站点账号
3. **github provider 是单 Issue 承载**。交流量大了（几百条以上）建议拆成「一条羊毛一个 Issue」，需要额外维护 `woolId → issueNumber` 映射
4. **不支持编辑留言**。只能删了重发，这是有意的 —— 避免悄悄篡改历史讨论
