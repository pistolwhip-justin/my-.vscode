"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkGitInstalled = checkGitInstalled;
exports.isFileGitignored = isFileGitignored;
exports.getCurrentFile = getCurrentFile;
const vscode = require("vscode");
const child_process_1 = require("child_process");
const path = require("path");
function checkGitInstalled() {
    let proc = (0, child_process_1.spawnSync)("git", ["--version"]);
    const success = proc.status === 0;
    if (!success) {
        vscode.window.showErrorMessage(`GGShield requires git to work correctly. Please install git.`);
    }
    return success;
}
// Since git is required to use ggshield, we know that it is installed
function isFileGitignored(filePath) {
    let proc = (0, child_process_1.spawnSync)("git", ["check-ignore", filePath], {
        cwd: path.dirname(filePath),
    });
    return proc.status === 0;
}
function getCurrentFile() {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        return activeEditor.document.fileName;
    }
    else {
        return "";
    }
}
//# sourceMappingURL=utils.js.map