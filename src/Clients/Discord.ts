import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Client, ClientOptions } from "discord.js";
import Logger from "../types/Logger";

export default class Discord extends Client {
	
	private readonly discordToken: string
	private readonly discordRest: REST
	private readonly clientId: string
	private readonly logger: Logger
	private commands: {[key: string]: Array<Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">|SlashCommandSubcommandsOnlyBuilder>} = {}
	public start(guildId: string) {
		super.once('ready', async () => {
			this.logger.Log(`Started Discord client`)
			this.logger.Log(`Discord username: ${this.user?.tag}`)
			this.logger.Log(`Guild name: ${this.guilds.cache.get(guildId)} (${guildId})`)
			await this.pushCommands(guildId)
		})
		super.login(this.discordToken)
	}
	
	public uploadCommand(guildId: string, slashCommand: (slashCommand: SlashCommandBuilder) => Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> | SlashCommandSubcommandsOnlyBuilder) {
		let command = slashCommand(new SlashCommandBuilder())
		this.commands[guildId].push(command)
		return `Added command '${command.name}' to upload (guild: ${guildId})`
	}
	public async pushCommands(guildId: string) {
		await this.discordRest.put(Routes.applicationGuildCommands(this.clientId, guildId), {body: this.commands[guildId].map(cmd => cmd.toJSON())})
		this.logger.Verbose(`Uploaded commands to guild ${super.guilds.cache.get(guildId)}`)
	}

	constructor(token:string, clientId: string, options: ClientOptions, logger: Logger) {
		super(options)
		this.discordToken = token
		this.discordRest = new REST({version:'9'}).setToken(token)
		this.clientId = clientId
		this.logger = logger
	}
}