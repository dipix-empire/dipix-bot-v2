import App from "./src/App";
import config from "./config"
import secrets from "./secrets";
import Modules from "./src/Modules";

(async () => await new App(config, secrets, Modules).start())()
