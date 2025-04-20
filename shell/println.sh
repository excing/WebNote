#!/bin/bash

# 定义输出文件
output_file="./temp/webtodolistfullcode.md"

# 清空输出文件（如果已存在的话）
> "$output_file"

# 遍历 /src 目录中的所有文本文件（.svelte, .js, .ts, .html, .css 等）
find "../src" -type f \( -name "*.svelte" -o -name "*.js" -o -name "*.ts" -o -name "*.html" -o -name "*.css" \) -print | while read file; do
    # 调试：显示找到的文件
    echo "找到文件: $file"
    # 将每个文件的全名（路径+文件名）追加到 full.text
    echo "\r\n\`\`\`$file" >> "$output_file"
    # 将每个文件的内容追加到 full.text
    cat "$file" >> "$output_file"
    echo "\r\n\`\`\`" >> "$output_file"
    # 打印文件内容到工作台
    # cat "$file"
done

echo "所有指定类型的文本文件的内容已输出到 $output_file"