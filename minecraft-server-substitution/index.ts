// import { ChatMessageServiceService, IChatMessageServiceServer, IStatsServer, StatsService } from "../src/generated/proto/dipix-bot_grpc_pb";
import { ClientDuplexStream, Server, ServerCredentials, ServerDuplexStream, ServerUnaryCall, ServerWritableStream, credentials, sendUnaryData } from "@grpc/grpc-js"
import { ChatMessage, ConsoleCommand, ConsoleLog, Empty, PlayerList } from "../src/generated/proto/dipix-bot_pb";
import { EventEmitter } from "events";
import { BotToMinecraftService, IBotToMinecraftServer, MinecraftToBotClient } from "../src/generated/proto/dipix-bot_grpc_pb";

let server = new Server()
let ee = new EventEmitter()
let BotToMinecraftServer: IBotToMinecraftServer = {
	getPlayers: (call: ServerUnaryCall<Empty, PlayerList>, callback: sendUnaryData<PlayerList>) => {
		console.log("[STATS SERVER] getPlayers call...")
		callback(null, new PlayerList().setPlayersList(["a", "b", "c"]))
	},
	reconnect: (call: ServerUnaryCall<Empty, Empty>, callback: sendUnaryData<Empty>) => {
		ee.emit("reconnect")
		console.log("Reconnect message recieved.")
		connect()
		callback(null, new Empty())
	}
}

let client: MinecraftToBotClient = new MinecraftToBotClient("localhost:12607", credentials.createInsecure())

let msgStream: ClientDuplexStream<ChatMessage, ChatMessage> | undefined | null 
let consoleStream: ClientDuplexStream<ConsoleLog, ConsoleCommand> | undefined | null

server.addService(BotToMinecraftService, BotToMinecraftServer)
server.bindAsync('0.0.0.0:12608', ServerCredentials.createInsecure(), () => {
	server.start()
	console.log("Started server on port 12608")
})
connect()

function connect() {
	msgStream?.destroy()
	consoleStream?.destroy()
	msgStream = client.messagePool()
	consoleStream = client.consolePool()
	msgStream.on("data", (data: ChatMessage) => {
		console.log(`CHAT: [${data.getSender()}] ${data.getContent()}`)
		msgStream?.write(data)
	})
	consoleStream.on("data", (data: ConsoleCommand) => {
		console.log(`CMD: /${data.getCmd()}`)
		consoleStream?.write(new ConsoleLog().setRaw(`/${data.getCmd()} issued remotely.`))
	})
}
