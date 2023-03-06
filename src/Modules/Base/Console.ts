import { Colors, EmbedBuilder, Message, TextChannel } from "discord.js";
import App from "../../App";
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent";
import Module from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";
import { ConsoleLog, Empty } from "../../generated/proto/dipix-bot_pb";
import { footer } from "../../Data/Embeds";
import Logger from "../../types/Logger";

export default new Module(
	"console", async (app: App,  appBusModule: AppBusModuleComponent, logger: Logger) => {
		let channel = await (await app.bot.mainGuild()).channels.fetch(app.config.bot.channels.consoleIntegration) as TextChannel
		let stream = app.minecraft.chatMessageClient.connectConsole(new Empty())
		stream.on("data", async (log: ConsoleLog) => {
			try {
				await channel.send({embeds: [
					new EmbedBuilder()
						.setTimestamp(Date.now())
						.setFooter(footer)
						.setColor(Colors.White)
						.setTitle(log.getRaw())
				]})
			} catch(err) {
				logger.Error(err)	
			}
		})
		return [
			new DiscordEvent("messageCreate", async (msg: Message) => {
				if(!msg.member?.permissions.has("ManageGuild")) return
				await app.minecraft.sendCommand(msg.content)
			})
		]
	}
)
