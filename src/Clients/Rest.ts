import express, { Request, Response } from "express"
import Logger from "../types/Logger"
import { randomUUID } from "crypto"
import { Axios } from "axios"

export default class REST {

	private readonly api: express.Application
	private innerKey = randomUUID()
	private innerRequester: Axios = new Axios({
		headers: {
			authorization: this.innerKey,
			'Content-Type': 'application/json'
		},
		baseURL: `http://localhost:${this.port}/inner/`
	})

	public addRoute(path: string, type: "get" | "post" | "put" | "delete", handler: (req: Request, res: Response) => any) {
		this.api[type](path, handler)
	}
	public start() {
		this.api.listen(this.port, () => {
			this.logger.Log(`REST server started at ${this.port}`)
		})
	}
	public inner(path: string, callback: (data: any) => { status: number } & any) {
		this.api.post(`/inner${path}`, async (req: Request, res: Response) => {
			if (req.headers.authorization != this.innerKey) res.status(401).json({})
			let data = req.body
			let result = await callback(data)
			res.status(result.status).json(result)
		})
	}
	public async send(path: string, data: any): Promise<{ status: number } & any> {
		return (await this.innerRequester.post(`${path}`, JSON.stringify(data))).data
	}
	constructor(
		private readonly port: number,
		private readonly logger: Logger
	) {
		this.api = express()
		this.api.use(express.json())
	}
}
