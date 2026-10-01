#!/bin/bash
set -e
echo "=== 修复 Linux 终端等宽字间距过宽问题 ==="

# 1. 确保安装了标准等宽英文字体
sudo apt update -y 2>/dev/null || true
sudo apt install -y fonts-dejavu-core fonts-noto-mono 2>/dev/null || true

# 2. 配置 fontconfig 优先等宽规则，防止中文字体污染终端英文
sudo tee /etc/fonts/local.conf << 'EOF'
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <!-- 强制 monospace 首选标准等宽英文字体 -->
  <match target="pattern">
    <test qual="any" name="family">
      <string>monospace</string>
    </test>
    <edit name="family" mode="prepend" binding="strong">
      <string>DejaVu Sans Mono</string>
      <string>Noto Sans Mono</string>
      <string>Noto Sans Mono CJK SC</string>
    </edit>
  </match>
</fontconfig>
EOF

# 3. 刷新缓存
sudo fc-cache -fv
fc-cache -fv

echo ""
echo "=== 修复完成！==="
echo "请关闭当前终端窗口，重新打开一个新终端即可恢复正常紧凑的等宽字距！"
