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
            // English posts database (en)
            {
                database_id: "2ba711b8a78880dc915feaae63b1c076",
                target_folder: "en/posts"
            }
        ]
    }
}

export default userConfig;