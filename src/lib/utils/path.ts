
// 多级路径处理的函数，它会将仓库名称和文件路径分解为各级目录的路由信息
export function processMultiLevelPath(repo: string, path: string) {
  const fullpath = `${repo}/${path}`
  // 处理空路径情况
  if (!fullpath) return [];

  // 分割路径为各级目录
  const segments = fullpath.split('/').filter(segment => segment.trim() !== '');

  // 生成各级目录信息
  return segments.map((segment, index) => {
    const isLast = index === segments.length - 1;
    const currentPath = segments.slice(0, index + 1).join('/');

    return {
      name: segment,
      url: `/${currentPath}`,
      isLast
    };
  });
}

export const parentPath = (path: string) => {
  return path.split('/').slice(0, -1).join('/') || '/';
}

export const pathname = (path: string) => {
  return path.split("/").slice(-1)[0] || path;
}