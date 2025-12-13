"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotionFileUrl = exports.getPageRelrefFromId = exports.getBlockChildren = void 0;
exports.getPageTitle = getPageTitle;
exports.getFileName = getFileName;
const client_1 = require("@notionhq/client");
const md_1 = require("./md");
const getBlockChildren = async (notionClient, block_id, totalPage) => {
    try {
        let results = [];
        let pageCount = 0;
        let start_cursor = undefined;
        do {
            const response = await notionClient.blocks.children.list({
                start_cursor,
                block_id,
            });
            results.push(...response.results);
            start_cursor = response.next_cursor;
            pageCount += 1;
        } while (start_cursor != null &&
            (totalPage == null || pageCount < totalPage));
        return results;
    }
    catch (e) {
        console.log(e);
        return [];
    }
};
exports.getBlockChildren = getBlockChildren;
function getPageTitle(page) {
    const title = page.properties.Name ?? page.properties.title;
    if (title.type === "title") {
        return (0, md_1.plainText)(title.title);
    }
    throw Error(`page.properties.Name has type ${title.type} instead of title. The underlying Notion API might has changed, please report an issue to the author.`);
}
function getFileName(title, page_id) {
    return (title.replaceAll(" ", "-").replace(/--+/g, "-") +
        "-" +
        page_id.replaceAll("-", "") +
        ".md");
}
const getPageRelrefFromId = async (pageId, notion) => {
    const page = await notion.pages.retrieve({ page_id: pageId }); // throw if failed
    if (!(0, client_1.isFullPage)(page)) {
        throw Error(`The pages.retrieve endpoint failed to return a full page for ${pageId}.`);
    }
    const title = getPageTitle(page);
    const fileName = getFileName(title, page.id);
    const relref = `{{% relref "${fileName}" %}}`;
    return { title, relref };
};
exports.getPageRelrefFromId = getPageRelrefFromId;
const getNotionFileUrl = async (notion, blockId) => {
    try {
        const block = await notion.blocks.retrieve({ block_id: blockId });
        // Check if block is a full block object with type property
        if (!("type" in block)) {
            return null;
        }
        if (block.type === "image" && "image" in block && block.image.type === "file") {
            return block.image.file.url;
        }
        return null;
    }
    catch (error) {
        console.warn(`[Warning] Failed to get file URL for block ${blockId}`);
        return null;
    }
};
exports.getNotionFileUrl = getNotionFileUrl;
