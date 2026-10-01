#!/bin/bash
set -e
echo "=== 开始为 Linux 虚拟机安装 Windows 全量字体 ==="

sudo mkdir -p /usr/local/share/fonts/win-fonts

# 自动寻找字体来源
if [ -d "/mnt/chromeos/MyFiles/Downloads/win-fonts" ]; then
    echo "从 ChromeOS 下载目录复制字体..."
    sudo cp /mnt/chromeos/MyFiles/Downloads/win-fonts/* /usr/local/share/fonts/win-fonts/
elif [ -d "$HOME/win-fonts" ]; then
    echo "从 Linux 主目录复制字体..."
    sudo cp "$HOME"/win-fonts/* /usr/local/share/fonts/win-fonts/
elif [ -d "$HOME/Downloads/win-fonts" ]; then
    echo "从 Linux Downloads 目录复制字体..."
    sudo cp "$HOME"/Downloads/win-fonts/* /usr/local/share/fonts/win-fonts/
else
    echo "未找到 win-fonts 文件夹，正在从 ChromeOS 挂载点全局搜索..."
    sudo find /mnt/chromeos/ -type f \( -name "msyh*.ttc" -o -name "simsun*.ttf" \) -exec cp {} /usr/local/share/fonts/win-fonts/ \;
fi

sudo chmod 644 /usr/local/share/fonts/win-fonts/* 2>/dev/null || true
echo "正在刷新 Linux 字体缓存..."
sudo fc-cache -fv /usr/local/share/fonts/win-fonts/
fc-cache -fv

echo ""
echo "=== 安装完成！==="
echo "Linux 虚拟机已识别字体列表："
fc-list : family | grep -E "YaHei|SimSun" | sort -u
