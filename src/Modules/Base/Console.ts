import { Message, TextChannel } from "discord.js";
import App from "../../App";
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent";
import ModuleBuilder from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";
import Logger from "../../types/Logger";
import MinecraftEvent from "../../types/ModuleEvent/MinecraftEvent";

export default new ModuleBuilder(
	"console", async (app: App,  appBusModule: AppBusModuleComponent, logger: Logger) => {
		let channelId = app.config.bot.channels.consoleIntegration
		return [
			new DiscordEvent("messageCreate", async (msg: Message) => {
				if(msg.channel.id != channelId) return
				if(!msg.member?.permissions.has("ManageGuild")) return
				if(msg.content.startsWith("#")) return
				app.minecraft.sendCommand(msg.content)
			}),
			new MinecraftEvent("log", async (log: {raw: string}) => {
				let channel = await (await app.bot.mainGuild()).channels.fetch(channelId) as TextChannel
				await channel.send("`" + log.raw + "`")
			})
		]
	}
)
