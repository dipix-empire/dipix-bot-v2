import Discord from "discord.js"

export default class ModuleEvent {
	public readonly type: "message" | "discord" | "minecraft"
	constructor(type: "message" | "discord" | "minecraft") {
		this.type = type
	}
}
