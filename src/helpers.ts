import { Client, isFullPage } from "@notionhq/client";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import https from "https";
import http from "http";
import fs from "fs-extra";
import path from "path";

export function getPageTitle(page: PageObjectResponse): string {
  // Try to find title property by name
  const title = page.properties.Name ?? page.properties.title ?? page.properties.Title;

  // If not found by name, search for any property with type 'title'
  if (!title) {
    const titleProp = Object.values(page.properties).find(prop => prop.type === "title");
    if (titleProp && titleProp.type === "title") {
      return titleProp.title.map((text) => text.plain_text).join("");
    }
  }

  if (title && title.type === "title") {
    return title.title.map((text) => text.plain_text).join("");
  }

  throw Error(
    `Could not find title property in page. Available properties: ${Object.keys(page.properties).join(", ")}`,
  );
}

export async function getCoverLink(
  page_id: string,
  notion: Client,
): Promise<string | null> {
  const page = await notion.pages.retrieve({ page_id });
  if (!isFullPage(page) || page.cover === null) {
    return null;
  }
  return page.cover.type === "external"
    ? page.cover.external.url
    : pageIdToApiUrl(page_id);
}

export function pageIdToApiUrl(page_id: string): string {
  // Convert Notion page ID to API URL for accessing the cover image
  const id = page_id.replaceAll("-", "");
  return `https://www.notion.so/image/${encodeURIComponent(`https://www.notion.so/${id}`)}?table=block&id=${id}`;
}

export function getFileName(title: string, page_id: string): string {
  return (
    title.replaceAll(" ", "-").replace(/--+/g, "-") +
    "-" +
    page_id.replaceAll("-", "") +
    ".md"
  );
}

// Get folder name for page bundle (without .md extension)
export function getFolderName(title: string, page_id: string): string {
  return (
    title.replaceAll(" ", "-").replace(/--+/g, "-") +
    "-" +
    page_id.replaceAll("-", "")
  );
}

// Get file extension from Content-Type header or URL
function getImageExtension(contentType: string | undefined, url: string): string {
  // Try to get extension from Content-Type
  if (contentType) {
    const mimeToExt: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg", 
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",
      "image/svg+xml": ".svg",
    };
    const ext = mimeToExt[contentType.split(";")[0].trim()];
    if (ext) return ext;
  }
  
  // Try to get extension from URL
  const urlPath = new URL(url).pathname;
  const urlExt = path.extname(urlPath).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(urlExt)) {
    return urlExt === ".jpeg" ? ".jpg" : urlExt;
  }
  
  // Default to jpg
  return ".jpg";
}

// Single-attempt image download. Returns saved file path or null on failure.
function downloadImageOnce(
  url: string,
  destFolder: string,
  baseName: string
): Promise<string | null> {
  return new Promise((resolve) => {
    const protocol = url.startsWith("https") ? https : http;

    const request = protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadImageOnce(redirectUrl, destFolder, baseName).then(resolve);
          return;
        }
      }

      if (response.statusCode !== 200) {
        console.warn(`[Warning] Failed to download image: HTTP ${response.statusCode}`);
        resolve(null);
        return;
      }

      const contentType = response.headers["content-type"];
      const ext = getImageExtension(contentType, url);
      const destPath = path.join(destFolder, `${baseName}${ext}`);

      fs.ensureDirSync(destFolder);

      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);

      fileStream.on("finish", () => {
        fileStream.close();
        console.info(`[Info] Downloaded thumbnail to ${destPath}`);
        resolve(destPath);
      });

      fileStream.on("error", (err) => {
        console.warn(`[Warning] Failed to save image: ${err.message}`);
        fs.removeSync(destPath);
        resolve(null);
      });
    });

    request.on("error", (err) => {
      console.warn(`[Warning] Failed to download image: ${err.message}`);
      resolve(null);
    });

    request.setTimeout(30000, () => {
      request.destroy();
      console.warn("[Warning] Image download timeout");
      resolve(null);
    });
  });
}

// Download image with retries (3 attempts, exponential backoff).
// Notion S3 URLs occasionally fail transiently (socket hang up), so retry.
export async function downloadImage(
  url: string,
  destFolder: string,
  baseName: string = "featured"
): Promise<string | null> {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await downloadImageOnce(url, destFolder, baseName);
    if (result) return result;
    if (attempt < maxAttempts) {
      const delayMs = 1000 * Math.pow(2, attempt - 1); // 1s, 2s
      console.info(`[Info] Retrying image download (${attempt}/${maxAttempts - 1}) in ${delayMs}ms: ${baseName}`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return null;
}
