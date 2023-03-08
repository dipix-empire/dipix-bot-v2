import Logger from "../Logger";
import AppBusMain from "./Main";
import Message from "./Message";

export default class AppBusModuleComponent {
	private readonly appBusMain: AppBusMain
	private readonly moduleName: string
	private readonly logger: Logger

	public send(recipient: string, data: any) {
		return this.appBusMain.send(this.moduleName, recipient, data)
	}
	public onMessage(callback: (msg: Message) => any) {
		this.appBusMain.on(this.moduleName, callback)
		// this.logger.Debug(`Message listeners: ${this.appBusMain.listenerCount(this.moduleName)}`, this.appBusMain.listeners(this.moduleName))
	}
	public deleteCallback(callback: (msg: any) => any) {
		this.appBusMain.removeListener(this.moduleName, callback)
	}
	constructor(appBusMain: AppBusMain, moduleName: string, logger: Logger) {
		this.appBusMain = appBusMain
		this.moduleName = moduleName,
		this.logger = logger
	}
}