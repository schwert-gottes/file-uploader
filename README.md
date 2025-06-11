# File Uploader

A modern file uploader built with Next.js, React, and Shopify Polaris that supports concurrent uploads with queue management.

## Features

- Drag and drop file upload
- Concurrent upload management (2 files at a time)
- Progress tracking
- Error handling with retry functionality
- S3 integration
- Modern UI with Shopify Polaris

## Prerequisites

- Node.js 18 or later
- An S3-compatible storage service (AWS S3, Digital Ocean Spaces, Backblaze, etc.)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd file-uploader
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your S3 credentials:
```
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=your_region
AWS_BUCKET_NAME=your_bucket_name
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Usage

1. Drag and drop files onto the upload area or click to select files
2. Files will be automatically queued and uploaded 2 at a time
3. Monitor upload progress in real-time
4. Retry failed uploads with the retry button
5. View uploaded files by clicking the "View file" link

## Implementation Details

- Built with Next.js 14 and React 18
- Uses Shopify Polaris for UI components
- Implements a queue system to limit concurrent uploads
- Handles file uploads through a Next.js API route
- Integrates with S3-compatible storage services
- Supports drag and drop through react-dropzone

## Trade-offs and Considerations

1. **Concurrent Uploads**: Limited to 2 concurrent uploads to prevent overwhelming the server and client
2. **Progress Tracking**: Uses a simple progress indicator as S3 doesn't provide real-time upload progress
3. **Error Handling**: Implements basic retry functionality for failed uploads
4. **File Size**: No explicit file size limit in the UI, but S3 has its own limits
5. **File Types**: Currently accepts all file types, but can be restricted if needed

## Development Time

This project was built in approximately 45 minutes, focusing on:
- Core functionality (30 minutes)
- UI implementation (10 minutes)
- Error handling and edge cases (5 minutes)

## License

MIT
