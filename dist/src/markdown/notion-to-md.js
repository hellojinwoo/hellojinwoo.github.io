"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotionToMarkdown = void 0;
const client_1 = require("@notionhq/client");
const md = __importStar(require("./md"));
const notion_1 = require("./notion");
const md_1 = require("./md");
/**
 * Converts a Notion page to Markdown.
 */
class NotionToMarkdown {
    notionClient;
    customTransformers;
    richText;
    unsupportedTransformer = () => "";
    constructor(options) {
        this.notionClient = options.notionClient;
        this.customTransformers = {};
        this.richText = (textArray) => md.richText(textArray, this.notionClient);
    }
    setCustomTransformer(type, transformer) {
        this.customTransformers[type] = transformer;
        return this;
    }
    setCustomRichTextTransformer(transformer) {
        this.richText = (textArray) => transformer(textArray, this.notionClient);
        return this;
    }
    setUnsupportedTransformer(transformer) {
        this.unsupportedTransformer = transformer;
        return this;
    }
    /**
     * Converts Markdown Blocks to string
     * @param {MdBlock[]} mdBlocks - Array of markdown blocks
     * @param {number} nestingLevel - Defines max depth of nesting
     * @returns {string} - Returns markdown string
     */
    toMarkdownString(mdBlocks = [], nestingLevel = 0) {
        let mdString = "";
        mdBlocks.forEach((mdBlocks) => {
            // process parent blocks
            if (mdBlocks.parent) {
                if (mdBlocks.type !== "to_do" &&
                    mdBlocks.type !== "bulleted_list_item" &&
                    mdBlocks.type !== "numbered_list_item") {
                    // add extra line breaks non list blocks
                    mdString += `\n${md.addTabSpace(mdBlocks.parent, nestingLevel)}\n\n`;
                }
                else {
                    mdString += `${md.addTabSpace(mdBlocks.parent, nestingLevel)}\n`;
                }
            }
            // process child blocks
            if (mdBlocks.children && mdBlocks.children.length > 0) {
                if (mdBlocks.type === "synced_block") {
                    mdString += this.toMarkdownString(mdBlocks.children, nestingLevel);
                }
                else {
                    mdString += this.toMarkdownString(mdBlocks.children, nestingLevel + 1);
                }
            }
        });
        return mdString;
    }
    /**
     * Retrieves Notion Blocks based on ID and converts them to Markdown Blocks
     * @param {string} id - notion page id (not database id)
     * @param {number} totalPage - Retrieve block children request number, page_size Maximum = totalPage * 100 (Default=null)
     * @returns {Promise<MdBlock[]>} - List of markdown blocks
     */
    async pageToMarkdown(id, totalPage = null) {
        if (!this.notionClient) {
            throw new Error("notion client is not provided, for more details check out https://github.com/souvikinator/notion-to-md");
        }
        const blocks = await (0, notion_1.getBlockChildren)(this.notionClient, id, totalPage);
        const parsedData = await this.blocksToMarkdown(blocks);
        return parsedData;
    }
    /**
     * Converts list of Notion Blocks to Markdown Blocks
     * @param {ListBlockChildrenResponseResults | undefined} blocks - List of notion blocks
     * @param {number} totalPage - Retrieve block children request number, page_size Maximum = totalPage * 100
     * @param {MdBlock[]} mdBlocks - Defines max depth of nesting
     * @returns {Promise<MdBlock[]>} - Array of markdown blocks with their children
     */
    async blocksToMarkdown(blocks, totalPage = null, mdBlocks = []) {
        if (!this.notionClient) {
            throw new Error("notion client is not provided, for more details check out https://github.com/souvikinator/notion-to-md");
        }
        if (!blocks)
            return mdBlocks;
        for (const block of blocks) {
            if (!(0, client_1.isFullBlock)(block))
                continue;
            let expiry_time = undefined;
            if (block.type === "pdf" && block.pdf.type === "file") {
                expiry_time = block.pdf.file.expiry_time;
            }
            if (block.type === "image" && block.image.type === "file") {
                expiry_time = block.image.file.expiry_time;
            }
            if (block.type === "video" && block.video.type === "file") {
                expiry_time = block.video.file.expiry_time;
            }
            if (block.type === "file" && block.file.type === "file") {
                expiry_time = block.file.file.expiry_time;
            }
            if (block.has_children &&
                block.type !== "column_list" &&
                block.type !== "toggle" &&
                block.type !== "callout" &&
                block.type !== "quote") {
                let child_blocks = await (0, notion_1.getBlockChildren)(this.notionClient, block.id, totalPage);
                mdBlocks.push({
                    type: block.type,
                    parent: await this.blockToMarkdown(block),
                    children: [],
                    expiry_time,
                });
                await this.blocksToMarkdown(child_blocks, totalPage, mdBlocks[mdBlocks.length - 1].children);
                continue;
            }
            let tmp = await this.blockToMarkdown(block);
            mdBlocks.push({
                type: block.type,
                parent: tmp,
                children: [],
                expiry_time,
            });
        }
        return mdBlocks;
    }
    /**
     * Converts a Notion Block to a Markdown Block
     * @param block - single notion block
     * @returns corresponding markdown string of the passed block
     */
    async blockToMarkdown(block) {
        if (typeof block !== "object" || !("type" in block))
            return "";
        const { type } = block;
        if (type in this.customTransformers && !!this.customTransformers[type])
            return await this.customTransformers[type](block);
        switch (type) {
            case "image": {
                const image = block.image;
                if (image.type === "external") {
                    return md.image((0, md_1.plainText)(image.caption), image.external.url);
                }
                // For file type images, we need to get the actual URL from Notion's API
                // Use a special marker that will be replaced with the actual URL later
                const fileUrl = await (0, notion_1.getNotionFileUrl)(this.notionClient, block.id);
                return md.image((0, md_1.plainText)(image.caption), fileUrl || blockIdToApiUrl(block.id));
            }
            case "divider": {
                return md.divider();
            }
            case "equation": {
                return md.equation(block.equation.expression);
            }
            case "video":
                return md.video(block);
            case "pdf":
                return md.pdf(block);
            case "file": {
                const file = block.file;
                const link = file.type === "external" ? file.external.url : blockIdToApiUrl(block.id);
                return md.link(file.name, link);
            }
            case "bookmark": {
                const bookmark = block.bookmark;
                const caption = bookmark.caption.length > 0
                    ? await this.richText(bookmark.caption)
                    : bookmark.url;
                return md.link(caption, bookmark.url);
            }
            case "link_to_page": {
                const linkToPage = block.link_to_page;
                if (linkToPage.type === "page_id") {
                    const { title, relref } = await (0, notion_1.getPageRelrefFromId)(linkToPage.page_id, this.notionClient);
                    return md.link(title, relref);
                }
                else if (linkToPage.type === "comment_id") {
                    console.warn("Unsupported link_to_page type: comment_id");
                    return "";
                }
                else if (linkToPage.type === "database_id") {
                    console.warn("Unsupported link_to_page type: database_id");
                    return "";
                }
                break;
            }
            case "embed": {
                const embed = block.embed;
                const title = embed.caption.length > 0 ? (0, md_1.plainText)(embed.caption) : embed.url;
                return md.link(title, embed.url);
            }
            case "link_preview": {
                const linkPreview = block.link_preview;
                return md.link(linkPreview.url, linkPreview.url);
            }
            case "child_page":
            case "child_database":
                {
                    let blockContent;
                    let title = type;
                    if (type === "child_page") {
                        blockContent = { url: block.id };
                        title = block.child_page.title;
                    }
                    if (type === "child_database") {
                        blockContent = { url: block.id };
                        title = block.child_database.title || "child_database";
                    }
                    if (blockContent)
                        return md.link(title, blockContent.url);
                }
                break;
            case "table": {
                const { id, has_children } = block;
                let tableArr = [];
                if (has_children) {
                    const tableRows = await (0, notion_1.getBlockChildren)(this.notionClient, id, 100);
                    // console.log(">>", tableRows);
                    let rowsPromise = tableRows?.map(async (row) => {
                        const { type } = row;
                        const cells = row[type]["cells"];
                        /**
                         * this is more like a hack since matching the type text was
                         * difficult. So converting each cell to paragraph type to
                         * reuse the blockToMarkdown function
                         */
                        let cellStringPromise = cells.map(async (cell) => await this.blockToMarkdown({
                            type: "paragraph",
                            paragraph: { rich_text: cell },
                        }));
                        const cellStringArr = await Promise.all(cellStringPromise);
                        // console.log("~~", cellStringArr);
                        tableArr.push(cellStringArr);
                        // console.log(tableArr);
                    });
                    await Promise.all(rowsPromise || []);
                }
                return md.table(tableArr);
            }
            case "column_list": {
                const { id, has_children } = block;
                if (!has_children)
                    return "";
                const column_list_children = await (0, notion_1.getBlockChildren)(this.notionClient, id, 100);
                let column_list_promise = column_list_children.map(async (column) => await this.blockToMarkdown(column));
                let column_list = await Promise.all(column_list_promise);
                return column_list.join("\n\n");
            }
            case "column": {
                const { id, has_children } = block;
                if (!has_children)
                    return "";
                const column_children = await (0, notion_1.getBlockChildren)(this.notionClient, id, 100);
                const column_children_promise = column_children.map(async (column_child) => await this.blockToMarkdown(column_child));
                let column = await Promise.all(column_children_promise);
                return column.join("\n\n");
            }
            case "toggle": {
                const { id, has_children } = block;
                const toggle_summary = block.toggle.rich_text[0]?.plain_text;
                // empty toggle
                if (!has_children) {
                    return md.toggle(toggle_summary);
                }
                const toggle_children_object = await (0, notion_1.getBlockChildren)(this.notionClient, id, 100);
                // parse children blocks to md object
                const toggle_children = await this.blocksToMarkdown(toggle_children_object);
                // convert children md object to md string
                const toggle_children_md_string = this.toMarkdownString(toggle_children);
                return md.toggle(toggle_summary, toggle_children_md_string);
            }
            case "paragraph":
                return await this.richText(block.paragraph.rich_text);
            case "heading_1":
                return md.heading1(await this.richText(block.heading_1.rich_text));
            case "heading_2":
                return md.heading2(await this.richText(block.heading_2.rich_text));
            case "heading_3":
                return md.heading3(await this.richText(block.heading_3.rich_text));
            case "bulleted_list_item":
                return md.bullet(await this.richText(block.bulleted_list_item.rich_text));
            case "numbered_list_item":
                return md.bullet(await this.richText(block.numbered_list_item.rich_text), 1);
            case "to_do":
                return md.todo(await this.richText(block.to_do.rich_text), block.to_do.checked);
            case "code":
                return md.codeBlock((0, md_1.plainText)(block.code.rich_text), block.code.language);
            case "callout":
                const { id, has_children } = block;
                const callout_text = await this.richText(block.callout.rich_text);
                if (!has_children)
                    return md.callout(callout_text, block.callout.icon);
                let callout_string = "";
                const callout_children_object = await (0, notion_1.getBlockChildren)(this.notionClient, id, 100);
                // parse children blocks to md object
                const callout_children = await this.blocksToMarkdown(callout_children_object);
                callout_string += `${callout_text}\n`;
                callout_children.map((child) => {
                    callout_string += `${child.parent}\n\n`;
                });
                return md.callout(callout_string.trim(), block.callout.icon);
            case "quote":
                const quote_text = await this.richText(block.quote.rich_text);
                if (!block.has_children)
                    return md.quote(quote_text);
                let quote_string = "";
                const quote_children_object = await (0, notion_1.getBlockChildren)(this.notionClient, block.id, 100);
                const quote_children = await this.blocksToMarkdown(quote_children_object);
                quote_string += `${quote_text}\n`;
                quote_children.map((child) => {
                    quote_string += `${child.parent}\n\n`;
                });
                return md.quote(quote_string.trim());
            case "audio":
                return md.audio(block);
            case "template":
            case "synced_block":
            case "child_page":
            case "child_database":
            case "column":
            case "link_preview":
            case "column_list":
            case "link_to_page":
            case "breadcrumb":
            case "unsupported":
            case "table_of_contents":
                return this.unsupportedTransformer(type);
        }
        return "";
    }
}
exports.NotionToMarkdown = NotionToMarkdown;
