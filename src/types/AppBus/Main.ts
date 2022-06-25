import { EventEmitter } from "stream";
import App from "../../App";

export default class AppBusMain extends EventEmitter  {
	private messages = {} as {[key: string]: {recipient: string, data: any}}
	private app: App
	public send(sender: string, recipient: string, data: any) {
		let messageId = `${recipient}:${Date.now()}`
		let message = {recipient, data, id: messageId}
		this.emit(recipient, message)
	}
	constructor(app: App) {
		super()
		this.app = app
	}
}