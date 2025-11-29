"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@notionhq/client");
const dotenv_1 = __importDefault(require("dotenv"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const render_1 = require("./render");
const config_1 = require("./config");
const file_1 = require("./file");
const helpers_1 = require("@notionhq/client/build/src/helpers");
const helpers_2 = require("./helpers");
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
async function main() {
    if (process.env.NOTION_TOKEN === "")
        throw Error("The NOTION_TOKEN environment vairable is not set.");
    const config = await (0, config_1.loadConfig)();
    console.info("[Info] Config loaded ");
    const notion = new client_1.Client({
        auth: process.env.NOTION_TOKEN,
    });
    const pageFolders = [];
    console.info("[Info] Start processing mounted databases");
    // process mounted databases
    for (const mount of config.mount.databases) {
        fs_extra_1.default.ensureDirSync(`content/${mount.target_folder}`);
        for await (const page of (0, client_1.iteratePaginatedAPI)(notion.databases.query, {
            database_id: mount.database_id,
        })) {
            if (!(0, helpers_1.isFullPageOrDatabase)(page) || page.object !== "page") {
                continue;
            }
            console.info(`[Info] Start processing page ${page.id}`);
            pageFolders.push((0, helpers_2.getFolderName)((0, helpers_2.getPageTitle)(page), page.id));
            await (0, render_1.savePage)(page, notion, mount);
        }
    }
    // process mounted pages
    for (const mount of config.mount.pages) {
        const page = await notion.pages.retrieve({ page_id: mount.page_id });
        if (!(0, client_1.isFullPage)(page)) {
            continue;
        }
        pageFolders.push((0, helpers_2.getFolderName)((0, helpers_2.getPageTitle)(page), page.id));
        await (0, render_1.savePage)(page, notion, mount);
    }
    // remove posts that exist locally but not in Notion Database
    const contentFiles = (0, file_1.getAllContentFiles)("content");
    for (const file of contentFiles) {
        // Extract folder name from filepath (parent directory of index.md)
        const folderName = path_1.default.basename(path_1.default.dirname(file.filepath));
        if (!pageFolders.includes(folderName) && file.managed) {
            // Remove the entire folder (page bundle)
            const folderPath = path_1.default.dirname(file.filepath);
            console.info(`[Info] Removing unsynced folder ${folderPath}`);
            fs_extra_1.default.removeSync(folderPath);
        }
    }
}
main()
    .then(() => process.exit(0))
    .catch((err) => {
    console.error(err);
    process.exit(1);
});
