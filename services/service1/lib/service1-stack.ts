import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import {Runtime} from "aws-cdk-lib/aws-lambda";
import * as path from 'path';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';


export class Service1Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const lambdaFunction = new NodejsFunction(this, "frank-demo-monorepo-deployer-service1", {
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

    let lambdaRestApiId;
    if (id === 'production' ) // deployed from pipeline
      lambdaRestApiId = "frank-demo-monorepo-deployer-service1-api-prod"
    else
      lambdaRestApiId = "frank-demo-monorepo-deployer-service1-api"
    const api = new LambdaRestApi(this, lambdaRestApiId, {
      handler: lambdaFunction,
    } )
    
  }
}
