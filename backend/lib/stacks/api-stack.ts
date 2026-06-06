import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';

import { Construct } from 'constructs';
import * as path from 'path';

interface ApiStackProps extends cdk.StackProps {
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
  dbSecret: secretsmanager.ISecret;
  dbEndpoint: string;
  vpc: ec2.Vpc;
  lambdaSecurityGroup: ec2.SecurityGroup;
  documentsBucket: s3.Bucket;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const { userPool, dbSecret, dbEndpoint, vpc, lambdaSecurityGroup, documentsBucket } = props;

    // VPC config — all Lambdas go in private subnet to reach RDS
    const vpcConfig = {
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [lambdaSecurityGroup],
    };

    // ─── Secrets Manager: API keys ─────────────────────────────────────────────
    const openaiSecret = new secretsmanager.Secret(this, 'OpenAISecret', {
      secretName: 'corehealth/openai/api-key',
      description: 'OpenAI API key for Toto AI agent',
    });

    const googleVisionSecret = new secretsmanager.Secret(this, 'GoogleVisionSecret', {
      secretName: 'corehealth/google/vision-api-key',
      description: 'Google Cloud Vision API key for lab result OCR',
    });

    const whoopSecret = new secretsmanager.Secret(this, 'WhoopSecret', {
      secretName: 'corehealth/whoop/oauth',
      description: 'Whoop OAuth client credentials',
    });

    const ouraSecret = new secretsmanager.Secret(this, 'OuraSecret', {
      secretName: 'corehealth/oura/oauth',
      description: 'Oura OAuth client credentials',
    });

