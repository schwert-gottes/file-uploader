"use client";

import { Page, Layout } from "@shopify/polaris";
import FileUploader from "./components/FileUploader";

export default function Home() {
  return (
    <Page title="File Uploader">
      <Layout>
        <Layout.Section>
          <FileUploader />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
