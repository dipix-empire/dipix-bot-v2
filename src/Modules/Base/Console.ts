import { Message, TextChannel } from "discord.js";
import App from "../../App";
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent";
import ModuleBuilder, { Module } from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";
import Logger from "../../types/Logger";
import MinecraftEvent from "../../types/ModuleEvent/MinecraftEvent";

export default new ModuleBuilder(
	"console", async (module: Module) => {
		let channelId = module.app.config.bot.channels.consoleIntegration
		module.addEvent(
			new DiscordEvent("messageCreate", async (msg: Message) => {
				if(msg.channel.id != channelId) return
				if(!msg.member?.permissions.has("ManageGuild")) return
				if(msg.content.startsWith("#")) return
				module.app.minecraft.sendCommand(msg.content)
			}),
			new MinecraftEvent("log", async (log: {raw: string}) => {
				let channel = await (await module.app.bot.mainGuild()).channels.fetch(channelId) as TextChannel
				await channel.send("`" + log.raw + "`")
			})
		)
		return module
	}
)
