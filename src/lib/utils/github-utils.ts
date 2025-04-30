import { createGitHubRepoManager, type GitContent, type GitRepository } from "./github";

export function stringifyRepositoryDescription(name: string, description: string) {
  return JSON.stringify({
    name: name,
    description: description,
  })
}

export function parseRepositoryDescription(repository: GitRepository) {
  try {
    if (!repository) return {
      name: "",
      description: "",
    }
    const noteRepo = JSON.parse(repository.description || "");
    const repoName = noteRepo ? (noteRepo.name || repository.name) : repository.name;
    const repoDesc = noteRepo ? (noteRepo.description || repository.description) : repository.description;
    return {
      name: repoName,
      description: repoDesc,
    }
  } catch (err) {
    return {
      name: repository.name,
      description: repository.description,
    }
  }
}

export async function downloadFile(
  url: string,
  filename: string,
  options?: {
    method?: string;
    headers?: Record<string, string>;
    body?: BodyInit;
    onProgress?: (loaded: number, total: number) => void;
  }
): Promise<void> {
  try {
    // 1. 先下载到内存
    const response = await fetch(url, {
      method: options?.method || 'GET',
      headers: options?.headers,
      body: options?.body,
    });

    if (!response.ok) {
      throw {
        status: response.status,
        data: response.statusText,
      };
    }

    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength) : 0;
    let loaded = 0;

    // 使用 ReadableStream 来处理进度
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get reader from response body');
    }

    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      loaded += value.length;

      // 触发进度回调
      if (options?.onProgress) {
        options.onProgress(loaded, total);
      }
    }

    // 合并所有 chunks
    const blob = new Blob(chunks);

    // 2. 再保存到本地
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // 清理
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

// fileUtils.ts

// 常见文件扩展名到 MIME 类型的映射
const mimeTypeMap: Record<string, string> = {
  // 图片
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'svg': 'image/svg+xml',
  'bmp': 'image/bmp',

  // 文档
  'pdf': 'application/pdf',
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'xls': 'application/vnd.ms-excel',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'ppt': 'application/vnd.ms-powerpoint',
  'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'txt': 'text/plain',
  'csv': 'text/csv',

  // 压缩文件
  'zip': 'application/zip',
  'rar': 'application/x-rar-compressed',
  '7z': 'application/x-7z-compressed',

  // 音频
  'mp3': 'audio/mpeg',
  'wav': 'audio/wav',
  'ogg': 'audio/ogg',

  // 视频
  'mp4': 'video/mp4',
  'webm': 'video/webm',
  'mov': 'video/quicktime',

  // 默认
  'bin': 'application/octet-stream'
};

function getMimeTypeFromFilename(filename: string): string {
  // 提取文件扩展名
  const extension = filename.split('.').pop()?.toLowerCase() || 'bin';

  // 返回对应的 MIME 类型，未知类型使用默认的二进制流类型
  return mimeTypeMap[extension] || 'application/octet-stream';
}

export function decodeAndDownloadBase64WithoutMime(
  base64String: string,
  filename: string
): void {
  const mimeType = getMimeTypeFromFilename(filename);
  decodeAndDownloadBase64(base64String, filename, mimeType);
}

// fileUtils.ts
export function decodeAndDownloadBase64(
  base64String: string,
  filename: string,
  mimeType?: string
): void {
  try {
    // 1. 将 Base64 字符串转换为 Blob
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    // 2. 创建下载链接并触发下载
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // 清理
    URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Base64 decode and download failed:', error);
    throw error;
  }
}

// 增强版：自动从 dataURL 中提取 MIME 类型
export function decodeDataUrlAndDownload(
  dataUrl: string,
  filename: string
): void {
  // 提取 MIME 类型和 base64 数据
  const matches = dataUrl.match(/^data:(.+?);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid data URL format');
  }

  const mimeType = matches[1];
  const base64Data = matches[2];

  decodeAndDownloadBase64(base64Data, filename, mimeType);
}