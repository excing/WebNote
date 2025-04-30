// github-repo-manager.ts

import { decodeAndDownloadBase64WithoutMime, downloadFile } from "./github-utils";

export interface GitRepository {
  id: number;
  name: string;
  description: string | null;
  private: boolean;
  language: string | null;
  stargazers_count: number;
  html_url: string;
  created_at: string;
  updated_at: string;
}

export interface GitContent {
  content: string; // encode: base64
  encoding: string; // value: base64
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  download_url: string;
  type: string;
}

/**
 * GitHub Repository Manager - 通过 OAuth Apps API 和原生 fetch 操作用户仓库
 */
export class GitHubRepoManager {
  private baseUrl: string = 'https://api.github.com';
  private headers: HeadersInit;

  /**
   * 初始化 GitHub 仓库管理器
   * @param accessToken 用户 OAuth 访问令牌
   */
  constructor(private accessToken: string) {
    if (!accessToken) {
      throw new Error('访问令牌不能为空');
    }

    this.headers = {
      'Authorization': `token ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };
  }

  /**
   * 执行 API 请求
   * @param endpoint API 端点
   * @param options 请求选项
   */
  private async request<T>(
    endpoint: string,
    options: {
      method?: string;
      body?: any;
      params?: Record<string, string | number>;
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, params } = options;

    // 处理查询参数
    let url = `${this.baseUrl}${endpoint.replace(this.baseUrl, '')}`;
    if (params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        queryParams.append(key, String(value));
      }
      url += `?${queryParams.toString()}`;
    }

    // 构建请求选项
    const requestOptions: RequestInit = {
      method,
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined
    };

    try {
      const response = await fetch(url, requestOptions);

      // 处理204状态码（无内容）的特殊情况
      if (response.status === 204) {
        return true as unknown as T;
      }

      // 解析JSON响应
      let data: any;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // 处理错误响应
      if (!response.ok) {
        throw {
          status: response.status,
          data: data,
          message: `API请求失败: ${response.status} - ${JSON.stringify(data)}`
        };
      }

      return data as T;
    } catch (error: any) {
      // 重新抛出经过处理的错误
      if (error.status) {
        throw error;
      }
      throw new Error(`请求失败: ${error.message || '未知错误'}`);
    }
  }

  /**
   * 获取当前授权用户的信息
   */
  async getCurrentUser() {
    return this.request('/user');
  }

  /**
   * 获取用户的所有仓库，包括私有仓库
   * @param type 仓库类型，可选值: all, owner, public, private, member
   * @param sort 排序方式，可选值: created, updated, pushed, full_name
   * @param direction 排序方向，可选值: asc, desc
   * @param perPage 每页显示数量，最大100
   * @param page 页码
   */
  async listRepositories({
    type = 'all',
    sort = 'updated',
    direction = 'desc',
    perPage = 30,
    page = 1
  } = {}) {
    return this.request<GitRepository[]>('/user/repos', {
      params: {
        type,
        sort,
        direction,
        per_page: perPage,
        page
      }
    });
  }

  /**
   * 获取指定仓库的详细信息
   * @param owner 仓库所有者
   * @param repo 仓库名称
   */
  async getRepository(owner: string, repo: string) {
    return this.request<GitRepository>(`/repos/${owner}/${repo}`);
  }

  /**
   * 创建一个新仓库
   * @param options 仓库配置选项
   */
  async createRepository(options: {
    name: string;
    description?: string;
    homepage?: string;
    private?: boolean;
    has_issues?: boolean;
    has_projects?: boolean;
    has_wiki?: boolean;
    auto_init?: boolean;
    gitignore_template?: string;
    license_template?: string;
  }) {
    return this.request<GitRepository>('/user/repos', {
      method: 'POST',
      body: options
    });
  }

  /**
   * 更新仓库信息
   * @param owner 仓库所有者
   * @param repo 仓库名称
   * @param options 更新选项
   */
  async updateRepository(
    owner: string,
    repo: string,
    options: {
      name?: string;
      description?: string;
      homepage?: string;
      private?: boolean;
      has_issues?: boolean;
      has_projects?: boolean;
      has_wiki?: boolean;
      default_branch?: string;
      allow_squash_merge?: boolean;
      allow_merge_commit?: boolean;
      allow_rebase_merge?: boolean;
      delete_branch_on_merge?: boolean;
    }
  ) {
    return this.request(`/repos/${owner}/${repo}`, {
      method: 'PATCH',
      body: options
    });
  }

  /**
   * 删除仓库
   * @param owner 仓库所有者
   * @param repo 仓库名称
   */
  async deleteRepository(owner: string, repo: string) {
    return this.request(`/repos/${owner}/${repo}`, {
      method: 'DELETE'
    });
  }

  /**
   * 获取仓库内容
   * @param owner 仓库所有者
   * @param repo 仓库名称
   * @param path 文件或目录路径，根目录使用空字符串
   * @param ref 分支、标签或提交SHA
   */
  async getContents(owner: string, repo: string, path: string = '', ref?: string) {
    const params: Record<string, string> = {};
    if (ref) params.ref = ref;

    return this.request<GitContent[] | GitContent>(`/repos/${owner}/${repo}/contents/${path}`, { params });
  }

  /**
   * 创建或更新文件
   * @param owner 仓库所有者
   * @param repo 仓库名称
   * @param path 文件路径
   * @param message 提交信息
   * @param content 文件内容（Base64编码）
   * @param sha 若更新文件，则需要提供文件的SHA
   * @param branch 分支名称，默认为仓库的默认分支
   */
  async createOrUpdateFile(
    owner: string,
    repo: string,
    path: string,
    message: string,
    content: string,
    sha: string | null,
    branch?: string
  ) {
    const body: any = { message, content };
    if (sha) body.sha = sha;
    if (branch) body.branch = branch;

    return this.request<GitContent>(`/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      body
    });
  }

  async downloadContent(content: GitContent) {
    if (content.type === 'dir') return;
    downloadFile(content.download_url, content.name)
      .catch((err: any) => {
        if (err.status && err.status == 429) {
          this.request<GitContent>(content.url).then((content: GitContent) => {
            decodeAndDownloadBase64WithoutMime(content.content, content.name);
          })
        }
      })
  }


  /**
   * 删除文件
   * @param owner 仓库所有者
   * @param repo 仓库名称
   * @param path 文件路径
   * @param message 提交信息
   * @param sha 文件的SHA，必须提供
   * @param branch 分支名称，默认为仓库的默认分支
   */
  async deleteFile(
    owner: string,
    repo: string,
    path: string,
    message: string,
    sha: string,
    branch?: string
  ) {
    const body: any = { message, sha };
    if (branch) body.branch = branch;

    return this.request(`/repos/${owner}/${repo}/contents/${path}`, {
      method: 'DELETE',
      body
    });
  }

  /**
 * 重命名或移动文件
 * @param owner 仓库所有者
 * @param repo 仓库名称
 * @param oldPath 原始文件路径
 * @param newPath 新文件路径
 * @param message 提交信息
 * @param branch 分支名称，默认为仓库的默认分支
 */
  async renameFile(
    owner: string,
    repo: string,
    oldPath: string,
    newPath: string,
    message: string,
    branch?: string
  ) {
    // 先获取原文件内容
    const fileContent = await this.getContents(owner, repo, oldPath, branch);
    if (Array.isArray(fileContent)) {
      throw new Error('路径指向的是目录而非文件');
    }

    await this.createOrUpdateFile(
      owner,
      repo,
      newPath,
      message,
      fileContent.content,
      fileContent.sha,
      branch
    );

    return this.deleteFile(
      owner,
      repo,
      oldPath,
      message,
      fileContent.sha,
      branch
    );
  }

  /**
   * 删除文件夹及其内容
   * @param owner 仓库所有者
   * @param repo 仓库名称
   * @param path 文件夹路径
   * @param message 提交信息
   * @param branch 分支名称，默认为仓库的默认分支
   */
  async deleteDirectory(
    owner: string,
    repo: string,
    path: string,
    message: string,
    branch?: string
  ) {
    const contents = await this.getContents(owner, repo, path, branch);
    if (!Array.isArray(contents)) {
      throw new Error('路径指向的是文件而非目录');
    }

    // 递归删除所有内容
    for (const item of contents) {
      if (item.type === 'file') {
        await this.deleteFile(
          owner,
          repo,
          item.path,
          message,
          item.sha,
          branch
        );
      } else if (item.type === 'dir') {
        await this.deleteDirectory(
          owner,
          repo,
          item.path,
          message,
          branch
        );
      }
    }

    // 删除空目录本身（GitHub API会自动处理空目录删除）
    return true;
  }

  /**
   * 重命名或移动文件夹
   * @param owner 仓库所有者
   * @param repo 仓库名称
   * @param oldPath 原始文件夹路径
   * @param newPath 新文件夹路径
   * @param message 提交信息
   * @param branch 分支名称，默认为仓库的默认分支
   */
  async renameDirectory(
    owner: string,
    repo: string,
    oldPath: string,
    newPath: string,
    message: string,
    branch?: string
  ) {
    const contents = await this.getContents(owner, repo, oldPath, branch);
    if (!Array.isArray(contents)) {
      throw new Error('路径指向的是文件而非目录');
    }

    console.log(oldPath, newPath);

    // 递归移动所有内容
    for (const item of contents) {
      const newItemPath = item.path.replace(oldPath, newPath);
      if (item.type === 'file') {
        await this.renameFile(
          owner,
          repo,
          item.path,
          newItemPath,
          message,
          branch
        );
      } else if (item.type === 'dir') {
        await this.renameDirectory(
          owner,
          repo,
          item.path,
          newItemPath,
          message,
          branch
        );
      }
    }

    return true;
  }

  /**
   * 获取仓库的分支列表
   * @param owner 仓库所有者
   * @param repo 仓库名称
   */
  async listBranches(owner: string, repo: string) {
    return this.request(`/repos/${owner}/${repo}/branches`);
  }

  /**
   * 创建新分支
   * @param owner 仓库所有者
   * @param repo 仓库名称
   * @param branchName 新分支名称
   * @param sha 创建分支的起点，通常是某个提交的SHA
   */
  async createBranch(owner: string, repo: string, branchName: string, sha: string) {
    return this.request(`/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      body: {
        ref: `refs/heads/${branchName}`,
        sha
      }
    });
  }

  /**
   * 获取仓库的提交列表
   * @param owner 仓库所有者
   * @param repo 仓库名称
   * @param branch 分支名称
   * @param path 文件路径过滤
   * @param perPage 每页显示数量
   * @param page 页码
   */
  async listCommits(
    owner: string,
    repo: string,
    branch?: string,
    path?: string,
    perPage: number = 30,
    page: number = 1
  ) {
    const params: Record<string, string | number> = {
      per_page: perPage,
      page
    };
    if (branch) params.sha = branch;
    if (path) params.path = path;

    return this.request(`/repos/${owner}/${repo}/commits`, { params });
  }

  /**
   * 获取仓库的某个文件的提交历史
   * @param owner 仓库所有者
   * @param repo 仓库名称
   * @param path 文件路径
   */
  async getFileCommits(owner: string, repo: string, path: string) {
    return this.request(`/repos/${owner}/${repo}/commits`, {
      params: { path }
    });
  }

  /**
   * 获取仓库的所有issue
   * @param owner 仓库所有者
   * @param repo 仓库名称
   * @param state issue状态：open, closed, all
   */
  async listIssues(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open') {
    return this.request(`/repos/${owner}/${repo}/issues`, {
      params: { state }
    });
  }

  /**
   * 创建issue
   * @param owner 仓库所有者
   * @param repo 仓库名称
   * @param title issue标题
   * @param body issue内容
   */
  async createIssue(owner: string, repo: string, title: string, body: string) {
    return this.request(`/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      body: { title, body }
    });
  }

  /**
   * 获取仓库所有release
   * @param owner 仓库所有者
   * @param repo 仓库名称
   */
  async listReleases(owner: string, repo: string) {
    return this.request(`/repos/${owner}/${repo}/releases`);
  }

  /**
   * 创建release
   * @param owner 仓库所有者
   * @param repo 仓库名称
   * @param tagName 标签名
   * @param name release名称
   * @param body release描述
   * @param draft 是否是草稿
   * @param prerelease 是否是预发布版本
   */
  async createRelease(
    owner: string,
    repo: string,
    tagName: string,
    name: string,
    body: string,
    draft: boolean = false,
    prerelease: boolean = false
  ) {
    return this.request(`/repos/${owner}/${repo}/releases`, {
      method: 'POST',
      body: {
        tag_name: tagName,
        name,
        body,
        draft,
        prerelease
      }
    });
  }
}

// 辅助函数：创建GitHub仓库管理器实例
export function createGitHubRepoManager(token: string): GitHubRepoManager {
  return new GitHubRepoManager(token);
}