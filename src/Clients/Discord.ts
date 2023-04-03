import { SlashCommandBuilder, ContextMenuCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Client, ClientOptions, Guild } from "discord.js";
import App from "../App";
import Logger from "../types/Logger";
import { UploadCommandType, UploadContextMenuCommandType, UploadSlashCommandType } from "../types/TypeAlias";

export default class Discord extends Client {

	private readonly discordToken: string
	private readonly discordRest: REST
	private readonly clientId: string
	private readonly logger: Logger
	private mainGuildCache: Guild | null | undefined
	private commands: { main: Array<UploadCommandType>, shared: Array<UploadCommandType> } = { main: [], shared: [] }
	public async mainGuild() {
		if (!this.mainGuildCache)
			this.mainGuildCache = await this.guilds.fetch(this.guildId)
		setTimeout(() => { delete this.mainGuildCache }, 1 * 60 * 1000)
		return this.mainGuildCache
	}
	public start(app: App) {
		super.once('ready', async () => {
			this.logger.Log(`Started Discord client`)
			this.logger.Log(`Discord username: ${this.user?.tag}`)
			this.logger.Log(`Guild name: ${this.guilds.cache.get(this.guildId)?.name} (${this.guildId})`)
			await this.pushCommands("main");
			(await app.prisma.country.findMany()).map(c => {
				this.pushCommands(c.discord)
			})
		})
		super.login(this.discordToken)
	}
	/**
	 * @deprecated
	 */
	public uploadCommand(guildId: "main" | "shared", slashCommand: (slashCommand: SlashCommandBuilder) => UploadSlashCommandType) {
		return this.uploadSlashCommand(guildId, slashCommand)
	}
	public uploadSlashCommand(guildId: "main" | "shared", slashCommand: (slashCommand: SlashCommandBuilder) => UploadSlashCommandType) {
		let command = slashCommand(new SlashCommandBuilder())
		if (this.commands[guildId] == null) this.commands[guildId] = []
		this.commands[guildId].push(command)
		return `Added command '${command.name}' to upload (guild: ${guildId})`
	}
	public uploadContextMenuCommand(guildId: "main" | "shared", contextMenuCommand: (contextMenuCommand: ContextMenuCommandBuilder) => UploadContextMenuCommandType) {
		let command = contextMenuCommand(new ContextMenuCommandBuilder())
		if (this.commands[guildId] == null) this.commands[guildId] = []
		this.commands[guildId].push(command)
		return `Added command '${command.name}' to upload (guild: ${guildId})`
	}
	public async pushCommands(guildId: "main" | string) {
		await this.discordRest.put(
			Routes.applicationGuildCommands(this.clientId, guildId == "main" ? this.guildId : guildId),
			{ body: this.commands[guildId != "main" ? "shared" : "main"].map(cmd => cmd.toJSON()) }
		)
		this.logger.Verbose(`Uploaded commands to guild ${this.guilds.cache.get(guildId)}`)
	}

	constructor(
		token: string,
		clientId: string,
		options: ClientOptions,
		logger: Logger,
		private readonly guildId: string
	) {
		super(options)
		super.setMaxListeners(20)
		this.discordToken = token
		this.discordRest = new REST({ version: '9' }).setToken(token)
		this.clientId = clientId
		this.logger = logger
	}
}
