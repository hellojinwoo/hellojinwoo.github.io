import { UserConfig } from "./src/config"

const userConfig: UserConfig = {
    base_url: "https://example.org",
    mount: {
        manual: true,
        databases: [
            // Korean posts database
            {
                database_id: "2ba711b8a78880e29836f82c8c69a834",
                target_folder: "ko/posts"
            },
            // French posts database
            {
                database_id: "297711b8a788807c9f4ced71c561e0e9",
                target_folder: "fr/posts"
            }
        ]
    }
}

export default userConfig;