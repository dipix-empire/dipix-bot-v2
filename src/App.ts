import Discord from "./Clients/Discord"	
import AppBusMain from "./types/AppBus/Main"
import AppBusModuleComponent from "./types/AppBus/ModuleComponent"
import Config from "./types/Config"
import Module from "./types/Module"
import DiscordEvent from "./types/ModuleEvent/DiscordEvent"
import MinecraftEvent from "./types/ModuleEvent/MinecraftEvent"
import Secrets from "./types/Secrets"
import Minecraft from "./Clients/Minecraft"
import { PrismaClient } from "@prisma/client"
import Logger from "./types/Logger"

export default class App {
	public readonly bot: Discord
	public readonly minecraft: Minecraft
	public readonly config: Config
	public readonly prisma: PrismaClient
	private readonly logger: Logger
	private appBusMain: AppBusMain
	private readonly modules: Module[]

	async start() {
		this.modules.forEach(async m => {
			let logger = new Logger(m.name, this.config.logLevel)
			logger.Verbose(`Enabling module '${m.name}'`);
			(await m.prepare(this, new AppBusModuleComponent(this.appBusMain, m.name, logger), logger)).forEach(e => {
				switch(e.type) {
					case "discord":
						let discordEvent = e as DiscordEvent
						this.bot.on(discordEvent.event, discordEvent.listener)
						break
					case "servertap":
						let serverTapEvent = e as MinecraftEvent
						this.minecraft.on(serverTapEvent.event, serverTapEvent.listener)
						break

				}
			})
		})
		await this.prisma.$connect()
		this.bot.start(this.config.bot.guildId)
		this.minecraft.start()
	}
	
	constructor(config: Config, secrets: Secrets, modules: Module[]) {
		this.logger = new Logger("app", config.logLevel)
		this.bot = new Discord(
			secrets.discord_token,
			config.bot.clientId,
			{
				intents: config.bot.intents
			},
			new Logger("CLIENT_BOT", config.logLevel)
		)
		this.minecraft = new Minecraft(
			secrets.servertap_token,
			config.minecraft_server_api.web.ws,
			config.minecraft_server_api.web.http,
			config.minecraft_server_api.web.port,
			new Logger("CLIENT_MINECRAFT", config.logLevel)
		)
		this.prisma = new PrismaClient()
		this.appBusMain = new AppBusMain(this.logger)
		this.config = config
		this.modules = modules
	}
}