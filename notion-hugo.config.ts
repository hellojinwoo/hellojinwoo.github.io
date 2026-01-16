import { UserConfig } from "./src/config"

const userConfig: UserConfig = {
    base_url: "https://example.org",
    mount: {
        manual: true,
        databases: [
            // Korean posts database (ko)
            {
                database_id: "297711b8a78880cdba85d06177bf5563",
                target_folder: "ko/posts"
            },
            // French posts database (fr)
            {
                database_id: "2ba711b8a78880e29836f82c8c69a834",
                target_folder: "fr/posts"
            }
        ]
    }
}

export default userConfig;