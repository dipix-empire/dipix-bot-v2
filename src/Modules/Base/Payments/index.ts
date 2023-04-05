import App from "../../../App";
import AppBusModuleComponent from "../../../types/AppBus/ModuleComponent";
import Logger from "../../../types/Logger";
import ModuleBuilder from "../../../types/Module";
import donate from "./donate";
import manage from "./manage";
import profile from "./profile";
import promoManager from "./promo";

export default new ModuleBuilder(
	"payments",
	(app: App, appBusModuleComponent: AppBusModuleComponent, logger: Logger) => {
		return [
			profile(app, logger), 
			donate(app, logger),
			...manage(app, logger),
			...promoManager(app, logger)
		]
	}
)
