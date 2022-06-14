import Discord from "discord.js"

export default class ModuleEvent {
	public readonly type: "message" | "discord" | "servertap"
	constructor(type: "message" | "discord" | "servertap") {
		this.type = type
	}
}