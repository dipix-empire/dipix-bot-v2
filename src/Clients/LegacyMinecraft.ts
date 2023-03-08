import { Axios } from "axios";
import { EventEmitter } from "stream";
import WebSocket from "ws"
import express, {Request, Response} from "express"
import Logger from "../types/Logger";

export default class LegacyMinecraftServerAPI extends EventEmitter {
	private readonly token: string
	private readonly wsuri: string
	private readonly httpuri: string
	private readonly port: number
	private readonly api: express.Express
	private readonly logger: Logger
	private readonly axios: Axios
	private consoleBuffer = [] as string[]
	private ws: WebSocket | null = null
	private lastTimeout: number = 0
	
	public sendToConsole(message: string) {
		if (this.ws == null) this.consoleBuffer.push(message)
		else this.ws.send(message)
	}

	public start() {
		this.api.get('/command/:command', (req: Request, res: Response) => {
			this.logger.Debug("", req)
			this.emit("command", {
				command: req.params.command,
				player: req.query.user,
				args: req.query.args
			})
		})
		this.api.listen(this.port, () => this.logger.Log(`Started Minecraft API server on port ${this.port}`))
		this.connect()
	}
	private reconnect() {
		if (this.lastTimeout <= 30_000) 
			this.lastTimeout += 5_000
		this.logger.Warn(`Cannot connect to servertap, reconnecting in ${this.lastTimeout/1000} seconds`)
		this.connect()
	}
	private async waitForTimeout() {
		return new Promise((resolve, reject) => setTimeout(resolve, this.lastTimeout))
	}
	private async connect() {
		await this.waitForTimeout()
		try {
			try {
				await this.axios.get(this.httpuri + '/ping')
			} catch(err) {
				this.logger.VerboseError(err)
				throw new Error("Unable to connect to Minecraft server.")
			}
			this.emit("connecting")
			// await axios.get(a)
			this.ws = new WebSocket(this.wsuri, [], {
				headers: {
					"Cookie":`x-servertap-key=${this.token}`
				}
			})
			this.ws.on("open", () => {
				this.lastTimeout = 0
				this.logger.Log("Connected to server via servertap:ws")
				for (let i = 0; i < this.consoleBuffer.length; i++) {
					this.ws?.send(this.consoleBuffer.shift() || "")
				}
				this.emit("open")
			})
			this.ws.on("message", (msg: string) => {
				let data = JSON.parse(msg)
				this.emit("newline", {
					msg: data.message,
					t: data.timestampMillis,
					l: data.level
				})
			})
			this.ws.on('error', (err) => {
				this.logger.Error(err)
			})
		} catch(err) {
			this.logger.Error(err)
			this.reconnect()
		}
	}

	constructor(token: string, wsuri: string, httpuri: string, port: number, logger: Logger) {
		super()
		this.token = token
		this.wsuri = wsuri
		this.httpuri = httpuri
		this.port = port
		this.api = express()
		this.api.use(express.json())
		this.logger = logger
		this.axios = new Axios({
			headers: {
				'key': token
			}
		})
		// this.connect()
	}
}

export interface newLineData {
	msg: string
	ts: number
	l: string
}
