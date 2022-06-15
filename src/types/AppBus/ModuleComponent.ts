import AppBusMain from "./Main";

export default class AppBusModuleComponent {
	private readonly appBusMain: AppBusMain
	private readonly moduleName: string

	public send(recipient: string, data: any) {
		this.appBusMain.send(this.moduleName, recipient, data)
	}
	public onMessage(callback: (msg: any) => any) {
		this.appBusMain.on(this.moduleName, async (msg: any) => {
			this.appBusMain.deleteMessage(msg.id)
			await callback(msg)
		})
	} 
	public getMessages() {
		return this.appBusMain.getMessages(this.moduleName)
	}

	constructor(appBusMain: AppBusMain, moduleName: string) {
		this.appBusMain = appBusMain
		this.moduleName = moduleName
	}
}