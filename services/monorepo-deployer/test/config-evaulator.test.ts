import { githubEventService1Change } from './github-event-service1'
import { githubEventMultipleCommits } from './github-event-multiple-commits'
import { githubEventNoService1Change } from './github-event-no-service1'

import { assert } from 'console';
import type { StringMap } from "../src/interface";
import { extractRepoBranchFromGithubEvent, getFilesFromCommit, getFilesFromCommits, } from '../src/config-evaluator'

test('extractRepoBranchFromGithubEvent', () => {
  const githubRepoInfo = extractRepoBranchFromGithubEvent(githubEventService1Change);

  expect(githubRepoInfo.repository).toMatch('demo-monorepo-deployer')
  expect(githubRepoInfo.branch).toMatch('main')
})

test('getFilesFromCommit', () => {
  const commit = {
    "added": ["services/service2/test/service2.test.ts"],
    "removed": ["services/service2/test/service2-temp.test.ts"],
    "modified": ["services/service2/bin/service2.ts"]
  }
  const files = getFilesFromCommit(commit);
  expect(files.sort()).toEqual([
    'services/service2/bin/service2.ts',
    'services/service2/test/service2-temp.test.ts',
    'services/service2/test/service2.test.ts'
  ])
})

test('getFilesFromCommits', () => {
  const files = getFilesFromCommits(githubEventMultipleCommits["commits"]);
  expect(files.sort()).toEqual([
    'services/monorepo-deployer/src/config-evaluator.ts',
    'services/monorepo-deployer/src/monorepo-deployer.lambda.ts',
    'services/monorepo-deployer/test/github-event-no-service1.ts',
    'services/monorepo-deployer/test/lambda-event-example.ts',
    'services/service2/bin/service2.ts',
    'services/service2/bin/service2.ts',
    'services/service2/src/index.ts',
    'services/service2/test/hello.test.ts',
    'services/service2/test/service2.test.ts'
  ])
})
