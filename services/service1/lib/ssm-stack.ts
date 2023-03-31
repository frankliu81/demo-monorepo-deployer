import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as pipelines from "aws-cdk-lib/pipelines";

export type SsmStackProps = cdk.StackProps & { codePipeline : pipelines.CodePipeline};

export class SsmStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: SsmStackProps) {
    super(scope, id, props);

    // write to SSM
    const ssmParam = new ssm.StringParameter(this, "codePipelineName", {
        parameterName: '/service1/pipeline_stack/codepipeline_name',
        stringValue: props!.codePipeline.pipeline.pipelineName
      })
    }
}
