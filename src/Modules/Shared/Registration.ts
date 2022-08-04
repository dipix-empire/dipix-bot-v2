import { Guild } from "discord.js";
import App from "../../App";
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent";
import Logger from "../../types/Logger";
import Module from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";
import SharedModules from "."

export default new Module(
	'registration',
	
	(app: App, appBusModule: AppBusModuleComponent, logger: Logger) => {
		
		return [
			new DiscordEvent("guildCreate", (guild: Guild) => {
				
			}),
			new DiscordEvent("ready", () => {
				SharedModules.map(async (m: Module) => {
					appBusModule.send(m.name, "Upload commands")
					
				})
			})
		]
	}
)