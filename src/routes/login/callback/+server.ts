// src/routes/callback/+server.ts
import { GitHubOAuth } from '$lib/utils/github-oauth';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, cookies }) => {
  const code = url.searchParams.get('code') || "";
  const state = url.searchParams.get('state') || "";

  // 验证状态...
  // 获取访问令牌...
  // 获取 OAuth 应用配置
  // 在实际应用中，这些值应该从环境变量或服务器端获取
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_GITHUB_CLIENT_SECRET;
  const redirectUri = url.origin + "/login/redirect";

  // 初始化 OAuth 客户端
  const oauth = new GitHubOAuth(clientId, clientSecret, redirectUri);

  // 交换授权码获取访问令牌
  const tokenResponse = await oauth.getAccessToken(code, state);

  // 重定向到仪表盘
  return json(tokenResponse);
};