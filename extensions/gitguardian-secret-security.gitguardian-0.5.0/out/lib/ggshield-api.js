"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diagnosticCollection = void 0;
exports.showAPIQuota = showAPIQuota;
exports.getAPIquota = getAPIquota;
exports.ignoreLastFound = ignoreLastFound;
exports.ignoreSecret = ignoreSecret;
exports.createDiagnosticCollection = createDiagnosticCollection;
exports.cleanUpFileDiagnostics = cleanUpFileDiagnostics;
exports.scanFile = scanFile;
/* eslint-disable @typescript-eslint/naming-convention */
const vscode_1 = require("vscode");
const utils_1 = require("../utils");
const run_ggshield_1 = require("./run-ggshield");
const gitguardian_status_bar_1 = require("../gitguardian-interface/gitguardian-status-bar");
const ggshield_results_parser_1 = require("./ggshield-results-parser");
/**
 * Display API quota
 *
 * Show error message on failure
 */
function showAPIQuota(configuration) {
    if (!configuration) {
        vscode_1.window.showErrorMessage("ggshield: Missing settings");
        return;
    }
    const proc = (0, run_ggshield_1.runGGShieldCommand)(configuration, ["quota"]);
    if (proc.stderr.length > 0) {
        vscode_1.window.showErrorMessage(`ggshield: ${proc.stderr}`);
    }
    if (proc.stdout.length > 0) {
        vscode_1.window.showInformationMessage(`ggshield: ${proc.stdout}`);
    }
}
function getAPIquota(configuration) {
    try {
        const proc = (0, run_ggshield_1.runGGShieldCommand)(configuration, ["quota", "--json"]);
        return JSON.parse(proc.stdout).remaining;
    }
    catch (e) {
        return 0;
    }
}
/**
 * Ignore last found secrets
 *
 * Show error message on failure
 */
function ignoreLastFound(configuration) {
    if (!configuration) {
        vscode_1.window.showErrorMessage("ggshield: Missing settings");
        return;
    }
    const proc = (0, run_ggshield_1.runGGShieldCommand)(configuration, [
        "secret",
        "ignore",
        "--last-found",
    ]);
    if (proc.stderr.length > 0) {
        vscode_1.window.showErrorMessage(`ggshield: ${proc.stderr}`);
    }
    if (proc.stdout.length > 0) {
        vscode_1.window.showInformationMessage(`ggshield: ${proc.stdout}`);
    }
}
/**
 * Ignore one secret.
 *
 * Show error message on failure
 */
function ignoreSecret(configuration, secretSha, secretName) {
    const proc = (0, run_ggshield_1.runGGShieldCommand)(configuration, [
        "secret",
        "ignore",
        secretSha,
        "--name",
        secretName,
    ]);
    if (proc.stderr || proc.error) {
        console.log(proc.stderr);
        return false;
    }
    else {
        console.log(proc.stdout);
        return true;
    }
}
function createDiagnosticCollection(context) {
    exports.diagnosticCollection = vscode_1.languages.createDiagnosticCollection("ggshield");
    context.subscriptions.push(exports.diagnosticCollection);
}
/**
 * Clean up file diagnostics
 *
 * @param fileUri file uri
 */
function cleanUpFileDiagnostics(fileUri) {
    exports.diagnosticCollection.delete(fileUri);
}
/**
 * Scan a file using ggshield
 *
 * - retrieve configuration
 * - scan file using ggshield CLI application
 * - parse ggshield results
 * - set diagnostics collection so the incdients are visible to the user
 *
 * @param filePath path to file
 * @param fileUri file uri
 */
function scanFile(filePath, fileUri, configuration) {
    if ((0, utils_1.isFileGitignored)(filePath)) {
        (0, gitguardian_status_bar_1.updateStatusBarItem)(gitguardian_status_bar_1.StatusBarStatus.ignoredFile);
        return;
    }
    const proc = (0, run_ggshield_1.runGGShieldCommand)(configuration, [
        "secret",
        "scan",
        "--json",
        "path",
        filePath,
    ]);
    if (proc.status === 128 || proc.status === 3) {
        const errorMessage = proc.stderr
            .split("\n")
            .filter((stderrLine) => stderrLine.length > 0 && !stderrLine.includes("Scanning Path...") // ggshield outputs this info message on stderr, ignore it
        )
            .join("\n");
        if (errorMessage.length > 0) {
            vscode_1.window.showErrorMessage(`ggshield: ${errorMessage}`);
            return undefined;
        }
    }
    else if (proc.status === 2) {
        // Ignore errors concerning usage
        // This occurs when the path of the file is invalid (i.e.VSCode sending an event for files not on the file system)
        // or when the file is ignored in the .gitguardian.yaml
        if (proc.stderr.includes("Error: An ignored file or directory cannot be scanned")) {
            (0, gitguardian_status_bar_1.updateStatusBarItem)(gitguardian_status_bar_1.StatusBarStatus.ignoredFile);
            return;
        }
        return undefined;
    }
    else if (proc.status === 0) {
        (0, gitguardian_status_bar_1.updateStatusBarItem)(gitguardian_status_bar_1.StatusBarStatus.noSecretFound);
        return;
    }
    else {
        (0, gitguardian_status_bar_1.updateStatusBarItem)(gitguardian_status_bar_1.StatusBarStatus.secretFound);
    }
    const results = JSON.parse(proc.stdout);
    let incidentsDiagnostics = (0, ggshield_results_parser_1.parseGGShieldResults)(results);
    exports.diagnosticCollection.set(fileUri, incidentsDiagnostics);
}
//# sourceMappingURL=ggshield-api.js.map