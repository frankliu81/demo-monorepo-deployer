
import { CodePipelineClient, StartPipelineExecutionCommand } from "@aws-sdk/client-codepipeline";
import { extractRepoBranchFromGithubEvent, fetchConfigs, getObject } from "./config-evaluator";
// const BUCKET_NAME = process.env.BUCKET_NAME || ''

export const handler = async (event: any, context: any, callback: any) => {
  console.log("CDK_SCOPE " + process.env.CDK_SCOPE)
  console.log("event " + JSON.stringify(event, null, 2))
  
  // const config = await getObject({
  //   Bucket: BUCKET_NAME,
  //   Key: "demo-monorepo-deployer/main/service1/config.json"
  // })
  // console.log(`config: ${config}`);

  let parsedEvent = JSON.parse(event.body);
  const githubRepoInfo = extractRepoBranchFromGithubEvent(parsedEvent);
  (await fetchConfigs(githubRepoInfo)).map( (config) => { console.log(`${config}\n`)})

  if (parsedEvent) // if parsedEvent is not null, ie. is returned from the github org webhook event
  {
    console.log("parsed event.body" + JSON.stringify(parsedEvent))
    const name = parsedEvent['repository']['name']
    console.log("respository name " + name)
    
    if (name === 'jobi') {
      return {
        statusCode: 200,
        headers: {},
        body: "skipped"
      };
    }

    if (name == 'demo-monorepo-deployer')
    {
    }
  }

  // TESTING - lambda triggering pipeline directly without github event
  // codepipeline name passed in from env variable from SSM set by service1
  // console.log("SERVICE1_CODEPIPELINE_NAME " + process.env.SERVICE1_CODEPIPELINE_NAME)
  // const client = new CodePipelineClient({ region: "ca-central-1" });
  // const input = { // StartPipelineExecutionInput
  //   name: process.env.SERVICE1_CODEPIPELINE_NAME, // required
  //   // clientRequestToken: "STRING_VALUE",
  // };
  // const command = new StartPipelineExecutionCommand(input);
  // const response = await client.send(command);

  return {
    statusCode: 200,
    headers: {},
    body: "success"
  };
};