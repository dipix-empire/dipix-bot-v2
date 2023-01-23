export default class Logger {

	public readonly template = (level: string, message: string) =>
		`[${new Date().toLocaleTimeString()} ${level.toUpperCase()} (${this.type ? `${this.type[0].toUpperCase()}/` : ""}${this.source.toUpperCase()})]: ${message}`

	public Error(err: Error | unknown, msg?: string) {
		if (this.level < 0) return
		console.error(this.template("ERRO", msg || "An Error have been catched:"))
		console.error(err)
	}
	public Warn(msg: string) {
		if (this.level < 1) return
		console.log(this.template("WARN", msg))
	}
	public Log(msg: string) {
		if (this.level < 2) return
		console.log(this.template("INFO", msg))
	}
	public Verbose(msg: string) {
		if (this.level < 3) return
		console.log(this.template("VERB", msg))
	}
	public VerboseError(err: Error | unknown, msg?: string,) {
		if (this.level < 3) return
		console.error(this.template("VERR", msg || "Unimportant exception have been catched: "))
		console.error(err)
	}
	public Debug(msg: string, ...data: any) {
		if (this.level < 4) return
		console.log(this.template("DEBUG", msg))
		if (data.length > 0) console.log(...data)
	}
	public getChild(name: string) {
		return new Logger(`${this.source}/${name}`, this.level,"module")
	}
	constructor(
		public readonly source: string,
		public readonly level: logLevel,
		public readonly type?: "client" | "module"
	) { }
}
export enum logLevel {
	ERROR = 0,
	WARN = 1,
	INFO = 2,
	VERBOSE = 3,
	DEBUG = 4
}
