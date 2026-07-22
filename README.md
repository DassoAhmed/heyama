# Heyama

Heyama is a full-stack app for creating and viewing shared objects with a NestJS backend, a Next.js web app, and an Expo mobile app.

## Project structure

- `Backend/` — NestJS API with MongoDB and AWS S3 image uploads
- `web/` — Next.js frontend
- `mobile/` — Expo React Native app

## Requirements

Before you start, make sure you have installed:

- Node.js 20+
- npm
- MongoDB Atlas connection or a local MongoDB instance
- AWS S3 bucket with access credentials for uploads

## 1. Clone and install

```bash
git clone https://github.com/DassoAhmed/heyama.git
cd heyama

cd Backend && npm install
cd ../web && npm install
cd ../mobile && npm install
```

## 2. Environment configuration

### Backend

Create or update `Backend/.env` with the following values:

```env
MONGODB_URI=your_mongodb_connection_string

S3_ACCESS_KEY=your_aws_access_key
S3_SECRET_KEY=your_aws_secret_key
S3_BUCKET_NAME=amzn-heyama-s3-bucket
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.us-east-1.amazonaws.com
```

Make sure the AWS credentials have access to the bucket and can perform actions such as:

- `s3:ListBucket`
- `s3:PutObject`
- `s3:GetObject`
- `s3:DeleteObject`

## 3. Run the backend

```bash
cd Backend
npm run start:dev
```

The API will run on:

- `http://localhost:3000/api`

## 4. Run the web app

```bash
cd web
npm run dev
```

The web app will be available at:

- `http://localhost:3000`

## 5. Run the mobile app

```bash
cd mobile
npm start
```

Then open the app in the Expo client or run it with:

```bash
npm run android
# or
npm run ios
# or
npm run web
```

## 6. Production build

Backend:

```bash
cd Backend
npm run build
```

Web:

```bash
cd web
npm run build
```

## Notes

- The backend uses NestJS and Socket.IO.
- Images are uploaded to AWS S3 through the backend service in `Backend/src/services/s3.service.ts`.
- If uploads fail with `Access denied`, verify the AWS IAM user, bucket policy, and region settings first.
