
// 文件大小格式化函数，它会根据输入的数字大小自动选择合适的单位（B、KB、MB、GB、TB、PB）
export function filesize(size: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  // 保留2位小数，并去除末尾的0
  const formattedSize = size.toFixed(2).replace(/\.?0+$/, '');

  return `${formattedSize} ${units[unitIndex]}`;
}