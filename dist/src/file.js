"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContentFile = getContentFile;
exports.getAllContentFiles = getAllContentFiles;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const front_matter_1 = __importDefault(require("front-matter"));
function isMarkdownFile(filename) {
    return filename.endsWith(".md");
}
function getContentFile(filepath) {
    if (!fs_1.default.existsSync(filepath)) {
        return undefined;
    }
    const filedata = (0, front_matter_1.default)(fs_1.default.readFileSync(filepath, "utf-8"));
    const metadata = filedata.attributes.NOTION_METADATA;
    if (metadata) {
        return {
            filename: path_1.default.basename(filepath),
            filepath,
            metadata,
            managed: filedata.attributes.MANAGED_BY_NOTION_HUGO ?? false,
        };
    }
    else {
        console.warn(`[Warn] ${filepath} does not have NOTION_METADATA in its front matter`);
        return undefined;
    }
}
function getAllContentFiles(dirPath) {
    const fileArray = [];
    const queue = [dirPath];
    while (queue.length !== 0) {
        const filepath = queue.shift();
        if (filepath === undefined)
            continue;
        if (fs_1.default.statSync(filepath).isDirectory()) {
            const files = fs_1.default.readdirSync(filepath);
            for (const file of files) {
                queue.push(path_1.default.join(filepath, file));
            }
            continue;
        }
        if (!isMarkdownFile(filepath))
            continue;
        const filedata = (0, front_matter_1.default)(fs_1.default.readFileSync(filepath, "utf-8"));
        const metadata = filedata.attributes.NOTION_METADATA;
        if (metadata) {
            fileArray.push({
                filename: path_1.default.basename(filepath),
                filepath,
                metadata,
                managed: filedata.attributes.MANAGED_BY_NOTION_HUGO ?? false,
            });
        }
        else {
            console.warn(`[Warn] ${filepath} does not have NOTION_METADATA in its front matter, it will not be managed.`);
        }
    }
    return fileArray;
}
