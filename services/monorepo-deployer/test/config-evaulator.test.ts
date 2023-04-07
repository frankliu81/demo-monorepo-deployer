import { githubEventService1Change } from './github-event-service1'
import { githubEventMultipleCommits } from './github-event-multiple-commits'
import { githubEventNoService1Change } from './github-event-no-service1'

import { assert } from 'console';
import type { StringMap } from "../src/interface";
import { extractRepoBranchFromGithubEvent, 
         getFilesFromCommit, 
         getFilesFromCommits,
         getUniqueFilesFromGithubEvent,
         doFilesMatchConfig,
         codepipelinesToTrigger } from '../src/config-evaluator'

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

test('getUniqueFilesFromGithubEvent', () => {
  const uniqueFiles = getUniqueFilesFromGithubEvent(githubEventMultipleCommits);
  expect(uniqueFiles.sort()).toEqual([
    'services/monorepo-deployer/src/config-evaluator.ts',
    'services/monorepo-deployer/src/monorepo-deployer.lambda.ts',
    'services/monorepo-deployer/test/github-event-no-service1.ts',
    'services/monorepo-deployer/test/lambda-event-example.ts',
    'services/service2/bin/service2.ts',
    'services/service2/src/index.ts',
    'services/service2/test/hello.test.ts',
    'services/service2/test/service2.test.ts'
  ])
})

test('doFilesMatchConfig - simple match, service1 file changed', () => {
  const config = {
    "codepipeline": "frank-service1-pipeline-pipelinePipeline4163A4B1-LOM549H37MWW",
    "ignore_patterns": [""],
    "match_patterns": ["services/service1/*"]
  }

  const files = [
    'services/service1/src/index.ts'
  ]

  const match = doFilesMatchConfig(config, files);
  expect(match).toEqual(true);
})

test('doFilesMatchConfig - simple no match, service2 file changed', () => {
  const config = {
    "codepipeline": "frank-service1-pipeline-pipelinePipeline4163A4B1-LOM549H37MWW",
    "ignore_patterns": [""],
    "match_patterns": ["services/service1/*"]
  }

  const files = [
    'services/service2/src/index.ts'
  ]

  const match = doFilesMatchConfig(config, files);
  expect(match).toEqual(false);
})

test('doFilesMatchConfig - one match, both service1 / service2 files changed', () => {
  const config = {
    "codepipeline": "frank-service1-pipeline-pipelinePipeline4163A4B1-LOM549H37MWW",
    "ignore_patterns": [""],
    "match_patterns": ["services/service1/*"]
  }

  const files = [
    'services/service1/src/index.ts',
    'services/service2/src/index.ts'
  ]

  const match = doFilesMatchConfig(config, files);
  expect(match).toEqual(true);
})

test('doFilesMatchConfig - simple ignore, .md file changed', () => {
  const config = {
    "codepipeline": "frank-service1-pipeline-pipelinePipeline4163A4B1-LOM549H37MWW",
    "ignore_patterns": [".*md$"],
    "match_patterns": ["services/service1/*"]
  }

  const files = [
    'services/service1/src/README.md'
  ]

  const match = doFilesMatchConfig(config, files);
  expect(match).toEqual(false);
})

test('codepipelinesToTrigger - trigger service1 pipeline', () => {
  const service1PipelineName = 'frank-service1-pipeline-pipelinePipeline4163A4B1-LOM549H37MWW';
  const configs = [{
    "codepipeline": service1PipelineName,
    "ignore_patterns": [""],
    "match_patterns": ["services/service1/*"]
  }]
  const codepipelines = codepipelinesToTrigger(githubEventService1Change, configs);
  // console.log("condepipelines " + codepipelines);

  expect([service1PipelineName]).toEqual(codepipelines);
})

test('codepipelinesToTrigger - do not trigger service1 pipeline', () => {
  const service1PipelineName = 'frank-service1-pipeline-pipelinePipeline4163A4B1-LOM549H37MWW';
  const configs = [{
    "codepipeline": service1PipelineName,
    "ignore_patterns": [""],
    "match_patterns": ["services/service1/*"]
  }]
  const codepipelines = codepipelinesToTrigger(githubEventNoService1Change, configs);
  // console.log("condepipelines " + codepipelines);

  expect([service1PipelineName]).not.toEqual(codepipelines);
})
