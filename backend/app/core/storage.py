import boto3
from botocore.exceptions import ClientError
from app.core.config import settings

class MinioClient:
    def __init__(self):
        # We use MinIO via the AWS S3 SDK (boto3)
        self.s3_client = boto3.client(
            's3',
            endpoint_url='http://127.0.0.1:9002', # Port mapped in docker-compose for MinIO API
            aws_access_key_id='minioadmin',
            aws_secret_access_key='minioadminpassword',
            region_name='us-east-1' # dummy region
        )
        self.bucket_name = 'janmitra-media'
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == '404':
                try:
                    self.s3_client.create_bucket(Bucket=self.bucket_name)
                    # Make bucket public for easy read access on frontend
                    policy = {
                        "Version": "2012-10-17",
                        "Statement": [
                            {
                                "Effect": "Allow",
                                "Principal": "*",
                                "Action": ["s3:GetObject"],
                                "Resource": [f"arn:aws:s3:::{self.bucket_name}/*"]
                            }
                        ]
                    }
                    import json
                    self.s3_client.put_bucket_policy(Bucket=self.bucket_name, Policy=json.dumps(policy))
                except ClientError as ce:
                    if ce.response['Error']['Code'] != 'BucketAlreadyOwnedByYou':
                        print(f"Error creating bucket: {ce}")
            elif error_code != '403':
                print(f"Error checking bucket: {e}")

    def upload_file(self, file_content: bytes, filename: str, content_type: str) -> str:
        """
        Uploads a file to MinIO and returns the public URL.
        """
        self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=filename,
            Body=file_content,
            ContentType=content_type
        )
        # Construct public URL assuming MinIO is exposed on 9002
        return f"http://127.0.0.1:9002/{self.bucket_name}/{filename}"

minio_client = MinioClient()
