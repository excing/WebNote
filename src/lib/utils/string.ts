import unidecode from "unidecode";

/**
 * 将任意字符串转换为符合 GitHub 仓库命名规则的字符串
 * @param input 输入字符串（可能包含中文、日文、空格等）
 * @returns 符合 GitHub 规则的字符串（仅 ASCII 字母、数字、-、_、.）
 */
export function toValidGitHubRepoName(input: string): string {
  return unidecode(input) // 支持多种语言，自动处理 Unicode 字符，将非 ASCII 字符映射到近似的 ASCII 字符
    // 1. 将非 ASCII 字符（如中文、日文）转换为拼音或移除（这里简单处理为转拉丁字母，实际可用库如 pinyin）
    .normalize('NFKD') // 分解字符和变音符号
    .replace(/[\u0300-\u036F]/g, '') // 移除变音符号
    .replace(/[^\x00-\x7F]/g, '') // 移除非 ASCII 字符（中文、日文等会被移除）

    // 2. 将空格和不允许的符号替换为连字符 -
    .replace(/[\/\s\\\?\*:@<>|"']/g, '-') // 替换常见非法文件名字符

    // 3. 移除连续的连字符
    .replace(/-+/g, '-')

    // 4. 移除开头和结尾的连字符/点
    .replace(/^[-.]+|[-.]+$/g, '')

    // 5. 确保不为空（如果全部被移除，则返回 fallback）
    .trim() || 'repository';
}