# fydeRhythm-Enhanced · 真文韵输入法增强版 + 万象拼音方案

> **专为 ChromeOS / Chromebook 深度调优的现代横排 RIME 中文输入法解决方案**  
> 突破系统底层 0 像素黑洞 Bug，解锁**横排候选词显示**、**搜狗同款 Tab 偏旁部首辅码反查**、**成对标点自动补全**、**数字键直接选词**与**左右键选词**。

---

> ### ⚠️ 测试环境声明
>
> 本项目仅在 **Acer C713 + ChromeOS 144.0.7559.262** 上实测通过，**未做其他机器和系统的兼容性测试**。其他 ChromeOS 版本 / Chrome 桌面版 / 其他品牌 Chromebook 能否正常工作未知，详见 [RELEASE_NOTES.md](RELEASE_NOTES.md)。

---

> ### 📢 特别致谢与说明 (Special Attribution)
>
> **开发分工**：本项目由 **Gemini 3.8 Flash 主力编写**（底层机制研究、逆向补丁注入、算法适配与全量测试），**Gemini 3.7 Flash 与 GLM 5.3 Flash 辅助参与**；人工负责需求提出、真机实测与验收。
>
> **特别感谢两个上游源仓库**提供的优秀底座：
> - **[FydeOS/fydeRhythm](https://github.com/FydeOS/fydeRhythm)** —— 真文韵输入法扩展，本项目的扩展基座（BSD 3-Clause）
> - **[amzxyz/rime-wanxiang](https://github.com/amzxyz/rime_wanxiang)** —— 万象拼音输入方案，本项目的方案与词库来源（CC-BY 4.0）
>
> 本项目是站在以上两个开源项目的肩膀上完成的整合与增强，若本项目对你有帮助，请也顺手给上游项目点个 Star！
>
> 本项目与 FydeOS / Fyde Innovations、amzxyz 无隶属关系且未获其背书；「真文韵」「万象拼音」等名称仅用于描述来源，详见 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)。

---

## ✨ 核心特性

- 🖥️ **横排候选窗突破渲染**：
  - 攻克 Chromium Issue #469901669（ChromeOS 横排测量为 0 像素导致候选词隐形的十年 Bug）；
  - 动态单倍宽度包裹自适应，告别空槽位与多余空白，排版紧凑。
- 🔍 **搜狗同款 Tab 偏旁部首辅码反查**：
  - 输入拼音后按 `Tab`（如 `zhen` → `Tab`），拼音保持不丢；
  - 输入偏旁读音（如 `j` / `ji` / `jin` 金字旁），带“钅/金”的字（如“镇”、“针”）**立即置顶排在第 1 位**，空格直接上屏！
  - 纯粹基于拼音读音（木=mu、水=shui、草=cao），无需死记硬背字根编码。
- ⌨️ **完善的操作与选词体验**：
  - **数字键选词**：按 `1`、`2`、`3`、`4`、`5`、`6` 对应序号文字直接瞬间上屏；
  - **左右方向键选词**：有候选词时按 `→` 选下一个、按 `←` 选上一个；
  - **点击直接上屏**：鼠标或触屏点击任意候选词，文字直接上屏，无需补按空格；
  - **智能快捷键保护**：按 `Alt+Tab` 切换窗口、`Ctrl+Tab` 切换标签页或空闲按 Tab 导航表单时 100% 放行，不发生冲突。
- 📝 **全量中文标点与搜狗同款【成对标点自动补全】**：
  - 斜杠 `/` 与反斜杠 `\` 均直接输出中文顿号 **`、`**；
  - 货币符号 `$` 输出 **`￥`**，波浪号 `~` 输出 **`～`**，星号 `*` 输出 **`·`**（间隔号）与 **`×`**（乘号）；
  - 输入 `《`、`【`、`（`、`“`、`‘`、`「` 自动补全右半边且**光标自动居中**（如 `《|》`）；
  - 打完书名直接敲键盘 `>` 自动平滑跳出右侧，不会重复输出；
  - 误按左标点时，按一次 **`Backspace`** 左右两边**成对删除**。
- 🎨 **原汁原味的高级选项设置面板**：
  - 完美融入真文韵主设置页，克隆原生卡片、字体与粉色主题胶囊开关；
  - 底部弹出式保存通道，修改后热重载生效，设置页不闪退。

---

## 🚀 快速安装指南

已预编译好开箱即用的安装包。发布后请从 **GitHub Releases** 页面下载（`release/` 目录下的 zip 不进 git，作为 Release 附件上传）；也可以直接使用本地 `release/` 目录中现成的文件：

### 1. 安装扩展
1. 下载并解压 `release/fydeRhythm-enhanced.zip`，得到 `fydeRhythm-enhanced` 文件夹；
2. 打开 Chrome 浏览器，访问 `chrome://extensions`，开启右上角的**「开发者模式」**；
3. 点击左上角**「加载已解压的扩展程序」**，选择 `fydeRhythm-enhanced` 文件夹；
4. 确认扩展卡片版本号显示为 **`1.0.2`**。

### 2. 导入万象方案
1. 点击输入法托盘图标或在系统输入法设置中打开**真文韵设置页**；
2. 在方案列表中如果存在旧版方案，先点击删除；
3. 点击**「导入预编译方案」**，选择 `release/wanxiang.zip`，等待进度条走完（约 130MB）；
4. 切换当前输入方案为**「万象拼音」**。

### 3. 打开高级设置
1. 在真文韵设置页**「字典包」与「RIME 服务日志」两张卡片之间**展开**「高级选项」**；
2. 打开**「Tab 进入辅码反查」**（「成对标点自动补全」等其余项默认已开启）；
3. 可选：把**「候选窗方向」**切为【横排】（实验选项，默认竖排，两档均已实测可用）；
4. 点击底部弹出的**「保存并应用」**即可！

---

## 📖 辅码使用说明

| 目标字 | 拼音输入 | 按键 | 辅码读音 | 效果 |
|:---|:---|:---:|:---|:---|
| **镇** | `zhen` | **`Tab`** | `j` 或 `ji` 或 `jin`（金字旁） | “镇”排在第 1 位，按空格上屏 |
| **林** | `lin` | **`Tab`** | `m` 或 `mu`（木字旁） | “林/森”排在第 1 位 |
| **江** | `jiang` | **`Tab`** | `s` 或 `sh` 或 `shui`（三点水） | 水旁字置顶 |
| **草** | `cao` | **`Tab`** | `c` 或 `ca` 或 `cao`（草字头） | 草头字置顶 |

- **防误触机制**：连按两次或多次 Tab 自动防抖，绝不会进入意外造词状态导致候选栏消失。

---

## 🛠️ 项目结构与编译机制

```text
fydeRhythm-enhanced/
├── extension/          # 增强版扩展（开箱即用的未打包目录，可直接「加载已解压的扩展程序」）
├── schema-src/         # 万象拼音方案资产：shared/ 为 Lua 滤镜与 opencc 词表（进 git）；
│                       #   build/ 为预编译 RIME 二进制，体量大，随 release 导入包分发（不进 git）
├── scripts/            # 补丁与自动化打包构建工具
│   ├── patch-final.js          # 背景核心补丁脚本（时序重构、Tab拦截、标点补全；输入：原版 CRX 解包目录）
│   ├── build-import-zip.cjs    # 方案预编译打包与导入合法性校验工具（先在 scripts/ 下 npm install）
│   ├── verify-import.cjs       # 与扩展同款的导入逻辑（Node 版），用于校验打包结果
│   ├── zwy-panel.js            # 高级选项面板组件（由 patch-final.js 嵌入设置页）
│   └── package.json            # scripts 目录的 npm 依赖声明
├── release/            # 预编译好的交付产物（zip 通过 GitHub Releases 分发，不进 git）
│   ├── fydeRhythm-enhanced.zip
│   └── 万象拼音方案-在真文韵设置页导入这个.zip
├── docs/               # 辅助脚本与系统调优文档
│   ├── 安装与维护说明.md         # 交付包内附的使用与维护说明
│   ├── fix-fonts.sh             # ChromeOS 宿主生僻字自动回退配置
│   ├── install-linux-fonts.sh   # Crostini Linux 虚拟机字体注入
│   └── fix-terminal-font.sh     # Linux 终端等宽字距修复
├── LICENSE             # 本仓库主许可证（BSD 3-Clause，承自 fydeRhythm）
├── THIRD-PARTY-NOTICES.md  # 第三方组件与许可证总览
└── RELEASE_NOTES.md    # 发布版本说明：与原版真文韵的完整区别、部署方法、文件清单
```

---

## 📄 开源许可证与协议说明 (Licenses)

本项目遵守各上游组件的开源许可协议分发，主许可证为 **BSD 3-Clause**（见 [LICENSE](LICENSE)），第三方组件总览见 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)：

1. **真文韵扩展主体 (fydeRhythm)**：
   - 基于 [Fyde Innovations](https://github.com/FydeOS/fydeRhythm) 的开源代码，遵循 **BSD 3-Clause License**；
   - 完整许可文本见 [LICENSE-BSD3-fydeRhythm](LICENSE-BSD3-fydeRhythm)。
2. **万象拼音输入方案 (Wanxiang Schema)**：
   - 基于 [amzxyz/rime-wanxiang](https://github.com/amzxyz/rime_wanxiang) 开源项目，遵循 **Creative Commons Attribution 4.0 International (CC-BY 4.0)**；
   - 完整许可文本见 [LICENSE-CC-BY-4.0-wanxiang](LICENSE-CC-BY-4.0-wanxiang)。
3. **本项目新增定制与补丁代码**：
   - 遵循 BSD-3-Clause 与 CC-BY-4.0 开源共享。
