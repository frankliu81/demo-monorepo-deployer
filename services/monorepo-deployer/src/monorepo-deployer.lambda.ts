
import { CodePipelineClient, StartPipelineExecutionCommand } from "@aws-sdk/client-codepipeline";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const handler = async (event: any, context: any, callback: any) => {
  console.log("CDK_SCOPE " + process.env.CDK_SCOPE)
  console.log("event " + JSON.stringify(event, null, 2))

  if (event.body) // if there is body from the github org event
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