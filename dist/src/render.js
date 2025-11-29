"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPage = renderPage;
exports.savePage = savePage;
const fs_extra_1 = __importDefault(require("fs-extra"));
const client_1 = require("@notionhq/client");
const notion_to_md_1 = require("./markdown/notion-to-md");
const yaml_1 = __importDefault(require("yaml"));
const helpers_1 = require("./helpers");
const path_1 = __importDefault(require("path"));
const file_1 = require("./file");
async function renderPage(page, notion) {
    // load formatter config
    const n2m = new notion_to_md_1.NotionToMarkdown({ notionClient: notion });
    n2m.setUnsupportedTransformer((type) => {
        return `{{< notion-unsupported-block type=${type} >}}`;
    });
    let frontInjectString = "";
    const mdblocks = await n2m.pageToMarkdown(page.id);
    const mdString = n2m.toMarkdownString(mdblocks);
    page.properties.Name;
    const title = (0, helpers_1.getPageTitle)(page);
    const frontMatter = {
        title,
        date: page.created_time,
        lastmod: page.last_edited_time,
        draft: false,
    };
    // set featuredImage
    const featuredImageLink = await (0, helpers_1.getCoverLink)(page.id, notion);
    if (featuredImageLink) {
        frontMatter.featuredImage = featuredImageLink;
    }
    // Variable to store thumbnail URL
    let thumbnailUrl = null;
    // map page properties to front matter
    for (const property in page.properties) {
        const id = page.properties[property].id;
        const response = await notion.pages.properties.retrieve({
            page_id: page.id,
            property_id: id,
        });
        if (response.object === "property_item") {
            switch (response.type) {
                case "checkbox":
                    frontMatter[property] = response.checkbox;
                    break;
                case "select":
                    if (response.select)
                        frontMatter[property] = response.select.name;
                    break;
                case "multi_select":
                    frontMatter[property] = response.multi_select.map((select) => select.name);
                    break;
                case "email":
                    if (response.email)
                        frontMatter[property] = response.email;
                    break;
                case "url":
                    if (response.url)
                        frontMatter[property] = response.url;
                    break;
                case "date":
                    if (response.date)
                        frontMatter[property] = response.date.start;
                    break;
                case "number":
                    if (response.number)
                        frontMatter[property] = response.number;
                    break;
                case "phone_number":
                    if (response.phone_number)
                        frontMatter[property] = response.phone_number;
                    break;
                case "status":
                    if (response.status)
                        frontMatter[property] = response.status.name;
                    break;
                // ignore these properties
                case "last_edited_by":
                case "last_edited_time":
                case "rollup":
                case "formula":
                case "created_by":
                case "created_time":
                    break;
                case "files":
                    // Handle thumbnail property specially
                    if (property.toLowerCase() === "thumbnail") {
                        const files = response.files;
                        if (files && files.length > 0) {
                            const file = files[0];
                            if (file.type === "file") {
                                thumbnailUrl = file.file.url;
                            }
                            else if (file.type === "external") {
                                thumbnailUrl = file.external.url;
                            }
                        }
                    }
                    break;
                default:
                    break;
            }
        }
        else {
            for await (const result of (0, client_1.iteratePaginatedAPI)(
            // @ts-ignore
            notion.pages.properties.retrieve, {
                page_id: page.id,
                property_id: id,
            })) {
                switch (result.type) {
                    case "people":
                        frontMatter[property] = frontMatter[property] || [];
                        if ((0, client_1.isFullUser)(result.people)) {
                            const fm = frontMatter[property];
                            if (Array.isArray(fm) && result.people.name) {
                                fm.push(result.people.name);
                            }
                        }
                        break;
                    case "rich_text":
                        frontMatter[property] = frontMatter[property] || "";
                        frontMatter[property] += result.rich_text.plain_text;
                    // ignore these
                    case "relation":
                    case "title":
                    default:
                        break;
                }
            }
        }
    }
    // set default author
    if (frontMatter.authors == null) {
        try {
            const response = await notion.users.retrieve({
                user_id: page.last_edited_by.id,
            });
            if (response.name) {
                frontMatter.authors = [response.name];
            }
        }
        catch (error) {
            console.warn(`[Warning] Failed to get author name for ${page.id}`);
        }
    }
    // set draft based on 공개여부 (if it exists)
    if (frontMatter.공개여부 !== undefined) {
        frontMatter.draft = !frontMatter.공개여부;
    }
    // Map 카테고리 to Hugo categories taxonomy
    if (frontMatter.카테고리) {
        frontMatter.categories = [frontMatter.카테고리];
    }
    // save metadata
    frontMatter.NOTION_METADATA = page;
    frontMatter.MANAGED_BY_NOTION_HUGO = true;
    return {
        title,
        pageString: "---\n" +
            yaml_1.default.stringify(frontMatter, {
                defaultStringType: "QUOTE_DOUBLE",
                defaultKeyType: "PLAIN",
            }) +
            "\n---\n" +
            frontInjectString +
            "\n" +
            mdString,
        thumbnailUrl,
    };
}
async function savePage(page, notion, mount) {
    const title = (0, helpers_1.getPageTitle)(page);
    const folderName = (0, helpers_1.getFolderName)(title, page.id);
    const folderPath = path_1.default.join("content", mount.target_folder, folderName);
    const indexPath = path_1.default.join(folderPath, "index.md");
    // Check if the page is up-to-date (check index.md in folder)
    const post = (0, file_1.getContentFile)(indexPath);
    if (post && post.metadata.last_edited_time === page.last_edited_time) {
        console.info(`[Info] The post ${folderPath} is up-to-date, skipped.`);
        return;
    }
    // otherwise update the page
    console.info(`[Info] Updating ${folderPath}`);
    const { pageString, thumbnailUrl } = await renderPage(page, notion);
    // Create folder structure (page bundle)
    fs_extra_1.default.ensureDirSync(folderPath);
    // Write markdown content as index.md
    fs_extra_1.default.writeFileSync(indexPath, pageString);
    // Download thumbnail image if available
    if (thumbnailUrl) {
        await (0, helpers_1.downloadImage)(thumbnailUrl, folderPath, "featured");
    }
}
