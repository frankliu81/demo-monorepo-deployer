import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import {Runtime} from "aws-cdk-lib/aws-lambda";
import * as path from 'path';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as ssm from "aws-cdk-lib/aws-ssm";
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';


export class MonorepoDeployerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const service1PipelineName = ssm.StringParameter.valueForStringParameter(
      this,
      `/service1/pipeline_stack/codepipeline_name`);

    // The code that defines your stack goes here
    const lambdaFunction = new NodejsFunction(this, "frank-demo-monorepo-deployer", {
      runtime: Runtime.NODEJS_16_X,
      entry: path.join(__dirname, "../src/index.ts"),
      handler: 'handler', // this string should match the exports in lambda
      // bundling: {
      //   externalModules: ['aws-sdk'] // this was for AWS SDK v2 which is included in Node 16, 
                                        // we will use AWS SDK v3, and have to bundle it.
      // },
      environment: {
        CDK_SCOPE: process.env.CDK_SCOPE!,
        SERVICE1_CODEPIPELINE_NAME: service1PipelineName
      },
      initialPolicy: [
        // permission for lambda to execute codepipelin
        new PolicyStatement({
          actions: [
            'codepipeline:*',
          ],
          resources: [
            '*'
          ]
        })
      ]
    });

    const api = new LambdaRestApi(this, "frank-demo-monorepo-deployer-api", {
      handler: lambdaFunction,
    } )

    // https://towardsthecloud.com/aws-cdk-s3-bucket
    const s3Bucket = new s3.Bucket(this, 'frank-monorepo-deployer-bucket', {
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryptionKey: new kms.Key(this, 's3BucketKMSKey'),
    });

    s3Bucket.grantRead(lambdaFunction)
  }
}
