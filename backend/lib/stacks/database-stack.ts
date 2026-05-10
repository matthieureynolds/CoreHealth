import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class DatabaseStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly dbSecret: secretsmanager.ISecret;
  public readonly dbEndpoint: string;
  public readonly lambdaSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC: 2 AZs, private subnets for RDS, public for NAT
    this.vpc = new ec2.Vpc(this, 'CoreHealthVpc', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 28,
          name: 'isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // Lambda SG — all Lambdas use this; needs outbound for Secrets Manager, OpenAI, Expo push, etc.
    this.lambdaSecurityGroup = new ec2.SecurityGroup(this, 'LambdaSG', {
      vpc: this.vpc,
      description: 'Lambda functions security group',
      allowAllOutbound: true,
    });

    // RDS SG — Lambdas connect directly (no proxy on free tier)
    const dbSG = new ec2.SecurityGroup(this, 'DbSG', {
      vpc: this.vpc,
      description: 'RDS instance security group',
      allowAllOutbound: false,
    });
    dbSG.addIngressRule(this.lambdaSecurityGroup, ec2.Port.tcp(5432));

    // RDS credentials stored in Secrets Manager automatically
    const dbCredentials = rds.Credentials.fromGeneratedSecret('corehealth_admin', {
      secretName: 'corehealth/db/credentials',
    });

    // RDS Postgres (t3.micro for dev, scale up before launch)
    const dbInstance = new rds.DatabaseInstance(this, 'CoreHealthDb', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16_12,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO,
      ),
      credentials: dbCredentials,
      databaseName: 'corehealth',
      vpc: this.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [dbSG],
      multiAz: false, // TODO before launch: set true + upgrade AWS account from free tier
      allocatedStorage: 20,
      storageEncrypted: true,
      deletionProtection: true,
      backupRetention: cdk.Duration.days(0), // TODO: set days(7) after upgrading AWS account from free tier
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      // Enable pgvector extension via parameter group
      parameterGroup: new rds.ParameterGroup(this, 'DbParamGroup', {
        engine: rds.DatabaseInstanceEngine.postgres({
          version: rds.PostgresEngineVersion.VER_16_12,
        }),
        parameters: {
          'shared_preload_libraries': 'pg_stat_statements',
        },
      }),
    });

    this.dbSecret = dbInstance.secret!;
    this.dbEndpoint = dbInstance.dbInstanceEndpointAddress;

    new cdk.CfnOutput(this, 'DbEndpoint',  { value: this.dbEndpoint });
    new cdk.CfnOutput(this, 'DbSecretArn', { value: this.dbSecret.secretArn });
    new cdk.CfnOutput(this, 'VpcId',       { value: this.vpc.vpcId });
  }
}
