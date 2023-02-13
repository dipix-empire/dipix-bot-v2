import { config } from "dotenv";
import Secrets from "./src/types/Secrets";
config()

export default {
	discord_token: process.env.DISCORD_TOKEN || "",
	servertap_token: process.env.SERVERTAP_TOKEN || "",
	webhook_url: process.env.WEBHOOK_URL || ""
} as Secrets
