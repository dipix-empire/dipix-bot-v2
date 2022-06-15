import { EventEmitter } from "stream";
import WebSocket from "ws"
export default class ServerTap extends EventEmitter {
	private readonly token: string
	private readonly wsuri: string
	private ws: WebSocket | null = null
	private lastTimeout: number = 0

	public sendToConsole(message: string) {
		this.ws?.send(message)
	}

	private reconnect() {
		if (this.lastTimeout <= 30_000) 
			this.lastTimeout += 5_000
		setTimeout(this.connect, this.lastTimeout)
	}
	private connect() {
		try {
			this.ws = new WebSocket(this.wsuri, [], {
				headers: {
					"Cookie":`x-servertap-key=${this.token}`
				}
			})
			this.ws.on("open", () => {
				this.lastTimeout = 0
				console.log("Connected to server via servertap:ws")
			})
			this.ws.on("message", (msg: string) => {
				let data = JSON.parse(msg) as newLineData
				this.emit("newline", data)
			})
			this.ws.on('error', (err) => {
				console.log(err)
			})
		} catch(err) {
			console.log(err)
			this.reconnect()
		}
	}

	constructor(token: string, wsuri: string) {
		super()
		this.token = token
		this.wsuri = wsuri
		this.connect()
	}
}

export interface newLineData {
	msg: string
	ts: number
	l: string
}