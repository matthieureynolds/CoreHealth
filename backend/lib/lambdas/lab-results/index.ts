import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getDb } from '../_shared/db';
import { ok, err, parseBody } from '../_shared/response';
import { requireAuth } from '../_shared/auth';
import { randomUUID } from 'crypto';

const s3 = new S3Client({});
const sqs = new SQSClient({});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const auth = requireAuth(event);
  if ('statusCode' in auth) return auth;
  const { userId: cognitoSub } = auth;

  const db = await getDb();
  const method = event.httpMethod;
  const { labResultId } = event.pathParameters ?? {};
  const bucket = process.env.DOCUMENTS_BUCKET!;

  if (method === 'GET' && !labResultId) {
    const result = await db.query(
      `SELECT id, file_name, lab_name, report_date, biomarker_count,
              processing_status, error_message, created_at
       FROM lab_results WHERE user_id = $1 ORDER BY report_date DESC`,
      [cognitoSub],
    );
    return ok(result.rows);
  }

  if (method === 'GET' && labResultId) {
    // /lab-results/{id}/download-url — return a 15-min presigned S3 GET URL
    const isDownload = event.path?.endsWith('/download-url');
    const result = await db.query(
      `SELECT lr.*, array_agg(row_to_json(b)) as biomarkers
       FROM lab_results lr
       LEFT JOIN biomarkers b ON b.lab_result_id = lr.id
       WHERE lr.id = $1 AND lr.user_id = $2
       GROUP BY lr.id`,
      [labResultId, cognitoSub],
    );
    if (result.rows.length === 0) return err(404, 'Lab result not found');
    if (isDownload) {
      const { s3_key, file_name } = result.rows[0];
      const downloadUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: bucket,
          Key: s3_key,
          ResponseContentDisposition: `attachment; filename="${file_name}"`,
        }),
        { expiresIn: 900 }, // 15 minutes
      );
      return ok({ downloadUrl, expiresIn: 900 });
    }
    return ok(result.rows[0]);
  }

  if (method === 'POST') {
    const body = parseBody(event.body);
    if (!body) return err(400, 'Invalid request body');
    const { fileName, fileType, labName, reportDate } = body;

    if (!fileName || !fileType) {
      return err(400, 'fileName and fileType are required');
    }
    const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!ALLOWED_TYPES.includes(fileType)) {
      return err(400, `fileType must be one of: ${ALLOWED_TYPES.join(', ')}`);
    }
    if (fileName.length > 255) return err(400, 'fileName too long (max 255)');

    const id = randomUUID();
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const s3Key = `${cognitoSub}/lab-results/${id}/${safeFileName}`;

    // Generate a pre-signed upload URL — the client uploads directly to S3
    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: bucket,
        Key: s3Key,
        ContentType: fileType,
        Metadata: { userId: cognitoSub, labResultId: id },
      }),
      { expiresIn: 300 }, // 5 minutes to complete upload
    );

    // Create the lab result record (processing_status: 'pending' until Textract runs)
    await db.query(
      `INSERT INTO lab_results (id, user_id, s3_key, file_name, lab_name, report_date, processing_status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')`,
      [id, cognitoSub, s3Key, fileName, labName ?? null, reportDate ?? null],
    );

    // Enqueue for async processing (Textract + Comprehend Medical)
    await sqs.send(new SendMessageCommand({
      QueueUrl: process.env.DOCUMENT_QUEUE_URL!,
      MessageBody: JSON.stringify({ labResultId: id, s3Key, userId: cognitoSub }),
    }));

    return ok({ labResultId: id, uploadUrl }, 201);
  }

  if (method === 'DELETE' && labResultId) {
    const result = await db.query(
      `SELECT s3_key FROM lab_results WHERE id = $1 AND user_id = $2`,
      [labResultId, cognitoSub],
    );
    if (result.rows.length === 0) return err(404, 'Lab result not found');

    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: result.rows[0].s3_key }));
    await db.query(`DELETE FROM lab_results WHERE id = $1`, [labResultId]);
    return ok({ deleted: true });
  }

  return err(405, 'Method not allowed');
};
