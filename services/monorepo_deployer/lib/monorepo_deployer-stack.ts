import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import {Runtime} from "aws-cdk-lib/aws-lambda";
import * as path from 'path';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as kms from 'aws-cdk-lib/aws-kms';
//import * as iam from 'aws-cdk-lib/aws-iam';


export class MonorepoDeployerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const lambdaFunction = new NodejsFunction(this, "frank-demo-monorepo-deployer", {
      runtime: Runtime.NODEJS_16_X,
      entry: path.join(__dirname, "../src/index.ts"),
      handler: 'handler', // this string should match the exports in lambda
      bundling: {
        externalModules: ['aws-sdk']
      },
      
      environment: {
       CDK_SCOPE: process.env.CDK_SCOPE!,
      }
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

    //s3Bucket.grantRead(new iam.AccountRootPrincipal());
    s3Bucket.grantRead(lambdaFunction)
  }
}
