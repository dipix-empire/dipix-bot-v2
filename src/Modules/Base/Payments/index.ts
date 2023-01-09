import App from "../../../App";
import AppBusModuleComponent from "../../../types/AppBus/ModuleComponent";
import Logger from "../../../types/Logger";
import Module from "../../../types/Module";
import scheduler from "./scheduler";


export default new Module(
	"payments",
	(app: App, appBusModuleComponent: AppBusModuleComponent, logger: Logger) => {

		scheduler(app, logger)

		return []
	}
)

// try {
// 	logger.Log(`Updating user subscription (${uid})...`)
// 	await app.prisma.user.update({
// 		where: {
// 			id: s.id,
// 		},
// 		data: {
// 			balance: {
// 				decrement: getCost(s.plan)
// 			}
// 		}
// 	})
// 	await app.prisma.subscription.create({
// 		data: {
// 			userId: s.id,
// 			started: new Date(s.start.getTime()),
// 			ends: new Date(s.start.getTime() + 1000 * 60 * 60 * 24 * 30),
// 			plan: s.plan,
// 			status: "active"
// 		}
// 	})
// } catch(err) {
// 	logger.Error(err, `Error while proceeding user subscription (${uid}):`)
// }
