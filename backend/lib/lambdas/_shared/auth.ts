import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { forbidden } from './response';

/**
 * Verify the request is authenticated AND that the caller is the owner of
 * the resource they are accessing ({userId} path param must equal Cognito sub).
 *
 * Returns { userId } on success, or a 403 APIGatewayProxyResult on failure.
 * Pattern: const auth = requireSelf(event); if ('statusCode' in auth) return auth;
 */
export function requireSelf(
  event: APIGatewayProxyEvent,
): { userId: string } | APIGatewayProxyResult {
  const cognitoSub = event.requestContext.authorizer?.claims?.sub;
  if (!cognitoSub) return forbidden();
  const userId = event.pathParameters?.userId;
  if (!userId || cognitoSub !== userId) return forbidden();
  return { userId };
}

/**
 * Verify the request is authenticated (no ownership check).
 * Use for routes that don't include a {userId} path param (e.g. /ai/chat).
 */
export function requireAuth(
  event: APIGatewayProxyEvent,
): { userId: string } | APIGatewayProxyResult {
  const userId = event.requestContext.authorizer?.claims?.sub;
  if (!userId) return forbidden();
  return { userId };
}
