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
	private commands: Array<SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder> = []
	public start(guildId: string) {
		super.once('ready', async () => {
			this.logger.Log(`Started Discord client`)
			this.logger.Log(`Discord username: ${this.user?.tag}`)
			this.logger.Log(`Guild name: ${this.guilds.cache.get(guildId)} (${guildId})`)
			await this.discordRest.put(Routes.applicationGuildCommands(this.clientId, guildId), {body: this.commands.map(cmd => cmd.toJSON())})
		})
		super.login(this.discordToken)
	}
	
	public uploadCommand(slashCommand: (slashCommand: SlashCommandBuilder) => SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder) {
		let command = slashCommand(new SlashCommandBuilder())
		this.commands.push(command)
		return `Added command '${command.name}' to upload`
	}

	constructor(token:string, clientId: string, options: ClientOptions, logger: Logger) {
		super(options)
		this.discordToken = token
		this.discordRest = new REST({version:'9'}).setToken(token)
		this.clientId = clientId
		this.logger = logger
	}
}