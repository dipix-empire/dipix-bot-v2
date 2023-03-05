import Discord from "./Clients/Discord"	
import AppBusMain from "./types/AppBus/Main"
import AppBusModuleComponent from "./types/AppBus/ModuleComponent"
import Config from "./types/Config"
import Module from "./types/Module"
import DiscordEvent from "./types/ModuleEvent/DiscordEvent"
import MinecraftEvent from "./types/ModuleEvent/MinecraftEvent"
import Secrets from "./types/Secrets"
// import LegacyMinecraft from "./Clients/LegacyMinecraft"
import { PrismaClient } from "@prisma/client"
import Logger from "./types/Logger"
import REST from "./Clients/Rest"
import Minecraft from "./Clients/Minecraft"

export default class App {
	public readonly bot: Discord
	public readonly minecraft: Minecraft
	public readonly rest: REST
	public readonly prisma: PrismaClient
	public readonly config: Config
	private readonly logger: Logger
	private appBusMain: AppBusMain
	private readonly modules: Module[]

	async start() {
		this.modules.forEach(async m => {
			let logger = new Logger(m.name, this.config.logLevel, "module")
			logger.Verbose(`Enabling module '${m.name}'`);
			(await m.prepare(this, new AppBusModuleComponent(this.appBusMain, m.name, logger), logger)).forEach(e => {
				switch(e.type) {
					case "discord":
						let discordEvent = e as DiscordEvent
						this.bot.on(discordEvent.event, discordEvent.listener)
						break
					case "servertap":
						let serverTapEvent = e as MinecraftEvent
						logger.Warn("Event binding failed! (servertap)")
						// this.minecraft.on(serverTapEvent.event, serverTapEvent.listener)
						break

				}
			})
		})
		if (this.modules.length == 0) this.logger.Warn("No modules were provided. Check index.ts or config.ts")
		await this.prisma.$connect()
		//!TURN ON THIS!
		this.bot.start(this)
		this.rest.start()
		// this.minecraft.start()
	}
	
	constructor(config: Config, secrets: Secrets, modules: Module[]) {
		this.logger = new Logger("app", config.logLevel)
		this.bot = new Discord(
			secrets.discord_token,
			config.bot.clientId,
			{
				intents: config.bot.intents
			},
			new Logger("Bot", config.logLevel, "client"),
			config.bot.guildId
		)
		// this.minecraft = new LegacyMinecraft(
		// 	secrets.servertap_token,
		// 	config.minecraft_server_api.web.ws,
		// 	config.minecraft_server_api.web.http,
		// 	config.minecraft_server_api.web.port,
		// 	new Logger("Minecraft", config.logLevel, "client")
		// )
		this.minecraft = new Minecraft(config.minecraft.uri, new Logger("Minecraft", config.logLevel, "client"))
		this.rest = new REST(config.rest.port, new Logger("Rest", config.logLevel, "client"))
		this.prisma = new PrismaClient()
		this.appBusMain = new AppBusMain(this.logger)
		this.config = config
		this.modules = modules
	}
}
