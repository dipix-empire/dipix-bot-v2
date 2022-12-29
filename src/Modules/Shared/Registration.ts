import { Guild } from "discord.js";
import App from "../../App";
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent";
import Logger from "../../types/Logger";
import Module from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";
import SharedModules from "."
import { UploadCommandType } from "../../types/TypeAlias";
import { InfoEmbed } from "../../Data/Embeds";
import Message from "../../types/AppBus/Message";
import Conversation from "../../types/Conversation";

export default new Module(
	'registration',

	(app: App, appBusModule: AppBusModuleComponent, logger: Logger) => {
		let commands = [] as UploadCommandType[]
		appBusModule.onMessage((msg: Message) => {
			if (msg.sender == "conversation") {
				if (msg.data.code != 0) return logger.Error(new Error(msg.data))
				let conv = msg.data.coversation as Conversation
				let convData = conv.questions.map((q, k) => ({
					question: q.question,
					answer: conv.answers[k]
				}))
				console.log(msg.data)
			}
		})
		return [
			new DiscordEvent("guildCreate", async (guild: Guild) => {
				app.bot.pushCommands(guild.id);
				(await guild.fetchOwner()).send({ embeds: [InfoEmbed("Для регистрации сервера введите /registartion")] })
			}),
			new DiscordEvent("guildDelete", async (guild: Guild) => {
				//TODO:COUNTRY AND ORGANIZATION DELETION
			})
		]
	}
)
