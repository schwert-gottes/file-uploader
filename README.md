# File Uploader

A modern file uploader built with Next.js, React, and Shopify Polaris that supports concurrent uploads, queue management, file previews, pagination, and MongoDB integration.

## Features

- Drag and drop file upload (Shopify Polaris DropZone)
- File queue with per-file status: Queued, Uploading, Uploaded, Error
- Remove files from queue before upload
- Start upload manually, with up to 2 concurrent uploads
- Progress tracking for each file
- Error handling with retry functionality
- S3 integration for file storage
- MongoDB integration for storing and paginating uploaded file metadata
- Paginated list of uploaded files with navigation controls
- Modern UI with Shopify Polaris

## Prerequisites

- Node.js 18 or later
- An S3-compatible storage service (AWS S3, Digital Ocean Spaces, Backblaze, etc.)
- MongoDB database (local or cloud, e.g. MongoDB Atlas)

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

3. Create a `.env.local` file in the root directory with your credentials:
```
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=your_region
AWS_BUCKET_NAME=your_bucket_name
MONGODB_URI=your_mongodb_connection_string
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Usage

1. Drag and drop files onto the upload area or click to select files
2. Files appear in a queue with preview, name, size, and status
3. Remove files from the queue before uploading if desired
4. Click "Start Upload" to begin uploading (2 files at a time)
5. Monitor upload progress and retry failed uploads
6. Uploaded files are listed below with pagination controls (Next/Previous)
7. Click "View" to open uploaded files in a new tab

## Implementation Details

- Built with Next.js 15 and React 19
- Uses Shopify Polaris for all UI components (including DropZone)
- Implements a queue system to limit concurrent uploads
- Handles file uploads through a Next.js API route
- Integrates with S3-compatible storage services
- Stores uploaded file metadata in MongoDB
- Fetches uploaded files with pagination from the API
- UI shows per-file status (Queued, Uploading, Uploaded, Error)
- Allows removal of files from the queue before upload
- Pagination controls for navigating uploaded files

## Trade-offs and Considerations

1. **Concurrent Uploads**: Limited to 2 concurrent uploads to prevent overwhelming the server and client
2. **Progress Tracking**: Uses a simple progress indicator as S3 doesn't provide real-time upload progress
3. **Error Handling**: Implements basic retry functionality for failed uploads
4. **File Size**: Maximum file size is 10MB (enforced in UI)
5. **File Types**: Only accepts images, PDFs, and Word documents (configurable)
6. **Pagination**: Page size is set to 10 files per page (configurable in code)

## Development Time

This project was built in approximately 45 minutes, focusing on:
- Core functionality (30 minutes)
- UI implementation (10 minutes)
- Error handling, pagination, and edge cases (5 minutes)

## License

MIT
