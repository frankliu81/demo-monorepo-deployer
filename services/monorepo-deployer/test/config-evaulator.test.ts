import { githubEventService1Change } from './github-event-service1'
import { githubEventNoService1Change } from './github-event-no-service1'
import { assert } from 'console';
import { extractRepoBranchFromGithubEvent } from '../src/config-evaluator'

test('extractRepoBranchFromGithubEvent', () => {
  const githubRepoInfo = extractRepoBranchFromGithubEvent(githubEventService1Change);

  expect(githubRepoInfo.repository).toMatch('demo-monorepo-deployer')
  expect(githubRepoInfo.branch).toMatch('main')
})
