import { Guild } from "discord.js";
import App from "../../App";
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent";
import Logger from "../../types/Logger";
import Module from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";
import SharedModules from "."
import { UploadCommandType } from "../../types/TypeAlias";
import { ErrorEmbed } from "../../Data/Embeds";

export default new Module(
	'registration',
	
	(app: App, appBusModule: AppBusModuleComponent, logger: Logger) => {
		let commands = [] as UploadCommandType[] 	
		return [
			new DiscordEvent("guildCreate", async (guild: Guild) => {
				(await guild.fetchOwner()).send({embeds: [ErrorEmbed("Эта функция не работает")]})
			}),
			new DiscordEvent("ready", () => {
				SharedModules.map(async (m: Module) => {
					appBusModule.send(m.name, "Upload commands")

				})
			})
		]
	}
)