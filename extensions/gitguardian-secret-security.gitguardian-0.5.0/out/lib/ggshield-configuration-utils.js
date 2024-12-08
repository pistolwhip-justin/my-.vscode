"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfiguration = getConfiguration;
const ggshield_resolver_utils_1 = require("./ggshield-resolver-utils");
const vscode_1 = require("vscode");
const os = require("os");
const ggshield_configuration_1 = require("./ggshield-configuration");
/**
 * Retrieve configuration from settings
 *
 * TODO: Check with Mathieu if this behaviour is expected
 * @returns {GGShieldConfiguration} from the extension settings
 */
function getConfiguration(context) {
    const config = vscode_1.workspace.getConfiguration("gitguardian");
    const ggshieldPath = config.get("GGShieldPath");
    const apiUrl = config.get("apiUrl");
    const allowSelfSigned = config.get("allowSelfSigned", false);
    return new ggshield_configuration_1.GGShieldConfiguration((0, ggshield_resolver_utils_1.getBinaryAbsolutePath)(os.platform(), os.arch(), context), apiUrl, allowSelfSigned || false);
}
//# sourceMappingURL=ggshield-configuration-utils.js.map