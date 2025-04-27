import type { GitRepository } from "./github";

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