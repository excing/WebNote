<script lang="ts">
  import { onMount } from "svelte";
  import {
    GitHubOAuth,
    getOAuthState,
    clearOAuthState,
  } from "$lib/utils/github-oauth";
  import { goto } from "$app/navigation";
  import { githubAuth } from "$lib/stores/githubAuth";

  let userName: string | null = null;

  onMount(async () => {
    try {
      githubAuth.setLoading(true);

      // 解析URL查询参数
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");
      const storedState = getOAuthState();

      // 验证参数
      if (!code) {
        throw new Error("未收到授权码");
      }

      if (!state || !storedState || state !== storedState) {
        throw new Error("状态验证失败，可能存在CSRF攻击");
      }

      // 清除已使用的状态
      clearOAuthState();

      // 交换授权码获取访问令牌
      const tokenResponse = await fetch(
        `/login/callback?code=${code}&state=${state}`,
      );

      if (!tokenResponse.ok) {
        throw new Error(tokenResponse.statusText);
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // 可选：获取用户信息
      if (accessToken) {
        const userResponse = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `token ${accessToken}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          userName = userData.name || userData.login;
        }

        // 将访问令牌存储到localStorage（实际应用中应使用更安全的存储方式）
        githubAuth.setAccessToken(accessToken);
        // 3秒后跳转到主页
        setTimeout(() => {
          goto("/");
        }, 3000);
      }
    } catch (err: any) {
      githubAuth.setError(err.message || "授权过程发生错误");

      console.error("OAuth错误:", err);
    } finally {
      githubAuth.setLoading(false);
    }
  });
</script>

<!-- // src/routes/callback/+page.svelte -->
<div class="container">
  <h1>GitHub 授权回调</h1>

  {#if $githubAuth.isLoading}
    <p>正在处理授权请求，请稍候...</p>
    <div class="loader"></div>
  {:else if $githubAuth.error}
    <div class="error">
      <h2>授权失败</h2>
      <p>{$githubAuth.error}</p>
      <a href="/">返回首页</a>
    </div>
  {:else}
    <div class="success">
      <h2>授权成功！</h2>
      {#if userName}
        <p>欢迎，{userName}！</p>
      {/if}
      <p>您已成功授权应用访问您的GitHub账户。</p>
      <p>即将跳转到仪表盘...</p>
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 1rem;
    text-align: center;
  }

  .loader {
    border: 5px solid #f3f3f3;
    border-top: 5px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 1rem auto;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .error {
    color: #e74c3c;
    padding: 1rem;
    border: 1px solid #e74c3c;
    border-radius: 5px;
  }

  .success {
    color: #2ecc71;
    padding: 1rem;
    border: 1px solid #2ecc71;
    border-radius: 5px;
  }

  a {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background-color: #3498db;
    color: white;
    text-decoration: none;
    border-radius: 3px;
  }
</style>