    // AES-256-GCM key for encrypting sensitive fields (hereditary signals).
    // After deploy: set the secret value to a 64-char hex string (32 random bytes).
    // Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    const encryptionKeySecret = new secretsmanager.Secret(this, 'EncryptionKeySecret', {
      secretName: 'corehealth/encryption/key',
      description: 'AES-256-GCM key (64-char hex) for encrypting sensitive health fields',
    });

    // ─── SQS queue for async document processing ────────────────────────────────
    const documentProcessingQueue = new sqs.Queue(this, 'DocumentProcessingQueue', {
      queueName: 'corehealth-document-processing',
      visibilityTimeout: cdk.Duration.seconds(300), // 5 min — must exceed Lambda timeout
      retentionPeriod: cdk.Duration.days(4),
      deadLetterQueue: {
        queue: new sqs.Queue(this, 'DocumentProcessingDLQ', {
          queueName: 'corehealth-document-processing-dlq',
          retentionPeriod: cdk.Duration.days(14),
        }),
        maxReceiveCount: 3,
      },
    });

    // ─── Shared Lambda environment vars ────────────────────────────────────────
    const sharedEnv = {
      DB_ENDPOINT: dbEndpoint,
      DB_SECRET_ARN: dbSecret.secretArn,
      NODE_ENV: 'production',
    };

    // Use local esbuild bundling (no Docker required).
    // Copy the RDS CA cert into every Lambda bundle so db.ts can verify TLS.
    const bundling = {
      forceDockerBundling: false,
      commandHooks: {
        beforeBundling: () => [],
        beforeInstall: () => [],
        afterBundling: (inputDir: string, outputDir: string) => [
          `cp -r "${inputDir}/certs" "${outputDir}/certs"`,
        ],
      },
    };

    // ─── Lambda: Allergies ─────────────────────────────────────────────────────
    const allergiesLambda = new nodejs.NodejsFunction(this, 'AllergiesLambda', {
      entry: path.join(__dirname, '../lambdas/allergies/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(25),
      memorySize: 256,
      environment: sharedEnv,
      bundling,
      ...vpcConfig,
    });

    // ─── Lambda: Users (profile CRUD) ──────────────────────────────────────────
    const usersLambda = new nodejs.NodejsFunction(this, 'UsersLambda', {
      entry: path.join(__dirname, '../lambdas/users/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(25),
      memorySize: 1024,
      environment: {
        ...sharedEnv,
        DOCUMENTS_BUCKET: documentsBucket.bucketName,
        USER_POOL_ID: userPool.userPoolId,
      },
      bundling,
      ...vpcConfig,
    });

    // ─── Lambda: Biomarkers ─────────────────────────────────────────────────────
    const biomarkersLambda = new nodejs.NodejsFunction(this, 'BiomarkersLambda', {
      entry: path.join(__dirname, '../lambdas/biomarkers/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: sharedEnv,
      bundling,
      ...vpcConfig,
    });

    // ─── Lambda: Lab results ────────────────────────────────────────────────────
    const labResultsLambda = new nodejs.NodejsFunction(this, 'LabResultsLambda', {
      entry: path.join(__dirname, '../lambdas/lab-results/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        ...sharedEnv,
        DOCUMENTS_BUCKET: documentsBucket.bucketName,
        DOCUMENT_QUEUE_URL: documentProcessingQueue.queueUrl,
        GOOGLE_VISION_SECRET_ARN: googleVisionSecret.secretArn,
      },
      bundling,
      ...vpcConfig,
    });

    // ─── Lambda: Medications ───────────────────────────────────────────────────
    const medicationsLambda = new nodejs.NodejsFunction(this, 'MedicationsLambda', {
      entry: path.join(__dirname, '../lambdas/medications/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(25),
      memorySize: 256,
      environment: sharedEnv,
      bundling,
      ...vpcConfig,
    });

    // ─── Lambda: Conditions ────────────────────────────────────────────────────
    const conditionsLambda = new nodejs.NodejsFunction(this, 'ConditionsLambda', {
      entry: path.join(__dirname, '../lambdas/conditions/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(25),
      memorySize: 256,
      environment: sharedEnv,
      bundling,
      ...vpcConfig,
    });

    // ─── Lambda: Vaccinations ──────────────────────────────────────────────────
    const vaccinationsLambda = new nodejs.NodejsFunction(this, 'VaccinationsLambda', {
      entry: path.join(__dirname, '../lambdas/vaccinations/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(25),
      memorySize: 256,
      environment: sharedEnv,
      bundling,
      ...vpcConfig,
    });

    // ─── Lambda: Family (relationship links + hereditary signals) ─────────────
    const familyLambda = new nodejs.NodejsFunction(this, 'FamilyLambda', {
      entry: path.join(__dirname, '../lambdas/family/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(25),
      memorySize: 256,
      environment: {
        ...sharedEnv,
        ENCRYPTION_KEY_ARN: encryptionKeySecret.secretArn,
      },
      bundling,
      ...vpcConfig,
    });

    // ─── Lambda: Device OAuth (Whoop / Oura token exchange) ───────────────────
    const deviceOAuthLambda = new nodejs.NodejsFunction(this, 'DeviceOAuthLambda', {
      entry: path.join(__dirname, '../lambdas/device-oauth/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        ...sharedEnv,
        WHOOP_SECRET_ARN: whoopSecret.secretArn,
        OURA_SECRET_ARN: ouraSecret.secretArn,
        OAUTH_REDIRECT_URI: 'corehealth://oauth',
        ENCRYPTION_KEY_ARN: encryptionKeySecret.secretArn,
      },
      bundling,
      ...vpcConfig,
    });

    // ─── Lambda: Appointments ─────────────────────────────────────────────────
    const appointmentsLambda = new nodejs.NodejsFunction(this, 'AppointmentsLambda', {
      entry: path.join(__dirname, '../lambdas/appointments/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(25),
      memorySize: 256,
      environment: sharedEnv,
      bundling,
      ...vpcConfig,
    });

    // ─── Lambda: Device data ──────────────────────────────────────────────────
    const deviceDataLambda = new nodejs.NodejsFunction(this, 'DeviceDataLambda', {
      entry: path.join(__dirname, '../lambdas/device-data/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(25),
      memorySize: 256,
      environment: sharedEnv,
      bundling,
      ...vpcConfig,
    });

    // ─── Lambda: Symptoms ─────────────────────────────────────────────────────
    const symptomsLambda = new nodejs.NodejsFunction(this, 'SymptomsLambda', {
      entry: path.join(__dirname, '../lambdas/symptoms/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(25),
      memorySize: 256,
      environment: sharedEnv,
      bundling,
      ...vpcConfig,
    });

    // ─── Lambda: Trips ────────────────────────────────────────────────────────
    const tripsLambda = new nodejs.NodejsFunction(this, 'TripsLambda', {
      entry: path.join(__dirname, '../lambdas/trips/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(25),
      memorySize: 256,
      environment: sharedEnv,
      bundling,
      ...vpcConfig,
    });

    // ─── Lambda: Alerts ────────────────────────────────────────────────────────
    const alertsLambda = new nodejs.NodejsFunction(this, 'AlertsLambda', {
      entry: path.join(__dirname, '../lambdas/alerts/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(25),
      memorySize: 256,
      environment: sharedEnv,
      bundling,
      ...vpcConfig,
    });

    // ─── Lambda: Trend analyzer (nightly EventBridge) ──────────────────────────
    const trendAnalyzerLambda = new nodejs.NodejsFunction(this, 'TrendAnalyzerLambda', {
      entry: path.join(__dirname, '../lambdas/trend-analyzer/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.minutes(10),
      memorySize: 512,
      environment: {
        ...sharedEnv,
        OPENAI_SECRET_ARN: openaiSecret.secretArn,
      },
      bundling,
      ...vpcConfig,
    });

    // EventBridge rule — runs nightly at 02:00 UTC
    new events.Rule(this, 'TrendAnalyzerSchedule', {
      schedule: events.Schedule.cron({ minute: '0', hour: '2' }),
      targets: [new targets.LambdaFunction(trendAnalyzerLambda)],
    });

    // ─── Lambda: Device sync (nightly token refresh + data pull) ───────────────
    const deviceSyncLambda = new nodejs.NodejsFunction(this, 'DeviceSyncLambda', {
      entry: path.join(__dirname, '../lambdas/device-sync/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.minutes(5),
      memorySize: 256,
      environment: {
        ...sharedEnv,
        WHOOP_SECRET_ARN: whoopSecret.secretArn,
        OURA_SECRET_ARN: ouraSecret.secretArn,
        ENCRYPTION_KEY_ARN: encryptionKeySecret.secretArn,
      },
      bundling,
      ...vpcConfig,
    });

    // EventBridge rule — runs nightly at 03:00 UTC (after trend analyzer)
    new events.Rule(this, 'DeviceSyncSchedule', {
      schedule: events.Schedule.cron({ minute: '0', hour: '3' }),
      targets: [new targets.LambdaFunction(deviceSyncLambda)],
    });

    // ─── Lambda: Retention cleanup (GDPR Article 5(1)(e) storage limitation) ────
    const retentionCleanupLambda = new nodejs.NodejsFunction(this, 'RetentionCleanupLambda', {
      entry: path.join(__dirname, '../lambdas/retention-cleanup/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.minutes(5),
      memorySize: 256,
      environment: sharedEnv,
      bundling,
      ...vpcConfig,
    });

    // EventBridge rule — runs nightly at 04:00 UTC (after device sync)
    new events.Rule(this, 'RetentionCleanupSchedule', {
      schedule: events.Schedule.cron({ minute: '0', hour: '4' }),
      targets: [new targets.LambdaFunction(retentionCleanupLambda)],
    });

    // ─── Lambda: AI agent (Toto) ────────────────────────────────────────────────
    const aiAgentLambda = new nodejs.NodejsFunction(this, 'AiAgentLambda', {
      entry: path.join(__dirname, '../lambdas/ai-agent/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(28), // API Gateway hard limit is 29s
      memorySize: 2048,
      environment: {
        ...sharedEnv,
        OPENAI_SECRET_ARN: openaiSecret.secretArn,
        ENCRYPTION_KEY_ARN: encryptionKeySecret.secretArn,
      },
      bundling,
      ...vpcConfig,
    });

    // ─── Lambda: Document processor (SQS-triggered) ────────────────────────────
    const documentProcessorLambda = new nodejs.NodejsFunction(this, 'DocumentProcessorLambda', {
      entry: path.join(__dirname, '../lambdas/lab-results/processor.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(300),
      memorySize: 512,
      environment: {
        ...sharedEnv,
        DOCUMENTS_BUCKET: documentsBucket.bucketName,
        GOOGLE_VISION_SECRET_ARN: googleVisionSecret.secretArn,
      },
      bundling,
      ...vpcConfig,
    });

    // SQS triggers document processor
    documentProcessorLambda.addEventSource(
      new lambdaEventSources.SqsEventSource(documentProcessingQueue, { batchSize: 1 }),
    );

    // ─── IAM permissions ────────────────────────────────────────────────────────
    const allLambdas = [
      usersLambda, allergiesLambda, biomarkersLambda, labResultsLambda, aiAgentLambda,
      documentProcessorLambda, medicationsLambda, conditionsLambda, vaccinationsLambda,
      alertsLambda, trendAnalyzerLambda, appointmentsLambda, deviceDataLambda,
      familyLambda, deviceOAuthLambda, deviceSyncLambda, symptomsLambda, tripsLambda,
    ];

    allLambdas.forEach(fn => {
      dbSecret.grantRead(fn);
    });

    documentsBucket.grantReadWrite(labResultsLambda);
    documentsBucket.grantRead(documentProcessorLambda);
    documentsBucket.grantReadWrite(usersLambda); // needed for S3 file deletion on account delete
    usersLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['cognito-idp:AdminDeleteUser'],
      resources: [userPool.userPoolArn],
    }));
    documentProcessingQueue.grantSendMessages(labResultsLambda);
    openaiSecret.grantRead(aiAgentLambda);
    openaiSecret.grantRead(trendAnalyzerLambda);
    whoopSecret.grantRead(deviceOAuthLambda);
    ouraSecret.grantRead(deviceOAuthLambda);
    whoopSecret.grantRead(deviceSyncLambda);
    ouraSecret.grantRead(deviceSyncLambda);
    googleVisionSecret.grantRead(labResultsLambda);
    googleVisionSecret.grantRead(documentProcessorLambda);
    encryptionKeySecret.grantRead(familyLambda);
    encryptionKeySecret.grantRead(aiAgentLambda);
    encryptionKeySecret.grantRead(deviceOAuthLambda);
    encryptionKeySecret.grantRead(deviceSyncLambda);

    // Textract + Comprehend Medical for document processor
    documentProcessorLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['textract:AnalyzeDocument', 'textract:DetectDocumentText'],
      resources: ['*'],
    }));
    documentProcessorLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['comprehendmedical:DetectEntitiesV2', 'comprehendmedical:DetectPHI'],
      resources: ['*'],
    }));

    // ─── API Gateway access log — structured GDPR/HIPAA audit trail ──────────────
    // Logs: userId (from Cognito), method, path, status, latency, requestId.
    // No request/response bodies — health data never touches CloudWatch logs.
    const accessLogGroup = new logs.LogGroup(this, 'ApiAccessLogs', {
      logGroupName: '/aws/apigateway/corehealth-access',
      retention: logs.RetentionDays.THREE_MONTHS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // ─── API Gateway ────────────────────────────────────────────────────────────
    const api = new apigateway.RestApi(this, 'CoreHealthApi', {
      restApiName: 'corehealth-api',
      description: 'CoreHealth backend API',
      cloudWatchRole: true, // CDK creates + sets the account-level CW Logs role automatically
      defaultCorsPreflightOptions: {
        allowOrigins: ['null'], // blocks all browser cross-origin preflight
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Authorization', 'Content-Type'],
      },
      deployOptions: {
        stageName: 'v1',
        throttlingRateLimit: 100,
        throttlingBurstLimit: 200,
        accessLogDestination: new apigateway.LogGroupLogDestination(accessLogGroup),
        accessLogFormat: apigateway.AccessLogFormat.custom(JSON.stringify({
          level: 'AUDIT',
          ts: '$context.requestTime',
          requestId: '$context.requestId',
          userId: '$context.authorizer.claims.sub',
          method: '$context.httpMethod',
          path: '$context.resourcePath',
          status: '$context.status',
          responseMs: '$context.responseLatency',
          integrationMs: '$context.integrationLatency',
          ip: '$context.identity.sourceIp',
        })),
        methodOptions: {
          // AI chat: 2 req/s sustained, burst of 5 — per-user daily cap enforced in Lambda
          '/ai/chat/POST': {
            throttlingRateLimit: 2,
            throttlingBurstLimit: 5,
          },
        },
      },
    });

    // Cognito authorizer — every route requires a valid JWT
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      cognitoUserPools: [userPool],
      authorizerName: 'CoreHealthCognitoAuthorizer',
      identitySource: 'method.request.header.Authorization',
    });

    const authOptions: apigateway.MethodOptions = {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    };

    // ─── Routes ─────────────────────────────────────────────────────────────────

    // /users
    const users = api.root.addResource('users');
    const user = users.addResource('{userId}');
    user.addMethod('GET', new apigateway.LambdaIntegration(usersLambda), authOptions);
    user.addMethod('POST', new apigateway.LambdaIntegration(usersLambda), authOptions);
    user.addMethod('PUT', new apigateway.LambdaIntegration(usersLambda), authOptions);
    user.addMethod('DELETE', new apigateway.LambdaIntegration(usersLambda), authOptions);

    // /users/{userId}/allergies[/{allergyId}]
    const allergies = user.addResource('allergies');
    allergies.addMethod('GET', new apigateway.LambdaIntegration(allergiesLambda), authOptions);
    allergies.addMethod('POST', new apigateway.LambdaIntegration(allergiesLambda), authOptions);
    const allergyItem = allergies.addResource('{allergyId}');
    allergyItem.addMethod('PUT', new apigateway.LambdaIntegration(allergiesLambda), authOptions);
    allergyItem.addMethod('DELETE', new apigateway.LambdaIntegration(allergiesLambda), authOptions);

    // /users/{userId}/medications[/{medicationId}]
    const medications = user.addResource('medications');
    medications.addMethod('GET', new apigateway.LambdaIntegration(medicationsLambda), authOptions);
    medications.addMethod('POST', new apigateway.LambdaIntegration(medicationsLambda), authOptions);
    const medicationItem = medications.addResource('{medicationId}');
    medicationItem.addMethod('PUT', new apigateway.LambdaIntegration(medicationsLambda), authOptions);
    medicationItem.addMethod('DELETE', new apigateway.LambdaIntegration(medicationsLambda), authOptions);

    // /users/{userId}/conditions[/{conditionId}]
    const conditions = user.addResource('conditions');
    conditions.addMethod('GET', new apigateway.LambdaIntegration(conditionsLambda), authOptions);
    conditions.addMethod('POST', new apigateway.LambdaIntegration(conditionsLambda), authOptions);
    const conditionItem = conditions.addResource('{conditionId}');
    conditionItem.addMethod('PUT', new apigateway.LambdaIntegration(conditionsLambda), authOptions);
    conditionItem.addMethod('DELETE', new apigateway.LambdaIntegration(conditionsLambda), authOptions);

    // /users/{userId}/vaccinations[/{vaccinationId}]
    const vaccinations = user.addResource('vaccinations');
    vaccinations.addMethod('GET', new apigateway.LambdaIntegration(vaccinationsLambda), authOptions);
    vaccinations.addMethod('POST', new apigateway.LambdaIntegration(vaccinationsLambda), authOptions);
    const vaccinationItem = vaccinations.addResource('{vaccinationId}');
    vaccinationItem.addMethod('PUT', new apigateway.LambdaIntegration(vaccinationsLambda), authOptions);
    vaccinationItem.addMethod('DELETE', new apigateway.LambdaIntegration(vaccinationsLambda), authOptions);

    // /users/{userId}/family/links + signals
    const family = user.addResource('family');
    const familyLinks = family.addResource('links');
    familyLinks.addMethod('GET', new apigateway.LambdaIntegration(familyLambda), authOptions);
    familyLinks.addMethod('POST', new apigateway.LambdaIntegration(familyLambda), authOptions);
    familyLinks.addResource('{linkId}').addMethod('DELETE', new apigateway.LambdaIntegration(familyLambda), authOptions);
    const familySignals = family.addResource('signals');
    familySignals.addMethod('GET', new apigateway.LambdaIntegration(familyLambda), authOptions);
    familySignals.addMethod('POST', new apigateway.LambdaIntegration(familyLambda), authOptions);
    familySignals.addResource('{signalId}').addMethod('DELETE', new apigateway.LambdaIntegration(familyLambda), authOptions);

    // /users/{userId}/device-oauth/whoop|oura|status|auth-url/{device}
    const deviceOAuth = user.addResource('device-oauth');
    deviceOAuth.addResource('status').addMethod('GET', new apigateway.LambdaIntegration(deviceOAuthLambda), authOptions);
    const deviceOAuthWhoop = deviceOAuth.addResource('whoop');
    deviceOAuthWhoop.addMethod('POST', new apigateway.LambdaIntegration(deviceOAuthLambda), authOptions);
    const deviceOAuthOura = deviceOAuth.addResource('oura');
    deviceOAuthOura.addMethod('POST', new apigateway.LambdaIntegration(deviceOAuthLambda), authOptions);
    const authUrlResource = deviceOAuth.addResource('auth-url');
    authUrlResource.addResource('whoop').addMethod('GET', new apigateway.LambdaIntegration(deviceOAuthLambda), authOptions);
    authUrlResource.addResource('oura').addMethod('GET', new apigateway.LambdaIntegration(deviceOAuthLambda), authOptions);

    // /users/{userId}/appointments[/{appointmentId}]
    const appointments = user.addResource('appointments');
    appointments.addMethod('GET', new apigateway.LambdaIntegration(appointmentsLambda), authOptions);
    appointments.addMethod('POST', new apigateway.LambdaIntegration(appointmentsLambda), authOptions);
    const appointmentItem = appointments.addResource('{appointmentId}');
    appointmentItem.addMethod('PUT', new apigateway.LambdaIntegration(appointmentsLambda), authOptions);
    appointmentItem.addMethod('DELETE', new apigateway.LambdaIntegration(appointmentsLambda), authOptions);

    // /users/{userId}/device-data
    const deviceDataResource = user.addResource('device-data');
    deviceDataResource.addMethod('GET', new apigateway.LambdaIntegration(deviceDataLambda), authOptions);
    deviceDataResource.addMethod('POST', new apigateway.LambdaIntegration(deviceDataLambda), authOptions);

    // /users/{userId}/alerts[/{alertId}/dismiss]
    const alerts = user.addResource('alerts');
    alerts.addMethod('GET', new apigateway.LambdaIntegration(alertsLambda), authOptions);
    const alertItem = alerts.addResource('{alertId}');
    const alertDismiss = alertItem.addResource('dismiss');
    alertDismiss.addMethod('PUT', new apigateway.LambdaIntegration(alertsLambda), authOptions);

    // /biomarkers
    const biomarkers = api.root.addResource('biomarkers');
    biomarkers.addMethod('GET', new apigateway.LambdaIntegration(biomarkersLambda), authOptions);
    biomarkers.addMethod('POST', new apigateway.LambdaIntegration(biomarkersLambda), authOptions);
    const biomarker = biomarkers.addResource('{biomarkerId}');
    biomarker.addMethod('GET', new apigateway.LambdaIntegration(biomarkersLambda), authOptions);
    biomarker.addMethod('DELETE', new apigateway.LambdaIntegration(biomarkersLambda), authOptions);

    // /lab-results
    const labResults = api.root.addResource('lab-results');
    labResults.addMethod('GET', new apigateway.LambdaIntegration(labResultsLambda), authOptions);
    labResults.addMethod('POST', new apigateway.LambdaIntegration(labResultsLambda), authOptions);
    const labResult = labResults.addResource('{labResultId}');
    labResult.addMethod('GET', new apigateway.LambdaIntegration(labResultsLambda), authOptions);
    labResult.addMethod('DELETE', new apigateway.LambdaIntegration(labResultsLambda), authOptions);

    // /users/{userId}/preferences — notification preferences
    const preferences = user.addResource('preferences');
    preferences.addMethod('GET', new apigateway.LambdaIntegration(usersLambda), authOptions);
    preferences.addMethod('PUT', new apigateway.LambdaIntegration(usersLambda), authOptions);

    // /users/{userId}/settings — full app settings blob
    const userSettings = user.addResource('settings');
    userSettings.addMethod('GET', new apigateway.LambdaIntegration(usersLambda), authOptions);
    userSettings.addMethod('PUT', new apigateway.LambdaIntegration(usersLambda), authOptions);

    // /users/{userId}/profile-data — rich profile blob
    const profileData = user.addResource('profile-data');
    profileData.addMethod('GET', new apigateway.LambdaIntegration(usersLambda), authOptions);
    profileData.addMethod('PUT', new apigateway.LambdaIntegration(usersLambda), authOptions);

    // /users/{userId}/consent — GDPR Article 9(2)(a) explicit consent + Art. 7(3) withdrawal
    const consent = user.addResource('consent');
    consent.addMethod('POST', new apigateway.LambdaIntegration(usersLambda), authOptions);
    consent.addMethod('DELETE', new apigateway.LambdaIntegration(usersLambda), authOptions);

    // /users/{userId}/symptoms — symptom log (dedicated Lambda)
    const symptomsResource = user.addResource('symptoms');
    symptomsResource.addMethod('GET', new apigateway.LambdaIntegration(symptomsLambda), authOptions);
    symptomsResource.addMethod('POST', new apigateway.LambdaIntegration(symptomsLambda), authOptions);

    // /users/{userId}/trips[/{tripId}] — planned travel (dedicated Lambda)
    const tripsResource = user.addResource('trips');
    tripsResource.addMethod('GET', new apigateway.LambdaIntegration(tripsLambda), authOptions);
    tripsResource.addMethod('POST', new apigateway.LambdaIntegration(tripsLambda), authOptions);
    const tripItem = tripsResource.addResource('{tripId}');
    tripItem.addMethod('PUT', new apigateway.LambdaIntegration(tripsLambda), authOptions);
    tripItem.addMethod('DELETE', new apigateway.LambdaIntegration(tripsLambda), authOptions);

    // /users/{userId}/location-health — live location biomarkers
    user.addResource('location-health').addMethod('PUT', new apigateway.LambdaIntegration(usersLambda), authOptions);

    // /users/{userId}/joined-leagues — community league membership
    user.addResource('joined-leagues').addMethod('PUT', new apigateway.LambdaIntegration(usersLambda), authOptions);

    // /users/{userId}/health-memory — GDPR Art. 22 right to inspect + erase AI memory
    const healthMemory = user.addResource('health-memory');
    healthMemory.addMethod('GET', new apigateway.LambdaIntegration(usersLambda), authOptions);
    healthMemory.addMethod('DELETE', new apigateway.LambdaIntegration(usersLambda), authOptions);

    // /users/{userId}/data-export — GDPR Art. 20 data portability
    user.addResource('data-export').addMethod('GET', new apigateway.LambdaIntegration(usersLambda), authOptions);

    // /ai — Toto chat + media proxies
    const ai = api.root.addResource('ai');
    const chat = ai.addResource('chat');
    chat.addMethod('POST', new apigateway.LambdaIntegration(aiAgentLambda), authOptions);
    const history = ai.addResource('history');
    history.addMethod('GET', new apigateway.LambdaIntegration(aiAgentLambda), authOptions);
    const transcribe = ai.addResource('transcribe');
    transcribe.addMethod('POST', new apigateway.LambdaIntegration(aiAgentLambda), authOptions);
    const analyzeImage = ai.addResource('analyze-image');
    analyzeImage.addMethod('POST', new apigateway.LambdaIntegration(aiAgentLambda), authOptions);
    const imagingResults = ai.addResource('imaging-results');
    imagingResults.addMethod('GET', new apigateway.LambdaIntegration(aiAgentLambda), authOptions);
    const insightsResource = ai.addResource('insights');
    insightsResource.addMethod('POST', new apigateway.LambdaIntegration(aiAgentLambda), authOptions);

    // ─── Migration Lambda (run-once on deploy) ──────────────────────────────────
    const migrationLambda = new nodejs.NodejsFunction(this, 'MigrationLambda', {
      entry: path.join(__dirname, '../lambdas/migrate/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.minutes(5),
      memorySize: 256,
      // MigrationLambda connects directly to RDS — RDS Proxy pins connections to a single
      // endpoint which can cause issues with DDL statements during schema migrations.
      environment: { ...sharedEnv, DB_ENDPOINT: dbEndpoint },
      bundling: {
        forceDockerBundling: false,
        // Copy migrations/ folder into the Lambda bundle so the runner can read SQL files at runtime
        commandHooks: {
          beforeBundling: () => [],
          beforeInstall: () => [],
          afterBundling: (inputDir: string, outputDir: string) => [
            `cp -r "${inputDir}/migrations" "${outputDir}/migrations"`,
            `cp -r "${inputDir}/certs" "${outputDir}/certs"`,
          ],
        },
      },
      ...vpcConfig,
    });
    dbSecret.grantRead(migrationLambda);
    new cdk.CfnOutput(this, 'MigrationLambdaName', { value: migrationLambda.functionName });

    // ─── WAF — protect API Gateway with AWS managed rule groups (H13) ──────────
    const webAcl = new wafv2.CfnWebACL(this, 'ApiWaf', {
      name: 'corehealth-api-waf',
      scope: 'REGIONAL',
      defaultAction: { allow: {} },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: 'CoreHealthWAF',
        sampledRequestsEnabled: true,
      },
      rules: [
        {
          name: 'AWSManagedRulesCommonRuleSet',
          priority: 1,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesCommonRuleSet',
              excludedRules: [
                // Large base64 payloads for /ai/transcribe and /ai/analyze-image
                { name: 'SizeRestrictions_BODY' },
              ],
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'CommonRuleSet',
            sampledRequestsEnabled: true,
          },
        },
        {
          name: 'AWSManagedRulesKnownBadInputsRuleSet',
          priority: 2,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesKnownBadInputsRuleSet',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'KnownBadInputs',
            sampledRequestsEnabled: true,
          },
        },
        {
          name: 'AWSManagedRulesSQLiRuleSet',
          priority: 3,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesSQLiRuleSet',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'SQLiRuleSet',
            sampledRequestsEnabled: true,
          },
        },
        {
          // IP-based rate limit: 500 req per 5 minutes per IP
          name: 'IpRateLimit',
          priority: 4,
          action: { block: {} },
          statement: {
            rateBasedStatement: {
              limit: 500,
              aggregateKeyType: 'IP',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'IpRateLimit',
            sampledRequestsEnabled: true,
          },
        },
      ],
    });

    // Associate WAF with the API Gateway stage
    new wafv2.CfnWebACLAssociation(this, 'ApiWafAssociation', {
      resourceArn: `arn:aws:apigateway:${this.region}::/restapis/${api.restApiId}/stages/${api.deploymentStage.stageName}`,
      webAclArn: webAcl.attrArn,
    });

    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
    new cdk.CfnOutput(this, 'OpenAISecretArn', { value: openaiSecret.secretArn });
  }
}
