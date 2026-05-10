#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CognitoStack } from '../lib/stacks/cognito-stack';
import { DatabaseStack } from '../lib/stacks/database-stack';
import { StorageStack } from '../lib/stacks/storage-stack';
import { ApiStack } from '../lib/stacks/api-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: 'eu-north-1', // same region as existing Cognito User Pool
};

const cognitoStack = new CognitoStack(app, 'CoreHealth-Cognito', { env });

const databaseStack = new DatabaseStack(app, 'CoreHealth-Database', { env });

const storageStack = new StorageStack(app, 'CoreHealth-Storage', { env });

const apiStack = new ApiStack(app, 'CoreHealth-Api', {
  env,
  userPool: cognitoStack.userPool,
  userPoolClient: cognitoStack.userPoolClient,
  dbSecret: databaseStack.dbSecret,
  dbEndpoint: databaseStack.dbEndpoint,
  vpc: databaseStack.vpc,
  lambdaSecurityGroup: databaseStack.lambdaSecurityGroup,
  documentsBucket: storageStack.documentsBucket,
});

// Explicit dependency ordering
databaseStack.addDependency(cognitoStack);
apiStack.addDependency(databaseStack);
apiStack.addDependency(storageStack);
