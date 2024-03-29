import Discord from "./Clients/Discord"
import AppBusMain from "./types/AppBus/Main"
import AppBusModuleComponent from "./types/AppBus/ModuleComponent"
import Config from "./types/Config"
import ModuleBuilder, { Module } from "./types/Module"
import DiscordEvent from "./types/ModuleEvent/DiscordEvent"
import MinecraftEvent from "./types/ModuleEvent/MinecraftEvent"
import Secrets from "./types/Secrets"
// import LegacyMinecraft from "./Clients/LegacyMinecraft"
import { PrismaClient } from "@prisma/client"
import Logger from "./types/Logger"
import REST from "./Clients/Rest"
import Minecraft from "./Clients/Minecraft"
import Registry from "./Clients/Registry"

export default class App {
	public readonly bot: Discord
	public readonly minecraft: Minecraft
	public readonly rest: REST
	public readonly prisma: PrismaClient
	public readonly config: Config
	private readonly logger: Logger
	private appBusMain: AppBusMain
	private readonly modules: ModuleBuilder[]
	private readonly registry: Registry

	public async start() {
		await this.prisma.$connect()
		await this.registry.start()
		this.modules.forEach(async m => {
			let eCount = 0
			let logger = new Logger(m.name, this.config.logLevel, "module");
			let module = await m.build(new Module(this, new AppBusModuleComponent(this.appBusMain, m.name, logger), logger, []))
			module.getEvents().forEach(e => {
				switch (e.type) {
					case "discord":
						let discordEvent = e as DiscordEvent<any>
						this.bot.on(discordEvent.event, discordEvent.listener)
						break
					case "minecraft":
						let minecraftEvent = e as MinecraftEvent<any>
						this.minecraft.on(minecraftEvent.event, minecraftEvent.listener)
						break
					default:
						eCount--
						break
				}
				eCount++
			})
			logger.Log(`Enabled module '${m.name}' with ${eCount} events.`)

		})
		if (this.modules.length == 0) this.logger.Warn("No modules were provided. Check index.ts or config.ts")
		this.bot.start(this)
		this.rest.start()
		this.minecraft.start()
		this.logger.Log("App started.")
		return this
	}

	public async stop() {
		this.logger.Log("Stopping the App...")
		await this.minecraft.stop()
	}

	constructor(config: Config, secrets: Secrets, modules: ModuleBuilder[]) {
		this.logger = new Logger("app", config.logLevel)
		this.logger.Log("Building app component...")
		this.bot = new Discord(
			secrets.discord_token,
			config.bot.clientId,
			{
				intents: config.bot.intents
			},
			new Logger("Bot", config.logLevel, "client"),
			config.bot.guildId
		)
		this.minecraft = new Minecraft(
			config.minecraft.port,
			new Logger("Minecraft", config.logLevel, "client"),
			config.modules.chat.minecraftSendPattern,
			{
				host: config.minecraft.rcon.host,
				port: config.minecraft.rcon.port,
				timeout: config.minecraft.rcon.timeout,
				password: secrets.rcon_password
			}
		)
		this.rest = new REST(config.rest.port, new Logger("Rest", config.logLevel, "client"))
		this.prisma = new PrismaClient()
		this.registry = new Registry(this)
		this.appBusMain = new AppBusMain(this.logger)
		this.config = config
		this.modules = modules
	}
}
