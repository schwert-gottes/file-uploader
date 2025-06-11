"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Card,
  DropZone,
  Thumbnail,
  ProgressBar,
  Button,
  BlockStack,
  InlineStack,
  Text,
  List,
} from "@shopify/polaris";
import { DeleteIcon } from "@shopify/polaris-icons";

interface FileWithPreview {
  file: File;
  preview?: string;
  status: "pending" | "uploading" | "completed" | "error";
  progress: number;
  error?: string;
  url?: string;
}

interface UploadedFile {
  _id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

const MAX_CONCURRENT_UPLOADS = 2;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
].join(",");

export default function FileUploader() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFilesPage, setUploadedFilesPage] = useState(1);
  const [uploadedFilesTotal, setUploadedFilesTotal] = useState(0);
  const [uploadedFilesTotalPages, setUploadedFilesTotalPages] = useState(1);
  const [uploadedFilesLoading, setUploadedFilesLoading] = useState(false);
  const uploadQueue = useRef<FileWithPreview[]>([]);
  const activeUploads = useRef<number>(0);
  const PAGE_SIZE = 5;

  // Fetch uploaded files on component mount and when page changes
  useEffect(() => {
    fetchUploadedFiles(uploadedFilesPage);
  }, [uploadedFilesPage]);

  const fetchUploadedFiles = async (page = 1) => {
    setUploadedFilesLoading(true);
    try {
      const response = await fetch(
        `/api/files?page=${page}&limit=${PAGE_SIZE}`
      );
      if (response.ok) {
        const data = await response.json();
        setUploadedFiles(data.files);
        setUploadedFilesTotal(data.total);
        setUploadedFilesTotalPages(data.totalPages);
      }
    } catch (error) {
      toast.error("Failed to fetch uploaded files");
    } finally {
      setUploadedFilesLoading(false);
    }
  };

  const onDrop = useCallback((files: File[]) => {
    const validFiles: FileWithPreview[] = [];
    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        return;
      }
      if (!ACCEPTED_FILE_TYPES.split(",").includes(file.type)) {
        toast.error(`${file.name} is not a supported file type.`);
        return;
      }
      validFiles.push({
        file,
        status: "pending",
        progress: 0,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      });
    });

    if (validFiles.length > 0) {
      toast.success(`Added ${validFiles.length} file(s) to upload queue`);
      setFiles((prev) => [...prev, ...validFiles]);
      uploadQueue.current = [...uploadQueue.current, ...validFiles];
    }
  }, []);

  const uploadFile = async (fileObj: FileWithPreview) => {
    const formData = new FormData();
    formData.append("file", fileObj.file);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }
      const data = await response.json();
      return data.url;
    } catch (error) {
      throw error;
    }
  };

  const processQueue = async () => {
    if (
      activeUploads.current >= MAX_CONCURRENT_UPLOADS ||
      uploadQueue.current.length === 0
    ) {
      return;
    }
    const fileObj = uploadQueue.current.shift();
    if (!fileObj) return;
    activeUploads.current++;
    setUploading(true);
    try {
      setFiles((prev) => prev.filter((f) => f !== fileObj));
      const url = await uploadFile(fileObj);
      setFiles((prev) =>
        prev
          .map((f) =>
            f === fileObj
              ? { ...f, status: "completed" as const, progress: 100, url }
              : f
          )
          .filter((f) => f.status !== "completed")
      );
      toast.success(`${fileObj.file.name} uploaded successfully`);
      fetchUploadedFiles(uploadedFilesPage);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      setFiles((prev) =>
        prev.map((f) =>
          f === fileObj ? { ...f, status: "error", error: errorMessage } : f
        )
      );
      toast.error(`Failed to upload ${fileObj.file.name}: ${errorMessage}`);
    } finally {
      activeUploads.current--;
      processQueue();
    }
  };

  const retryUpload = (fileObj: FileWithPreview) => {
    setFiles((prev) =>
      prev.map((f) =>
        f === fileObj
          ? { ...f, status: "pending", progress: 0, error: undefined }
          : f
      )
    );
    uploadQueue.current.push(fileObj);
    processQueue();
    toast.loading(`Retrying upload of ${fileObj.file.name}...`);
  };

  const removeFile = (fileToRemove: FileWithPreview) => {
    setFiles((prev) => prev.filter((f) => f !== fileToRemove));
    uploadQueue.current = uploadQueue.current.filter((f) => f !== fileToRemove);
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    toast.success(`Removed ${fileToRemove.file.name} from queue`);
  };

  const startUpload = () => {
    if (files.length === 0) {
      toast.error("No files to upload");
      return;
    }
    processQueue();
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
      <BlockStack gap="400">
        <Card>
          <DropZone onDrop={onDrop} accept={ACCEPTED_FILE_TYPES}>
            <DropZone.FileUpload
              actionHint="Accepts images, PDFs, and Word documents up to 10MB"
              actionTitle="Upload files"
            />
          </DropZone>
        </Card>

        {files.length > 0 && (
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text variant="headingMd" as="h2">
                  Files to Upload ({files.length})
                </Text>
                <Button onClick={startUpload} variant="primary">
                  Start Upload
                </Button>
              </InlineStack>
              <List>
                {files.map((fileObj, index) => (
                  <List.Item key={index}>
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="200">
                        <BlockStack gap="100">
                          <Text variant="bodyMd" as="p">
                            {fileObj.file.name}
                          </Text>
                          <Text variant="bodySm" as="p" tone="subdued">
                            {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                          </Text>
                          {fileObj.status === "uploading" && (
                            <Text variant="bodySm" as="p" tone="subdued">
                              Uploading…
                            </Text>
                          )}
                          {fileObj.status === "pending" && (
                            <Text variant="bodySm" as="p" tone="subdued">
                              Queued
                            </Text>
                          )}
                          {fileObj.status === "completed" && (
                            <Text variant="bodySm" as="p" tone="success">
                              Uploaded
                            </Text>
                          )}
                          {fileObj.status === "error" && (
                            <Text variant="bodySm" as="p" tone="critical">
                              Error
                            </Text>
                          )}
                        </BlockStack>
                      </InlineStack>
                      <InlineStack gap="200">
                        {fileObj.status === "error" && (
                          <>
                            <Button onClick={() => retryUpload(fileObj)}>
                              Retry
                            </Button>
                            <Button
                              onClick={() => removeFile(fileObj)}
                              tone="critical"
                              icon={DeleteIcon}
                            />
                          </>
                        )}
                        {fileObj.status === "uploading" && (
                          <ProgressBar
                            progress={fileObj.progress}
                            size="small"
                          />
                        )}
                        {fileObj.status === "completed" && (
                          <Button
                            onClick={() => removeFile(fileObj)}
                            tone="critical"
                            icon={DeleteIcon}
                          />
                        )}
                        {fileObj.status === "pending" && (
                          <Button
                            onClick={() => removeFile(fileObj)}
                            tone="critical"
                            icon={DeleteIcon}
                          />
                        )}
                      </InlineStack>
                    </InlineStack>
                  </List.Item>
                ))}
              </List>
            </BlockStack>
          </Card>
        )}

        {uploadedFiles.length > 0 && (
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Uploaded Files
              </Text>
              {uploadedFilesLoading ? (
                <Text variant="bodyMd" as="p">
                  Loading...
                </Text>
              ) : (
                <List>
                  {uploadedFiles.map((file) => (
                    <List.Item key={file._id}>
                      <InlineStack align="space-between" blockAlign="center">
                        <InlineStack gap="200">
                          <BlockStack gap="100">
                            <Text variant="bodyMd" as="p">
                              {file.name}
                            </Text>
                            <Text variant="bodySm" as="p" tone="subdued">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </Text>
                          </BlockStack>
                        </InlineStack>
                        <Button url={file.url} external target="_blank">
                          View
                        </Button>
                      </InlineStack>
                    </List.Item>
                  ))}
                </List>
              )}
              {/* Pagination Controls */}
              {uploadedFilesTotalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 16,
                    alignItems: "center",
                  }}
                >
                  <InlineStack gap="200" align="center">
                    <Button
                      onClick={() =>
                        setUploadedFilesPage((p) => Math.max(1, p - 1))
                      }
                      disabled={uploadedFilesPage === 1}
                    >
                      Previous
                    </Button>
                    <span style={{ minWidth: 100, textAlign: "center" }}>
                      <Text variant="bodySm" as="span">
                        Page {uploadedFilesPage} of {uploadedFilesTotalPages}
                      </Text>
                    </span>
                    <Button
                      onClick={() =>
                        setUploadedFilesPage((p) =>
                          Math.min(uploadedFilesTotalPages, p + 1)
                        )
                      }
                      disabled={uploadedFilesPage === uploadedFilesTotalPages}
                    >
                      Next
                    </Button>
                  </InlineStack>
                </div>
              )}
            </BlockStack>
          </Card>
        )}
      </BlockStack>
    </>
  );
}
