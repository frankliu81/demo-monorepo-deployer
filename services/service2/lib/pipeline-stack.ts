import { Construct, ConstructOrder } from "constructs";
import * as pipelines from "aws-cdk-lib/pipelines";
import { Stack, StackProps, Stage, StageProps } from "aws-cdk-lib";
import { Service2Stack } from "./service2-stack";
import { LinuxBuildImage } from "aws-cdk-lib/aws-codebuild";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';


const ROOT_PATH='services/service2';
class MyApplication extends Stage {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    
    //what do you want the codepipeline to do for it in this stage
    new Service2Stack(this, 'production', {
      stackName: 'Service2StackProduction',
    })
  }
}

// we will put in dil-deploy-sandbox, it will deploy to other accounts
export class PipelineStack extends Stack {
  pipelineInstance: pipelines.CodePipeline;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // create codestar connection
    this.pipelineInstance = new pipelines.CodePipeline(this, "pipeline", {
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
            triggerOnPush: false
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

    this.pipelineInstance.addStage(
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

    this.pipelineInstance.buildPipeline()

    // START monorepo deployer integration
    // read monorepo deployer bucket name
    const configBucketName = ssm.StringParameter.valueForStringParameter(
      this,
      '/demo_monorepo_deployer/bucket_name');

    // write to S3, a config file with codepipeline_name and deployment expression
    const importedConfigBucket = s3.Bucket.fromBucketName(
      this,
      'importedConfigBucketFromName',
      configBucketName,
    );

    new s3deploy.BucketDeployment(this, 'configFile2', {
      // bucket name is monorepo-deployer, filepath is ${respository}/${branch}/${service}/config.json
      sources: [s3deploy.Source.jsonData('config.json',
        { "codepipeline": `${this.pipelineInstance.pipeline.pipelineName}`,
           "ignore_patterns": [""],
           "match_patterns": ["services/service2/*"]
        }
      )],
      destinationKeyPrefix: 'demo-monorepo-deployer/main/service2',
      destinationBucket: importedConfigBucket,
    });
    // END monorepo deployer integration
    
    // deploy to new account and new region
  }
}