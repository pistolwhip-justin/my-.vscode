"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode_1 = require("vscode");
const add_snipp_1 = require("./components/add_snipp");
const SnippProvider_1 = require("./providers/SnippProvider");
const CompletionProvider_1 = require("./providers/CompletionProvider");
const search_snipps_1 = require("./components/search_snipps");
const search_terminal_snipps_1 = require("./components/search_terminal_snipps");
const TerminalSnippProvider_1 = require("./providers/TerminalSnippProvider");
const add_terminal_snipp_1 = require("./components/add_terminal_snipp");
const SnippExportProvider_1 = require("./providers/SnippExportProvider");
function activate(context) {
    new SnippProvider_1.SnippExplorer(context);
    new CompletionProvider_1.CompletionProvider(context);
    new TerminalSnippProvider_1.TerminalSnippExplorer(context);
    context.subscriptions.push(vscode_1.commands.registerCommand("extension.createSnipp", () => __awaiter(this, void 0, void 0, function* () {
        yield (0, add_snipp_1.AddSnippForm)(context);
    })));
    context.subscriptions.push(vscode_1.commands.registerCommand("terminalSnipps.addSnipp", () => __awaiter(this, void 0, void 0, function* () {
        yield (0, add_terminal_snipp_1.AddTerminalSnippetForm)(context);
    })));
    context.subscriptions.push(vscode_1.commands.registerCommand("extension.searchSnipps", () => __awaiter(this, void 0, void 0, function* () {
        (0, search_snipps_1.SearchSnippForm)(context);
    })));
    context.subscriptions.push(vscode_1.commands.registerCommand("terminalSnipps.searchSnipps", () => __awaiter(this, void 0, void 0, function* () {
        (0, search_terminal_snipps_1.SearchTerminalSnippsForm)(context);
    })));
    context.subscriptions.push(vscode_1.commands.registerCommand("extension.insertSnipp", () => __awaiter(this, void 0, void 0, function* () {
        (0, search_snipps_1.SearchSnippForm)(context);
    })));
    vscode_1.workspace.registerTextDocumentContentProvider("snippet-export", new SnippExportProvider_1.default(context));
    context.subscriptions.push(vscode_1.commands.registerCommand("extension.exportSnipps", () => __awaiter(this, void 0, void 0, function* () {
        vscode_1.workspace
            .openTextDocument(vscode_1.Uri.parse("snippet-export:snippets.json"))
            .then((doc) => {
            vscode_1.window.showTextDocument(doc, {
                preview: false,
            });
        });
    })));
    vscode_1.workspace.registerTextDocumentContentProvider("terminal-snippet-export", new SnippExportProvider_1.default(context, true));
    context.subscriptions.push(vscode_1.commands.registerCommand("extension.exportTerminalSnipps", () => __awaiter(this, void 0, void 0, function* () {
        vscode_1.workspace
            .openTextDocument(vscode_1.Uri.parse("terminal-snippet-export:terminal-snippets.json"))
            .then((doc) => {
            vscode_1.window.showTextDocument(doc, {
                preview: false,
            });
        });
    })));
    context.subscriptions.push(vscode_1.commands.registerCommand("extension.deleteAllSnippets", () => __awaiter(this, void 0, void 0, function* () {
        vscode_1.window
            .showInformationMessage("Are you sure you want to delete all your stored snippets, this cannot be undone!", "Yes", "No")
            .then((answer) => {
            if (answer === "Yes") {
                // Run function
                context.globalState.update("snipps", []);
                vscode_1.commands.executeCommand("allSnipps.refreshEntry");
                vscode_1.window.showInformationMessage(`Successfully removed all snippets`);
            }
        });
    })));
    context.subscriptions.push(vscode_1.commands.registerCommand("extension.importSnipps", () => __awaiter(this, void 0, void 0, function* () {
        const options = {
            canSelectMany: false,
            canSelectFiles: true,
            canSelectFolders: false,
            openLabel: "Choose file",
        };
        vscode_1.window.showOpenDialog(options).then((fileUri) => {
            if (fileUri && fileUri[0]) {
                vscode_1.workspace.openTextDocument(fileUri[0].fsPath).then((doc) => {
                    try {
                        const validSnippets = [];
                        const snippetsToImportRaw = JSON.parse(doc.getText());
                        snippetsToImportRaw.forEach((snipp) => {
                            let valid = true;
                            if (!snipp.content) {
                                valid = false;
                                console.log("no content");
                            }
                            if (!snipp.created) {
                                valid = false;
                                console.log("no ccreated");
                            }
                            if (!Object.keys(snipp).includes("tags") &&
                                typeof snipp.tags === "object") {
                                console.log("no tags");
                                valid = false;
                            }
                            if (!snipp.contentType) {
                                valid = false;
                                console.log("no tags");
                            }
                            if (valid) {
                                validSnippets.push(snipp);
                            }
                            else {
                                throw new Error("Snippet is invalid");
                            }
                        });
                        const existingSnipps = context.globalState.get("snipps", []);
                        const updatedSnipps = [...existingSnipps, ...validSnippets];
                        context.globalState.update("snipps", updatedSnipps);
                        vscode_1.commands.executeCommand("allSnipps.refreshEntry");
                        vscode_1.window.showInformationMessage(`Snippets import success`);
                    }
                    catch (error) {
                        vscode_1.window.showErrorMessage(`Import failed, the json file you selected is invalid, please double check all fields.`);
                    }
                });
            }
        });
    })));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map