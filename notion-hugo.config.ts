import { UserConfig } from "./src/config"

const userConfig: UserConfig = {
    base_url: "https://example.org",
    mount: {
        manual: false,
        page_url: 'https://www.notion.so/Notion-Blog-297711b8a78880018f67d0883832583b',
        pages: [
            // Korean content
        ],
        databases: [
            // Korean database
            {
                database_id: '297711b8a78880018f67d0883832583b',
                target_folder: 'ko/posts'
            },
            // French database (프랑스어 데이터베이스 생성 후 ID를 여기에 입력하세요)
            {
                database_id: '297711b8a788807c9f4ced71c561e0e9',
                target_folder: 'fr/posts'
            },
            // English database (영어 데이터베이스 생성 후 ID를 여기에 입력하세요)
            {
                database_id: '297711b8a788804e9553de5de4846344',
                target_folder: 'en/posts'
            }
        ],
    }
}

export default userConfig;