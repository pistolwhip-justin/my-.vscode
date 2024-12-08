"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GGShieldResolver = void 0;
const run_ggshield_1 = require("./run-ggshield");
const vscode_1 = require("vscode");
class GGShieldResolver {
    constructor(channel, context, configuration) {
        this.channel = channel;
        this.context = context;
        this.configuration = configuration;
    }
    /**
     * Ensures the availability of ggshield by determining the executable path.
     *
     * The function performs the following checks in order:
     *  1. Checks if a custom path is configured in the settings and uses it.
     *  2. Else, falls back to using the standalone version bundled with the extension.
     *
     * @returns {void} A promise that resolves once the `ggshield` path is determined.
     */
    checkGGShieldConfiguration() {
        try {
            this.testConfiguration(this.configuration);
            this.channel.appendLine(`Using ggshield at: ${this.configuration.ggshieldPath}, to change this go to settings.`);
            return;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.channel.appendLine(`${errorMessage}`);
            vscode_1.window.showErrorMessage(`${errorMessage}`);
            throw error;
        }
    }
    /**
     * Tries the configuration from settings.
     *
     * @returns {void} A promise that resolves if the configuration is valid.
     */
    testConfiguration(configuration) {
        // Check if the ggshield path is valid
        let proc = (0, run_ggshield_1.runGGShieldCommand)(configuration, ["--version"]);
        if (proc.status !== 0) {
            vscode_1.window.showErrorMessage(`GitGuardian: Invalid ggshield path. ${proc.stderr}`);
            throw new Error(proc.stderr);
        }
    }
}
exports.GGShieldResolver = GGShieldResolver;
//# sourceMappingURL=ggshield-resolver.js.map