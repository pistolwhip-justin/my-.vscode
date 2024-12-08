"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runGGShieldCommand = runGGShieldCommand;
/* eslint-disable @typescript-eslint/naming-convention */
const child_process_1 = require("child_process");
const vscode_1 = require("vscode");
const os = require("os");
/**
 * Run ggshield CLI application with specified arguments
 *
 * @param configuration ggshield configuration
 * @param args arguments
 * @returns
 */
function runGGShieldCommand(configuration, args) {
    let env = {
        ...process.env,
        GG_USER_AGENT: "gitguardian-vscode",
    };
    let options = {
        cwd: vscode_1.workspace.workspaceFolders
            ? vscode_1.workspace.workspaceFolders[0].uri.fsPath
            : os.tmpdir(),
        env: env,
        encoding: "utf-8",
        windowsHide: true,
    };
    // If the command is executed in a worskpace, execute ggshield from the root folder so .gitguardian.yaml is used
    if (vscode_1.workspace.workspaceFolders?.length || 0 > 0) {
        options["cwd"] = vscode_1.workspace.workspaceFolders[0].uri.fsPath;
    }
    // if allowSelfSigned is enabled, add the --allow-self-signed flag
    if (configuration.allowSelfSigned) {
        args = ["--allow-self-signed"].concat(args);
    }
    if (configuration.apiUrl && !args.includes("--version")) {
        args.push("--instance", configuration.apiUrl);
    }
    let proc = (0, child_process_1.spawnSync)(configuration.ggshieldPath, args, options);
    return proc;
}
//# sourceMappingURL=run-ggshield.js.map