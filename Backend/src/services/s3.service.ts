import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private s3: AWS.S3;
  private bucketName: string;
  private region: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('S3_BUCKET_NAME');
    this.region = this.configService.get<string>('S3_REGION') || 'us-east-1';

    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY');
    const secretAccessKey = this.configService.get<string>('S3_SECRET_KEY');
    const configuredEndpoint = this.configService.get<string>('S3_ENDPOINT');
    const endpoint = configuredEndpoint?.startsWith('arn:aws:s3')
      ? undefined
      : (configuredEndpoint || `https://s3.${this.region}.amazonaws.com`);

    if (!accessKeyId || !secretAccessKey || !this.bucketName) {
      console.warn('⚠️ S3 credentials are incomplete');
    }

    // Standard S3 configuration for a normal bucket, not an access point ARN
    this.s3 = new AWS.S3({
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      region: this.region,
      endpoint,
      s3ForcePathStyle: false,
      signatureVersion: 'v4',
    });

    console.log('🔌 S3 Service initialized:', {
      bucket: this.bucketName,
      region: this.region,
      endpoint: endpoint || `https://s3.${this.region}.amazonaws.com`,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const key = `objects/${fileName}`;

    console.log('📤 Uploading to S3:', {
      bucket: this.bucketName,
      key: key,
      size: file.size,
      mimetype: file.mimetype,
    });

    try {
      // First check if bucket exists and is accessible
      try {
        await this.s3.headBucket({
          Bucket: this.bucketName,
        }).promise();
        console.log('✅ Bucket access confirmed');
      } catch (headError) {
        console.error('❌ Bucket access error:', headError.message);
        if (headError.code === 'NotFound' || headError.code === 'NoSuchBucket') {
          throw new Error(`Bucket "${this.bucketName}" does not exist. Please create it first.`);
        }
        if (headError.code === 'Forbidden' || headError.code === 'AccessDenied') {
          throw new Error(`Access denied to bucket "${this.bucketName}". Check permissions.`);
        }
        throw headError;
      }

      // Upload the file
      const result = await this.s3.upload({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      }).promise();

      console.log('✅ File uploaded successfully:', result.Location);
      return result.Location;
    } catch (error) {
      console.error('❌ S3 Upload Error:', {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      });

      if (error.code === 'NoSuchBucket' || error.message.includes('does not exist')) {
        throw new BadRequestException(
          `Bucket "${this.bucketName}" does not exist. Please create it first.`
        );
      } else if (error.code === 'InvalidAccessKeyId') {
        throw new BadRequestException('Invalid AWS Access Key ID. Check credentials.');
      } else if (error.code === 'SignatureDoesNotMatch') {
        throw new BadRequestException('Invalid AWS Secret Access Key. Check credentials.');
      } else if (error.code === 'AccessDenied' || error.code === 'Forbidden') {
        throw new BadRequestException(`Access denied to S3 bucket "${this.bucketName}". Check IAM permissions.`);
      } else {
        throw new InternalServerErrorException(`Failed to upload image to S3: ${error.message}`);
      }
    }
  }

  async deleteFile(imageUrl: string): Promise<void> {
    if (!imageUrl) {
      console.warn('⚠️ No image URL provided for deletion');
      return;
    }

    try {
      // Extract key from URL
      const urlParts = imageUrl.split('/');
      const keyIndex = urlParts.indexOf('objects');
      if (keyIndex === -1) {
        console.warn('⚠️ Could not extract key from URL:', imageUrl);
        return;
      }
      const key = urlParts.slice(keyIndex).join('/');

      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: key,
      }).promise();

      console.log('✅ File deleted successfully:', key);
    } catch (error) {
      console.error('❌ S3 Delete Error:', error.message);
    }
  }

  // Test method to verify connection
  async testConnection(): Promise<boolean> {
    try {
      await this.s3.headBucket({
        Bucket: this.bucketName,
      }).promise();
      console.log('✅ S3 connection successful');
      return true;
    } catch (error) {
      console.error('❌ S3 connection failed:', error.message);
      return false;
    }
  }
}