"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.audio = exports.pdf = exports.video = exports.equation = exports.plainText = exports.table = exports.toggle = exports.divider = exports.addTabSpace = exports.image = exports.todo = exports.bullet = exports.callout = exports.quote = exports.heading3 = exports.heading2 = exports.heading1 = exports.codeBlock = exports.link = exports.underline = exports.strikethrough = exports.italic = exports.bold = exports.inlineCode = void 0;
exports.richText = richText;
const markdown_table_1 = require("markdown-table");
const notion_1 = require("./notion");
const inlineCode = (text) => {
    return `\`${text}\``;
};
exports.inlineCode = inlineCode;
const bold = (text) => {
    return `**${text}**`;
};
exports.bold = bold;
const italic = (text) => {
    return `_${text}_`;
};
exports.italic = italic;
const strikethrough = (text) => {
    return `~~${text}~~`;
};
exports.strikethrough = strikethrough;
const underline = (text) => {
    return `<u>${text}</u>`;
};
exports.underline = underline;
const link = (text, href) => {
    return `[${text}](${href})`;
};
exports.link = link;
const codeBlock = (text, language) => {
    if (language === "plain text")
        language = "text";
    return `\`\`\`${language}
${text}
\`\`\``;
};
exports.codeBlock = codeBlock;
const heading1 = (text) => {
    return `# ${text}`;
};
exports.heading1 = heading1;
const heading2 = (text) => {
    return `## ${text}`;
};
exports.heading2 = heading2;
const heading3 = (text) => {
    return `### ${text}`;
};
exports.heading3 = heading3;
const quote = (text) => {
    // the replace is done to handle multiple lines
    return `> ${text.replace(/\n/g, "  \n> ")}`;
};
exports.quote = quote;
const callout = (text, icon) => {
    let emoji;
    if (icon?.type === "emoji") {
        emoji = icon.emoji;
    }
    // the replace is done to handle multiple lines
    return `> ${emoji ? emoji + " " : ""}${text.replace(/\n/g, "  \n> ")}`;
};
exports.callout = callout;
const bullet = (text, count) => {
    let renderText = text.trim();
    return count ? `${count}. ${renderText}` : `- ${renderText}`;
};
exports.bullet = bullet;
const todo = (text, checked) => {
    return checked ? `- [x] ${text}` : `- [ ] ${text}`;
};
exports.todo = todo;
const image = (alt, href) => {
    return `![${alt}](${href})`;
};
exports.image = image;
const addTabSpace = (text, n = 0) => {
    const tab = "	";
    for (let i = 0; i < n; i++) {
        if (text.includes("\n")) {
            const multiLineText = text.split(/(?<=\n)/).join(tab);
            text = tab + multiLineText;
        }
        else
            text = tab + text;
    }
    return text;
};
exports.addTabSpace = addTabSpace;
const divider = () => {
    return "---";
};
exports.divider = divider;
const toggle = (summary, children) => {
    if (!summary)
        return children || "";
    return `<details>
  <summary>${summary}</summary>

${children || ""}

  </details>`;
};
exports.toggle = toggle;
const table = (cells) => {
    return (0, markdown_table_1.markdownTable)(cells);
};
exports.table = table;
const plainText = (textArray) => {
    return textArray.map((text) => text.plain_text).join("");
};
exports.plainText = plainText;
/**
 * Block equation
 * Format: \[ expression \]
 * @param expression
 * @returns
 */
const equation = (expression) => {
    return `\\[${expression}\\]`;
};
exports.equation = equation;
function textRichText(text) {
    const annotations = text.annotations;
    let content = text.text.content;
    if (annotations.bold) {
        content = (0, exports.bold)(content);
    }
    if (annotations.code) {
        content = (0, exports.inlineCode)(content);
    }
    if (annotations.italic) {
        content = (0, exports.italic)(content);
    }
    if (annotations.strikethrough) {
        content = (0, exports.strikethrough)(content);
    }
    if (annotations.underline) {
        content = (0, exports.underline)(content);
    }
    if (text.href) {
        content = (0, exports.link)(content, text.href);
    }
    return content;
}
/**
 * Inline equation
 * Format: \( expression \)
 * @param text
 * @returns
 */
function equationRichText(text) {
    return `\\(${text.equation.expression}\\)`;
}
async function mentionRichText(text, notion) {
    const mention = text.mention;
    switch (mention.type) {
        case "page": {
            const pageId = mention.page.id;
            const { title, relref } = await (0, notion_1.getPageRelrefFromId)(pageId, notion);
            return (0, exports.link)(title, relref);
        }
        case "user": {
            const userId = mention.user.id;
            try {
                const user = await notion.users.retrieve({ user_id: userId });
                if (user.name) {
                    return `@${user.name}`;
                }
            }
            catch (error) {
                console.warn(`Failed to retrieve user with id ${userId}`);
            }
            return "";
        }
        case "date": {
            const date = mention.date;
            const dateEnd = date.end ? ` -> ${date.end}` : "";
            const timeZone = date.time_zone ? ` (${date.time_zone})` : "";
            return `@${date.start}${dateEnd}${timeZone}`;
        }
        case "link_preview": {
            const linkPreview = mention.link_preview;
            return (0, exports.link)(linkPreview.url, linkPreview.url);
        }
        case "template_mention": {
            // https://developers.notion.com/reference/rich-text#template-mention-type-object
            // Hide the template button
            return "";
        }
        case "database": {
            console.warn("[Warn] Database mention is not supported");
            return "";
        }
    }
    return "";
}
async function richText(textArray, notion) {
    return (await Promise.all(textArray.map(async (text) => {
        if (text.type === "text") {
            return textRichText(text);
        }
        else if (text.type === "equation") {
            return equationRichText(text);
        }
        else if (text.type === "mention") {
            return await mentionRichText(text, notion);
        }
    }))).join("");
}
const video = (block) => {
    const videoBlock = block.video;
    if (videoBlock.type === "file") {
        return htmlVideo(blockIdToApiUrl(block.id));
    }
    const url = videoBlock.external.url;
    if (url.startsWith("https://www.youtube.com/")) {
        /*
          YouTube video links that include embed or watch.
          E.g. https://www.youtube.com/watch?v=[id], https://www.youtube.com/embed/[id]
        */
        // get last 11 characters of the url as the video id
        const videoId = url.slice(-11);
        return `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }
    return htmlVideo(url);
};
exports.video = video;
function htmlVideo(url) {
    return `<video controls style="height:auto;width:100%;">
  <source src="${url}">
  <p>
    Your browser does not support HTML5 video. Here is a
    <a href="${url}" download="${url}">link to the video</a> instead.
  </p>
</video>`;
}
const pdf = (block) => {
    const pdfBlock = block.pdf;
    const url = pdfBlock.type === "file"
        ? blockIdToApiUrl(block.id)
        : pdfBlock.external.url;
    return `<embed src="${url}" type="application/pdf" style="width: 100%;aspect-ratio: 2/3;height: auto;" />`;
};
exports.pdf = pdf;
const audio = (block) => {
    const audioBlock = block.audio;
    const url = audioBlock.type === "file"
        ? blockIdToApiUrl(block.id)
        : audioBlock.external.url;
    return `<audio controls src="${url}"></audio>`;
};
exports.audio = audio;
