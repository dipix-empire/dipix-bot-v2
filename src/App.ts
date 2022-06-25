import Discord from "discord.js"	
import AppBusMain from "./types/AppBus/Main"
import AppBusModuleComponent from "./types/AppBus/ModuleComponent"
import Config from "./types/Config"
import Module from "./types/Module"
import DiscordEvent from "./types/ModuleEvent/DiscordEvent"
import ServertapEvent from "./types/ModuleEvent/ServertapEvent"
import Secrets from "./types/Secrets"
import MinecraftServerAPI from "./types/MinecraftServerAPI"

export default class App {
	public readonly bot: Discord.Client
	public readonly minecraft: MinecraftServerAPI
	public readonly config: Config
	private appBusMain: AppBusMain
	private readonly modules: Module[]
	private readonly secrets: Secrets

	async start() {
		this.modules.forEach(m => {
			m.prepare(this, new AppBusModuleComponent(this.appBusMain, m.name)).forEach(e => {
				switch(e.type) {
					case "discord":
						let discordEvent = e as DiscordEvent
						this.bot.on(discordEvent.event, discordEvent.listener)
						break
					case "servertap":
						let serverTapEvent = e as ServertapEvent
						this.minecraft.on(serverTapEvent.event, serverTapEvent.listener)
						break

				}
			})
		})
		this.bot.login(this.secrets.discord_token)
	}
	
	constructor(config: Config, secrets: Secrets, modules: Module[]) {
		this.bot = new Discord.Client({
			intents: config.bot.intents
		})
		this.minecraft = new MinecraftServerAPI(secrets.servertap_token, config.minecraft_server_api.uri.ws, config.minecraft_server_api.uri.http)
		this.config = config
		this.secrets = secrets
		this.modules = modules
		this.appBusMain = new AppBusMain(this)
	}
}