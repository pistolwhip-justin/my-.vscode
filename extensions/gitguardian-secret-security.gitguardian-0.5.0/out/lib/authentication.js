"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigSource = exports.GGShieldConfigSource = void 0;
exports.updateAuthenticationStatus = updateAuthenticationStatus;
exports.loginGGShield = loginGGShield;
exports.logoutGGShield = logoutGGShield;
const run_ggshield_1 = require("./run-ggshield");
const vscode_1 = require("vscode");
const child_process_1 = require("child_process");
const os = require("os");
const gitguardian_status_bar_1 = require("../gitguardian-interface/gitguardian-status-bar");
var GGShieldConfigSource;
(function (GGShieldConfigSource) {
    GGShieldConfigSource["cmdOption"] = "CMD_OPTION";
    GGShieldConfigSource["dotEnv"] = "DOTENV";
    GGShieldConfigSource["envVar"] = "ENV_VAR";
    GGShieldConfigSource["userConfig"] = "USER_CONFIG";
    GGShieldConfigSource["default"] = "DEFAULT";
})(GGShieldConfigSource || (exports.GGShieldConfigSource = GGShieldConfigSource = {}));
var ConfigSource;
(function (ConfigSource) {
    ConfigSource["extensionSettings"] = "Extension settings";
    ConfigSource["dotEnv"] = ".env file";
    ConfigSource["envVar"] = "Environment variable";
    ConfigSource["instanceGGShieldConfig"] = "ggshield settings or .gitguardian.yaml file";
    ConfigSource["keyGGShieldConfig"] = "ggshield settings";
    ConfigSource["default"] = "Default instance";
    ConfigSource["noKeyFound"] = "No key found";
})(ConfigSource || (exports.ConfigSource = ConfigSource = {}));
function getSource(sourceString, isInstance) {
    switch (sourceString) {
        case GGShieldConfigSource.cmdOption:
            return ConfigSource.extensionSettings;
        case GGShieldConfigSource.dotEnv:
            return ConfigSource.dotEnv;
        case GGShieldConfigSource.envVar:
            return ConfigSource.envVar;
        case GGShieldConfigSource.userConfig:
            if (isInstance) {
                return ConfigSource.instanceGGShieldConfig;
            }
            else {
                return ConfigSource.keyGGShieldConfig;
            }
        case GGShieldConfigSource.default:
            return ConfigSource.default;
    }
    throw new Error(`Unknown source: ${sourceString}`);
}
/**
 * Checks whether the user is authenticated or not,
 * and updates authenticationStatus and the status bar accordingly
 */
async function updateAuthenticationStatus(context, configuration) {
    const proc = (0, run_ggshield_1.runGGShieldCommand)(configuration, ["api-status", "--json"]);
    let authStatus;
    if (proc.stderr.includes("No token is saved for this instance")) {
        authStatus = {
            success: false,
            instance: proc.stderr.split("'")[1],
            keySource: ConfigSource.noKeyFound,
        };
    }
    else if (proc.status !== 0) {
        authStatus = {
            success: false,
            instance: "",
            keySource: ConfigSource.noKeyFound,
        };
    }
    else {
        const output = JSON.parse(proc.stdout);
        authStatus = {
            success: output.status_code === 200,
            instance: output.instance,
            instanceSource: getSource(output.instance_source, true),
            keySource: getSource(output.api_key_source, false),
        };
    }
    await context.workspaceState.update("authenticationStatus", authStatus);
    vscode_1.commands.executeCommand("setContext", "isAuthenticated", authStatus.success);
    if (authStatus.success) {
        (0, gitguardian_status_bar_1.updateStatusBarItem)(gitguardian_status_bar_1.StatusBarStatus.ready);
    }
    else if (authStatus.keySource === ConfigSource.noKeyFound) {
        (0, gitguardian_status_bar_1.updateStatusBarItem)(gitguardian_status_bar_1.StatusBarStatus.unauthenticated);
    }
    else {
        (0, gitguardian_status_bar_1.updateStatusBarItem)(gitguardian_status_bar_1.StatusBarStatus.authFailed);
    }
}
async function loginGGShield(configuration, outputChannel, webviewView, context) {
    const { ggshieldPath } = configuration;
    let options = {
        cwd: vscode_1.workspace.workspaceFolders
            ? vscode_1.workspace.workspaceFolders[0].uri.fsPath
            : os.tmpdir(),
        env: {
            ...process.env,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            GG_USER_AGENT: "gitguardian-vscode",
        },
        windowsHide: true,
    };
    let args = ["auth", "login", "--method=web", "--debug"];
    if (configuration.apiUrl) {
        args.push("--instance", configuration.apiUrl);
    }
    return new Promise((resolve, reject) => {
        const proc = (0, child_process_1.spawn)(ggshieldPath, args, options);
        proc.stdout.on("data", (data) => {
            const urlLine = data.toString().match(/https:\/\/[^\s]+/);
            if (urlLine) {
                const authUrl = urlLine[0];
                webviewView.webview.postMessage({
                    type: "authLink",
                    link: authUrl,
                });
            }
        });
        proc.stderr.on("data", (data) => {
            outputChannel.appendLine(`ggshield stderr: ${data.toString()}`);
        });
        proc.on("close", async (code) => {
            if (code !== 0) {
                outputChannel.appendLine(`ggshield process exited with code ${code}`);
                reject(new Error(`ggshield process exited with code ${code}`));
            }
            else {
                outputChannel.appendLine("ggshield login completed successfully");
                updateAuthenticationStatus(context, configuration);
                resolve();
            }
        });
        proc.on("error", (err) => {
            outputChannel.appendLine(`ggshield process error: ${err.message}`);
            reject(err);
        });
    });
}
async function logoutGGShield(configuration, context) {
    let cmd = ["auth", "logout"];
    const authStatus = context.workspaceState.get("authenticationStatus");
    if (authStatus?.success === false &&
        authStatus.keySource === ConfigSource.keyGGShieldConfig) {
        cmd.push("--no-revoke");
    }
    (0, run_ggshield_1.runGGShieldCommand)(configuration, cmd);
    await updateAuthenticationStatus(context, configuration);
}
//# sourceMappingURL=authentication.js.map