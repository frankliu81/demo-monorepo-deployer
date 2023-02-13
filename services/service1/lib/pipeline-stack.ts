import { Construct, ConstructOrder } from "constructs";
import * as pipelines from "aws-cdk-lib/pipelines";
import { Stack, StackProps, Stage, StageProps } from "aws-cdk-lib";
import { Service1Stack } from "./service1-stack";
import { LinuxBuildImage } from "aws-cdk-lib/aws-codebuild";

const ROOT_PATH='services/service1';
class MyApplication extends Stage {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    
    //what do you want the codepipeline to do for it in this stage
    new Service1Stack(this, 'production', {
      stackName: 'Service1StackProduction',
    })
  }
}

// we will put in dil-deploy-sandbox, it will deploy to other accounts
export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);


    // create codestar connection
    const pipeline = new pipelines.CodePipeline(this, "pipeline", {
      // we need to make sure the key it uses for s3 bucket to store artifacts can be accessed cross account
      crossAccountKeys: true,
      // usse the latest version of the linux image
      codeBuildDefaults: {
        buildEnvironment: {
          buildImage: LinuxBuildImage.STANDARD_6_0
        }
      }
      ,    
      synth: new pipelines.ShellStep("Synth", {
        primaryOutputDirectory: `${ROOT_PATH}/cdk.out`,
        input: pipelines.CodePipelineSource.connection("frankliu81/demo-monorepo-deployer", "main", {
            connectionArn: "arn:aws:codestar-connections:ca-central-1:536986426115:connection/2d6e17b4-f9e0-4ec9-808b-9ca1803105ec",
          }),
        commands: [
          `cd ${ROOT_PATH}`,
          'pwd',
          'npm ci',
          'npm test',
          'npm run build',
          'CDK_SCOPE=fliu npm run cdk synth'
        ] 
      })
    });

    pipeline.addStage(
      new MyApplication(this, 'Production', {
      env: {
        account: '536986426115', // spg-energy-playground
        region: 'ca-central-1'
      }
    }), {
      pre: [
        new pipelines.ManualApprovalStep('Deploy')
      ]
    })
    // deploy to new account and new reegion
  }
}