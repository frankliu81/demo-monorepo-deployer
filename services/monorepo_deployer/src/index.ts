
import { CodePipelineClient, AcknowledgeJobCommand, StartPipelineExecutionCommand } from "@aws-sdk/client-codepipeline";

export const handler = async (event: any, context: any, callback: any) => {
  console.log("CDK_SCOPE " + process.env.CDK_SCOPE)
  console.log("event " + JSON.stringify(event, null, 2))
  console.log("SERVICE1_CODEPIPELINE_NAME " + process.env.SERVICE1_CODEPIPELINE_NAME)


  if (event.body)
  {
    console.log("parse event.body" + JSON.stringify(JSON.parse(event.body)))
    const name = JSON.parse(event.body)['repository']['name']
    console.log("parse respository name " + name)

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
  const client = new CodePipelineClient({ region: "ca-central-1" });
  const input = { // StartPipelineExecutionInput
    name: process.env.SERVICE1_CODEPIPELINE_NAME, // required
    // clientRequestToken: "STRING_VALUE",
  };
  const command = new StartPipelineExecutionCommand(input);
  const response = await client.send(command);

  return {
    statusCode: 200,
    headers: {},
    body: "success"
  };
};