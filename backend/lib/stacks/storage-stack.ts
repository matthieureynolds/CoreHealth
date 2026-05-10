import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';

export class StorageStack extends cdk.Stack {
  public readonly documentsBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Private bucket — no public access, all served via CloudFront with signed URLs
    this.documentsBucket = new s3.Bucket(this, 'CoreHealthDocuments', {
      bucketName: `corehealth-documents-${this.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
      lifecycleRules: [
        {
          // Move old versions to cheaper storage after 30 days
          noncurrentVersionTransitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(30),
            },
          ],
          // Delete non-current versions after 90 days
          noncurrentVersionExpiration: cdk.Duration.days(90),
        },
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Origin Access Control — CloudFront can read from the private bucket
    const oac = new cloudfront.S3OriginAccessControl(this, 'DocumentsOAC', {
      signing: cloudfront.Signing.SIGV4_NO_OVERRIDE,
    });

    const distribution = new cloudfront.Distribution(this, 'DocumentsCdn', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(
          this.documentsBucket,
          { originAccessControl: oac },
        ),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED, // health docs should never be cached
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // US + Europe only (GDPR-friendly)
    });

    new cdk.CfnOutput(this, 'DocumentsBucketName', { value: this.documentsBucket.bucketName });
    new cdk.CfnOutput(this, 'CloudFrontDomain', { value: distribution.distributionDomainName });
  }
}
