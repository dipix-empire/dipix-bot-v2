import { EventEmitter } from "stream";
import App from "../../App";

export default class AppBusMain extends EventEmitter  {
	private messages = {} as {[key: string]: {recipient: string, data: any}}
	private app: App
	public send(sender: string, recipient: string, data: any) {
		let messageId = `${recipient}:${Date.now()}`
		let message = {recipient, data, id: messageId}
		this.messages[messageId]= message
		setTimeout(() => {
			if (messageId in this.messages)
				delete this.messages[messageId]
		}, this.app.config.bus.messageTimeout)
		this.emit(recipient, message)
	}
	public getMessages(recipient: string) {
		let keys = Object.keys(this.messages).filter(k => k.split(":")[0] == recipient)
		let res = keys.map(k => this.messages[k])
		keys.forEach(e => {
			delete this.messages[e]
		})
		return res
	}
	public deleteMessage(messageId: string) {
		delete this.messages[messageId]
	}
	constructor(app: App) {
		super()
		this.app = app
	}
}