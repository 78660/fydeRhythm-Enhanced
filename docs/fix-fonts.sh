#!/bin/bash
set -e
echo "=== 开始配置 ChromeOS 生僻字自动回退规则 ==="

# 1. 允许修改系统配置目录
mount -o remount,rw / 2>/dev/null || true

# 2. 确保系统字库目录及权限完整
mkdir -p /usr/local/share/fonts
if [ -d "/home/chronos/user/.local/share/fonts" ]; then
  cp -f /home/chronos/user/.local/share/fonts/* /usr/local/share/fonts/ 2>/dev/null || true
fi
chmod 644 /usr/local/share/fonts/* 2>/dev/null || true

# 3. 写入全局字体回退规则
cat << 'EOF' > /etc/fonts/local.conf
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>/usr/local/share/fonts</dir>
  <match target="pattern">
    <edit name="family" mode="append">
      <string>Microsoft YaHei</string>
      <string>SimSun-ExtB</string>
      <string>SimSun-ExtG</string>
    </edit>
  </match>
</fontconfig>
EOF

if [ -d "/etc/fonts/conf.d" ]; then
  cp -f /etc/fonts/local.conf /etc/fonts/conf.d/99-windows-fallback.conf 2>/dev/null || true
fi

# 4. 刷新全局缓存
fc-cache -fv /usr/local/share/fonts
fc-cache -fv

echo ""
echo "=== 配置全部完成！==="
echo "请按 Ctrl + Alt + F1 切回图形桌面，连按两下 Ctrl + Shift + Q 重新登录！"
