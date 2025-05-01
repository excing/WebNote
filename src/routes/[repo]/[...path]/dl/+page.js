export function load({ params }) {
  return {
    repo: params.repo,       // 获取 repo 参数
    path: params.path        // 获取 path 参数（可能是数组或字符串）
  };
}