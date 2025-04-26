// src/lib/stores/githubAuth.ts
import { writable } from 'svelte/store';
import { goto } from '$app/navigation';
import { createGitHubRepoManager, type GitContent, type GitRepository } from '$lib/utils/github';

interface GitHubAuthState {
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  noteRepos: GitRepository[]; // Add note repositories to the state
  defaultRepo: GitRepository | null;
  user: any;
  historyNotes: {
    repo: string,
    content: GitContent,
  }[]; // 历史文件编辑记录
}

const initialState: GitHubAuthState = {
  accessToken: null,
  isLoading: false,
  error: null,
  noteRepos: [], // Initialize empty array
  defaultRepo: null,
  user: null,
  historyNotes: [],
};

function createGitHubAuthStore() {
  const { subscribe, set, update } = writable<GitHubAuthState>(initialState);

  // Initialize from localStorage
  function init() {
    update(state => {
      const token = localStorage.getItem('github_access_token');
      const savedNoteRepos = localStorage.getItem('github_note_repos');
      const savedDefaultRepo = localStorage.getItem('github_default_repo');
      const savedHistoryNotes = localStorage.getItem('history_notes');
      return {
        ...state,
        accessToken: token,
        noteRepos: savedNoteRepos ? JSON.parse(savedNoteRepos) : [],
        defaultRepo: savedDefaultRepo ? JSON.parse(savedDefaultRepo) : null,
        historyNotes: savedHistoryNotes ? JSON.parse(savedHistoryNotes) : []
      };
    });
  }

  // Add methods for note 
  function addContent(repo: string, content: GitContent) {
    update(state => {
      const newNote = { repo: repo, content: content };
      let historyNotes = [...state.historyNotes];

      // 移除已存在的笔记 (如果存在)
      historyNotes = historyNotes.filter(r => !(r.repo === repo && r.content.path === content.path));

      // 将新笔记放在最前面
      historyNotes = [newNote, ...historyNotes];

      localStorage.setItem('history_notes', JSON.stringify(historyNotes));
      return { ...state, historyNotes: historyNotes };
    });
  }

  // Delete methods for note 
  function deleteContent(repo: string, path: string) {
    update(state => {
      // 移除已存在的笔记 (如果存在)
      let historyNotes = state.historyNotes.filter(r => !(r.repo === repo && r.content.path === path));

      localStorage.setItem('history_notes', JSON.stringify(historyNotes));
      return { ...state, historyNotes: historyNotes };
    });
  }

  // Add methods for note repositories
  function addNoteRepo(repo: GitRepository) {
    update(state => {
      let defaultRepo = state.defaultRepo || repo;
      // Check if repo already exists
      let newNoteRepos = state.noteRepos.filter(r => r.id !== repo.id);

      newNoteRepos = [repo, ...newNoteRepos];

      newNoteRepos = newNoteRepos.filter(r => r.id !== defaultRepo.id);
      newNoteRepos = [defaultRepo, ...newNoteRepos];

      localStorage.setItem('github_default_repo', JSON.stringify(defaultRepo));
      localStorage.setItem('github_note_repos', JSON.stringify(newNoteRepos));
      return { ...state, defaultRepo, noteRepos: newNoteRepos };
    });
  }

  function removeNoteRepo(repoId: number) {
    update(state => {
      let defaultRepo = (state.defaultRepo && state.defaultRepo.id === repoId) ? null : state.defaultRepo;
      let newNoteRepos = state.noteRepos.filter(r => r.id !== repoId);

      if (1 <= newNoteRepos.length) defaultRepo = newNoteRepos[0];

      localStorage.setItem('github_default_repo', JSON.stringify(defaultRepo));
      localStorage.setItem('github_note_repos', JSON.stringify(newNoteRepos));
      return { ...state, defaultRepo, noteRepos: newNoteRepos };
    });
  }

  function setDefaultRepo(repo: GitRepository | null) {
    update(state => {
      let newNoteRepos = [...state.noteRepos];
      if (repo) {
        newNoteRepos = newNoteRepos.filter(r => r.id !== repo.id);
        newNoteRepos = [repo, ...newNoteRepos];
        localStorage.setItem('github_default_repo', JSON.stringify(repo));
        localStorage.setItem('github_note_repos', JSON.stringify(newNoteRepos));
      } else {
        localStorage.removeItem('github_default_repo');
      }
      return { ...state, defaultRepo: repo, noteRepos: newNoteRepos };
    });
  }

  function clearNoteRepos() {
    update(state => {
      localStorage.removeItem('github_note_repos');
      return { ...state, noteRepos: [] };
    });
  }

  // Set the access token
  function setAccessToken(token: string) {
    localStorage.setItem('github_access_token', token);
    update(state => ({ ...state, accessToken: token, error: null }));
  }

  // Clear the access token (logout)
  function clearAccessToken() {
    localStorage.removeItem('github_access_token');
    update(state => ({ ...state, accessToken: null, error: null }));
    goto('/login');
  }

  // Check if user is authenticated
  function isAuthenticated(): Promise<boolean> {
    return new Promise((resolve) => {
      subscribe(state => {
        resolve(!!state.accessToken);
      })();
    });
  }

  // Set error state
  function setError(message: string) {
    update(state => ({ ...state, error: message }));
  }

  // Set loading state
  function setLoading(isLoading: boolean) {
    update(state => ({ ...state, isLoading }));
  }

  // Add this method to the return object in createGitHubAuthStore()
  async function createRepository(accessToken: string | null, options: {
    name: string;
    description?: string; // max 350 chats
    private?: boolean;
  }): Promise<any> {
    setLoading(true);
    setError("");
    try {
      if (!accessToken) throw new Error('Not authenticated');

      const github = createGitHubRepoManager(accessToken);
      const newRepo = await github.createRepository(options);

      addNoteRepo(newRepo)

      return newRepo;
    } catch (error: any) {
      setError(error.message || 'Failed to create repository');
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function setUser(user: any) {
    update(state => ({ ...state, user: user, error: null }));
  }

  return {
    subscribe,
    init,
    setAccessToken,
    clearAccessToken,
    isAuthenticated,
    setError,
    setLoading,
    setUser,
    createRepository,
    addNoteRepo,
    removeNoteRepo,
    addContent,
    deleteContent,
    setDefaultRepo,
    clearNoteRepos
  };
}

export const githubAuth = createGitHubAuthStore();