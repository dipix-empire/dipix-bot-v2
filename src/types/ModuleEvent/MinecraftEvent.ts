import ModuleEvent from ".";

export default class MinecraftEvent extends ModuleEvent {
	public readonly event: string
	public readonly listener: (...data: any[]) => void | Promise<void>
	constructor(event: string, listener: (...data: any[]) => void | Promise<void>) {
		super("servertap")
		this.event = event
		this.listener = listener
	}
}