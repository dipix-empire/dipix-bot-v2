import Secrets from "./src/types/Secrets";

export default {
	discord_token: process.env.DISCORD_TOKEN || "",
	servertap_token: process.env.SERVERTAP_TOKEN || ""
} as Secrets