import { Client, isFullPage } from "@notionhq/client";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

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
