# Open Source Licenses / 开源许可证说明

本项目为基于两个优秀开源项目的整合与定制增强版本：

1. **真文韵输入法扩展部分 (fydeRhythm Extension)**
   - 原始项目：[FydeOS/fydeRhythm](https://github.com/FydeOS/fydeRhythm)
   - 许可协议：**BSD 3-Clause License**（本仓库主许可证，见 [LICENSE](LICENSE)）
   - 版权所有：Copyright (c) 2026, Fyde Innovations
   - 完整条款请参阅：[LICENSE-BSD3-fydeRhythm](LICENSE-BSD3-fydeRhythm)

2. **万象拼音输入方案部分 (Wanxiang Schema)**
   - 原始项目：[amzxyz/rime-wanxiang](https://github.com/amzxyz/rime_wanxiang)
   - 许可协议：**Creative Commons Attribution 4.0 International (CC-BY 4.0)**
   - 版权所有：Copyright (c) amzxyz
   - 完整条款请参阅：[LICENSE-CC-BY-4.0-wanxiang](LICENSE-CC-BY-4.0-wanxiang)
   - **变更说明（CC-BY 要求）**：本项目未修改方案与词库数据内容，仅将上游方案的编译产物重新打包为真文韵设置页可导入的 zip（打包形式变更），并在输入法中通过运行时配置叠加的方式调用，不改写上游文件。

3. **万象词库数据 (Wanxiang Lexicon / RIME-LMDG)**
   - 原始项目：[amzxyz/RIME-LMDG](https://github.com/amzxyz/RIME-LMDG)（万象词库本体仓库，方案包内 `.table.bin`/`.prism.bin` 等编译词库即由其构建）
   - 许可协议：**Creative Commons Attribution 4.0 International (CC-BY 4.0)**
   - 版权所有：Copyright (c) amzxyz
   - 许可链接：<https://creativecommons.org/licenses/by/4.0/>

4. **本项目新增与修改部分 (Modifications & Enhancements)**
   - 遵循上游项目的开源协议（BSD 3-Clause 与 CC-BY 4.0）。
   - 详细变更说明请参阅 [README.md](README.md) 与 [RELEASE_NOTES.md](RELEASE_NOTES.md)。

---

## 非背书声明 (Non-endorsement)

本项目与 FydeOS / Fyde Innovations、amzxyz 均**无隶属或合作关系，未获得其任何背书**。本发行物不构成上游项目对其中任何功能的支持或保证。

「fydeRhythm」「真文韵」「万象拼音」等名称仅用于**描述来源与兼容性**（指示性使用），不用于暗示上游项目的认可或推广。如上游作者认为名称使用不当，请提 Issue，我们将及时调整。
