// src/lib/stores/githubAuth.ts
import { writable } from 'svelte/store';
import { goto } from '$app/navigation';
import { createGitHubRepoManager, type GitContent, type GitRepository } from '$lib/utils/github';

interface GitHubAuthState {
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  noteRepos: any[]; // Add note repositories to the state
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
      const savedHistoryNotes = localStorage.getItem('history_notes');
      return {
        ...state,
        accessToken: token,
        noteRepos: savedNoteRepos ? JSON.parse(savedNoteRepos) : [],
        historyNotes: savedHistoryNotes ? JSON.parse(savedHistoryNotes) : []
      };
    });
  }

  // Add methods for note 
  function addContent(repo: string, content: GitContent) {
    update(state => {
      // Check if repo already exists
      const exists = state.historyNotes.some(r => (r.repo === repo && r.content.path === content.path));
      if (exists) return state;

      const historyNotes = [...state.historyNotes, { repo: repo, content: content }];
      localStorage.setItem('history_notes', JSON.stringify(historyNotes));
      return { ...state, historyNotes: historyNotes };
    });
  }

  // Add methods for note repositories
  function addNoteRepo(repo: any) {
    update(state => {
      // Check if repo already exists
      const exists = state.noteRepos.some(r => r.id === repo.id);
      if (exists) return state;

      const newNoteRepos = [...state.noteRepos, repo];
      localStorage.setItem('github_note_repos', JSON.stringify(newNoteRepos));
      return { ...state, noteRepos: newNoteRepos };
    });
  }

  function removeNoteRepo(repoId: number) {
    update(state => {
      const newNoteRepos = state.noteRepos.filter(r => r.id !== repoId);
      localStorage.setItem('github_note_repos', JSON.stringify(newNoteRepos));
      return { ...state, noteRepos: newNoteRepos };
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
    description?: string;
    private?: boolean;
  }): Promise<any> {
    setLoading(true);
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
    clearNoteRepos
  };
}

export const githubAuth = createGitHubAuthStore();