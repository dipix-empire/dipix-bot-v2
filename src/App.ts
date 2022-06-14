import Discord from "discord.js"	
import Config from "./types/Config"
import Module from "./types/Module"
import DiscordEvent from "./types/ModuleEvent/DiscordEvent"
import Secrets from "./types/Secrets"

export default class App {
	public readonly bot: Discord.Client
	public readonly config: Config
	private readonly modules: Module[]
	private readonly secrets: Secrets

	async start() {
		this.bot.login(this.secrets.discord_token)
		this.modules.forEach(m => {
			m.prepare(this).forEach(e => {
				switch(e.type) {
					case "discord":
						let discordEvent = e as DiscordEvent
						this.bot.on(discordEvent.event, discordEvent.listener)
						break
				}
			})
		})
	}
	
	constructor(config: Config, secrets: Secrets, modules: Module[]) {
		this.bot = new Discord.Client({
			intents: config.bot.intents
		})
		this.config = config
		this.secrets = secrets
		this.modules = modules
	}
}