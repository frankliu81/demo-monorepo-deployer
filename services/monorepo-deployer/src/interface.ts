export interface BucketReference {
  Bucket: string;
  Key: string;
}

export interface GithubRepoInfo {
  repository: string;
  branch: string;
}

export type StringMap = { [key: string]: any }