"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
exports.defineConfig = defineConfig;
const client_1 = require("@notionhq/client");
const notion_hugo_config_1 = __importDefault(require("../notion-hugo.config"));
async function loadConfig() {
    const userConfig = notion_hugo_config_1.default;
    const config = {
        mount: {
            databases: [],
            pages: [],
        },
    };
    global.blockIdToApiUrl = function (block_id) {
        return `${userConfig.base_url}/api?block_id=${block_id}`;
    };
    global.pageIdToApiUrl = function (page_id) {
        return `${userConfig.base_url}/api?page_id=${page_id}`;
    };
    // configure mount settings
    if (userConfig.mount.manual) {
        if (userConfig.mount.databases)
            config.mount.databases = userConfig.mount.databases;
        if (userConfig.mount.pages)
            config.mount.pages = userConfig.mount.pages;
    }
    else {
        if (userConfig.mount.page_url === undefined)
            throw Error(`[Error] When mount.manual is false, a page_url must be set.`);
        const url = new URL(userConfig.mount.page_url);
        const len = url.pathname.length;
        if (len < 32)
            throw Error(`[Error] The page_url ${url.href} is invalid`);
        const pageId = url.pathname.slice(len - 32, len);
        const notion = new client_1.Client({
            auth: process.env.NOTION_TOKEN,
        });
        for await (const block of (0, client_1.iteratePaginatedAPI)(notion.blocks.children.list, {
            block_id: pageId,
        })) {
            if (!(0, client_1.isFullBlock)(block))
                continue;
            if (block.type === "child_database") {
                config.mount.databases.push({
                    database_id: block.id,
                    target_folder: `${block.child_database.title}/posts`,
                });
            }
            if (block.type === "child_page") {
                config.mount.pages.push({
                    page_id: block.id,
                    target_folder: ".",
                });
            }
        }
    }
    return config;
}
function defineConfig(config) {
    return config;
}
