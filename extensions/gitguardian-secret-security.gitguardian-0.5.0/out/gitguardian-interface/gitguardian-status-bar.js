"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusBarStatus = void 0;
exports.createStatusBarItem = createStatusBarItem;
exports.updateStatusBarItem = updateStatusBarItem;
const vscode_1 = require("vscode");
let statusBarItem;
var StatusBarStatus;
(function (StatusBarStatus) {
    StatusBarStatus["initialization"] = "Initialization";
    StatusBarStatus["unauthenticated"] = "Unauthenticated";
    StatusBarStatus["authFailed"] = "Authentication failed";
    StatusBarStatus["ready"] = "Ready";
    StatusBarStatus["scanning"] = "Scanning";
    StatusBarStatus["secretFound"] = "Secret found";
    StatusBarStatus["noSecretFound"] = "No secret found";
    StatusBarStatus["error"] = "Error";
    StatusBarStatus["ignoredFile"] = "Ignored file";
})(StatusBarStatus || (exports.StatusBarStatus = StatusBarStatus = {}));
function createStatusBarItem(context) {
    statusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left, 0);
    updateStatusBarItem(StatusBarStatus.initialization);
    context.subscriptions.push(statusBarItem);
}
function getStatusBarConfig(status) {
    switch (status) {
        case StatusBarStatus.initialization:
            return {
                text: "GitGuardian - Initializing...",
                color: "statusBar.foreground",
                command: "gitguardian.showOutput",
            };
        case StatusBarStatus.unauthenticated:
            return {
                text: "GitGuardian - Please authenticate",
                color: "statusBarItem.warningBackground",
                command: "gitguardian.openSidebar",
            };
        case StatusBarStatus.ready:
            return {
                text: "GitGuardian is ready",
                color: "statusBar.foreground",
                command: "gitguardian.openSidebar",
            };
        case StatusBarStatus.scanning:
            return {
                text: "GitGuardian - Scanning...",
                color: "statusBar.foreground",
                command: "gitguardian.showOutput",
            };
        case StatusBarStatus.secretFound:
            return {
                text: "GitGuardian - Secret found",
                color: "statusBarItem.errorBackground",
                command: "gitguardian.openProblems",
                // TODO: onclick open problems panel
            };
        case StatusBarStatus.noSecretFound:
            return {
                text: "GitGuardian - No secret found",
                color: "statusBar.foreground",
                command: "gitguardian.openSidebar",
            };
        case StatusBarStatus.error:
            return {
                text: "GitGuardian - error",
                color: "statusBarItem.errorBackground",
                command: "gitguardian.showOutput",
            };
        case StatusBarStatus.ignoredFile:
            return {
                text: "GitGuardian - Ignored file",
                color: "statusBarItem.warningBackground",
            };
        case StatusBarStatus.authFailed:
            return {
                text: "GitGuardian - Authentication failed",
                color: "statusBarItem.errorBackground",
                command: "gitguardian.openSidebar",
            };
        default:
            return { text: "", color: "statusBar.foreground" };
    }
}
function updateStatusBarItem(status) {
    const config = getStatusBarConfig(status);
    statusBarItem.text = config.text;
    statusBarItem.backgroundColor = new vscode_1.ThemeColor(config.color);
    // If the command is defined, assign it to the status bar item
    if (config.command) {
        statusBarItem.command = config.command;
    }
    else {
        statusBarItem.command = undefined;
    }
    statusBarItem.show();
}
//# sourceMappingURL=gitguardian-status-bar.js.map