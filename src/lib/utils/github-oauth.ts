// src/lib/github-oauth.ts

/**
 * GitHub OAuth 授权流程管理器
 */
export class GitHubOAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private scope: string;

  /**
   * 初始化 GitHub OAuth 管理器
   * @param clientId 应用的客户端ID
   * @param clientSecret 应用的客户端密钥
   * @param redirectUri 授权回调URI
   * @param scope 请求的权限范围，以空格分隔
   */
  constructor(
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    scope: string = 'repo'
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.scope = scope;
  }

  /**
   * 生成授权URL
   * @param state 随机状态字符串，用于防止CSRF攻击
   * @returns 授权URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scope,
      state: state
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  /**
   * 使用授权码交换访问令牌
   * @param code 授权码
   * @param state 状态验证字符串
   * @returns 访问令牌和其他相关信息
   */
  async getAccessToken(code: string, state: string): Promise<{ access_token: string, token_type: string, scope: string }> {
    const tokenUrl = 'https://github.com/login/oauth/access_token';
    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code: code,
      redirect_uri: this.redirectUri,
      state: state
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error(`获取访问令牌失败: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }
}

// 在客户端存储状态值
export function saveOAuthState(state: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('github_oauth_state', state);
  }
}

// 从客户端存储中获取状态值
export function getOAuthState(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('github_oauth_state');
  }
  return null;
}

// 清除状态值
export function clearOAuthState(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('github_oauth_state');
  }
}

/**
 * 启动 OAuth 授权流程
 * @param clientId 客户端ID
 * @param clientSecret 客户端密钥
 * @param callbackPath 回调路径
 * @param baseUrl 基础 url
 * @param scope 请求的权限范围
 */
export function startOAuthFlow(
  clientId: string,
  clientSecret: string,
  callbackPath: string = '/callback',
  baseUrl: string = 'http://localhost:3002',
  scope: string = 'repo'
): void {
  // 生成随机状态字符串防止CSRF攻击
  const state = Math.random().toString(36).substring(2, 15);

  // 保存状态到 sessionStorage 以便回调时验证
  saveOAuthState(state);

  // 创建重定向URI
  const redirectUri = `${baseUrl}${callbackPath}`;

  // 初始化OAuth客户端
  const oauth = new GitHubOAuth(clientId, clientSecret, redirectUri, scope);

  // 获取授权URL
  const authUrl = oauth.getAuthorizationUrl(state);

  // 重定向到GitHub授权页面
  if (typeof window !== 'undefined') {
    window.location.href = authUrl;
  }
}