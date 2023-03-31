

export const handler = async (event: any, context: any, callback: any) => {
  console.log("CDK_SCOPE " + process.env.CDK_SCOPE)
  console.log("SERVICE1_CODEPIPELINE_NAME " + process.env.SERVICE1_CODEPIPELINE_NAME)
  console.log("event " + JSON.stringify(event, null, 2))
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

  return {
    statusCode: 200,
    headers: {},
    body: "success"
  };
};