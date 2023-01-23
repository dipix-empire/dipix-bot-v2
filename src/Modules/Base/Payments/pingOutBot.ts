import { Axios } from "axios";
import Task from "../../../types/Task";

export default (axios: Axios) => new Task(
	"PingBot",
	async () => {
		try {
			await axios.get("/api/ping")
		} catch (err) {
			// logger.Error(err)
			throw new Error("Unable to connect to Payments Bot")
		}
	}
)
