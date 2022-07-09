import { EventEmitter } from "stream";
import {v4} from "uuid"
import Message from "./Message";
import Logger from "../Logger";
export default class AppBusMain extends EventEmitter  {
	private logger: Logger
	public send(sender: string, recipient: string, data: any) {
		let uuid = v4()
		let message = {
			data, 
			sender, 
			uuid,
			recipient
		} as Message
		this.logger.Debug(`[MESSAGE] from ${sender} to ${recipient} (uuid: ${message.uuid}); data:`, data)
		this.emit(recipient, message)
		return uuid
	}
	constructor(logger: Logger) {
		super()
		this.logger = logger
	}
}