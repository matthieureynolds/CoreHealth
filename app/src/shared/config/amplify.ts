import { Amplify } from "aws-amplify";

// ─── Fill these in after running: cdk deploy CoreHealth-Cognito ───────────────
// Values come from CloudFormation outputs in the AWS console (or cdk deploy output)
export const COGNITO_USER_POOL_ID = "eu-north-1_45xMaZW1F";
export const COGNITO_USER_POOL_CLIENT_ID = "1vrpcmjojglpteecnhhj8kin9p";
export const COGNITO_DOMAIN =
  "corehealth-auth.auth.eu-north-1.amazoncognito.com";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: COGNITO_USER_POOL_ID,
      userPoolClientId: COGNITO_USER_POOL_CLIENT_ID,
      loginWith: {
        email: true,
        oauth: {
          domain: COGNITO_DOMAIN,
          scopes: ["email", "openid", "profile"],
          redirectSignIn: ["corehealth://callback"],
          redirectSignOut: ["corehealth://logout"],
          responseType: "code",
        },
      },
    },
  },
});
