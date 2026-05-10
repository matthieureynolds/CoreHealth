import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export class CognitoStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.userPool = new cognito.UserPool(this, 'CoreHealthUserPool', {
      userPoolName: 'corehealth-users',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: {
        email: { required: true, mutable: true },
        givenName: { required: false, mutable: true },
        familyName: { required: false, mutable: true },
      },
      customAttributes: {
        preferredName: new cognito.StringAttribute({ mutable: true }),
        username: new cognito.StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      mfa: cognito.Mfa.OPTIONAL,
      mfaSecondFactor: { sms: false, otp: true },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      email: cognito.UserPoolEmail.withCognito(),
      removalPolicy: cdk.RemovalPolicy.RETAIN, // never accidentally delete user accounts
    });

    // Apple + Google Sign-In — added in Phase 5 once Apple Developer + Google Cloud
    // credentials are available. Uncomment and redeploy at that point.
    // new cognito.UserPoolIdentityProviderApple(this, 'AppleProvider', { ... });
    // new cognito.UserPoolIdentityProviderGoogle(this, 'GoogleProvider', { ... });

    this.userPoolClient = new cognito.UserPoolClient(this, 'CoreHealthMobileClient', {
      userPool: this.userPool,
      userPoolClientName: 'corehealth-mobile',
      authFlows: {
        userSrp: true,       // secure password auth (SRP)
        userPassword: false, // never allow plain password flow
      },
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: ['corehealth://callback'],
        logoutUrls: ['corehealth://logout'],
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
        // Add APPLE + GOOGLE here once IdPs are configured
      ],
      generateSecret: false,
      accessTokenValidity: cdk.Duration.hours(1),
      idTokenValidity: cdk.Duration.hours(1),
      refreshTokenValidity: cdk.Duration.days(30),
    });

    new cognito.UserPoolDomain(this, 'CoreHealthDomain', {
      userPool: this.userPool,
      cognitoDomain: { domainPrefix: 'corehealth-auth' },
    });

    // Outputs — needed for frontend config
    new cdk.CfnOutput(this, 'UserPoolId', { value: this.userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: this.userPoolClient.userPoolClientId });
    new cdk.CfnOutput(this, 'CognitoDomain', {
      value: `corehealth-auth.auth.eu-north-1.amazoncognito.com`,
    });
  }
}
