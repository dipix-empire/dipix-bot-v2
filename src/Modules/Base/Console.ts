import { CommandInteraction, Interaction, Message, PermissionFlagsBits, SlashCommandBuilder, SlashCommandStringOption, TextChannel } from "discord.js";
import App from "../../App";
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent";
import ModuleBuilder, { Module } from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";
import Logger from "../../types/Logger";
import MinecraftEvent from "../../types/ModuleEvent/MinecraftEvent";
import { ErrorEmbed, ProcessingEmbed, SuccesfulEmbed } from "../../Data/Embeds";

export default new ModuleBuilder(
	"console", async (module: Module) => {
		// let channelId = module.app.config.bot.channels.consoleIntegration
		module.app.bot.uploadSlashCommand("main", (slashCommand: SlashCommandBuilder) => slashCommand
			.setName("minecraft")
			.setDescription("Execute command on server.")
			.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
			.addStringOption((input: SlashCommandStringOption) => input
				.setName("command")
				.setDescription("Command to execute")
				.setRequired(true)
				.setMaxLength(1446)
			)
		)
		module.addEvent(
			new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
				if (!interaction.isChatInputCommand() || interaction.commandName != "minecraft") return
				try {
					await interaction.deferReply({ ephemeral: true })
					let command = interaction.options.getString("command", true)
					await interaction.editReply({embeds:[ProcessingEmbed("Please, wait", "Executing command...")]})
					let result = await module.app.minecraft.sendCommand(command)
					await interaction.editReply({embeds:[SuccesfulEmbed(result ? "`"+result+"`" : "Command does not returned anything.", `Command executed.`)]})
				} catch (err) {
					interaction.replied ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : await interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
				}
			})
			// new DiscordEvent("messageCreate", async (msg: Message) => {
			// 	if(msg.channel.id != channelId) return
			// 	if(!msg.member?.permissions.has("ManageGuild")) return
			// 	if(msg.content.startsWith("#")) return
			// 	module.app.minecraft.sendCommand(msg.content)
			// }),
			// new MinecraftEvent("log", async (log: {raw: string}) => {
			// 	let channel = await (await module.app.bot.mainGuild()).channels.fetch(channelId) as TextChannel
			// 	await channel.send("`" + log.raw + "`")
			// })
		)
		return module
	}
)
