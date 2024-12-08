"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalSnippExplorer = exports.TerminalSnippProvider = exports.TerminalSnippModel = void 0;
const vscode = require("vscode");
const edit_terminal_snipp_1 = require("../components/edit_terminal_snipp");
class TerminalSnippModel {
    constructor(view, context) {
        this.view = view;
        this.context = context;
    }
    get roots() {
        var _a, _b;
        const snipps = (_b = (_a = this.context) === null || _a === void 0 ? void 0 : _a.globalState) === null || _b === void 0 ? void 0 : _b.get("terminal_snipps", []).sort((a, b) => a.name.localeCompare(b.name));
        return Promise.resolve(snipps);
    }
    getContent(resource) {
        return Promise.resolve("");
    }
}
exports.TerminalSnippModel = TerminalSnippModel;
class TerminalSnippProvider {
    constructor(model, context) {
        this.model = model;
        this.context = context;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire(null);
    }
    getTreeItem(element) {
        const t = element.name;
        const snippcomm = {
            command: "terminalSnipps.insertEntry",
            title: "",
            arguments: [element],
        };
        return {
            label: element.name,
            command: snippcomm,
        };
    }
    getChildren(element) {
        return this.model.roots;
    }
    provideTextDocumentContent(uri, token) {
        return this.model.getContent(uri).then((content) => {
            return content;
        });
    }
}
exports.TerminalSnippProvider = TerminalSnippProvider;
class TerminalSnippExplorer {
    constructor(context) {
        const snippModel = new TerminalSnippModel("recent", context);
        const snippDataProvider = new TerminalSnippProvider(snippModel, context);
        this.snippViewer = vscode.window.createTreeView("terminalSnipps", {
            treeDataProvider: snippDataProvider,
        });
        /**
         * Removes a terminal snippet from storage
         */
        vscode.commands.registerCommand("terminalSnipps.deleteEntry", (snippToDelete) => {
            const existingSnipps = context.globalState.get("terminal_snipps", []);
            const updatedSnipps = existingSnipps.filter((snipp) => {
                return JSON.stringify(snipp) !== JSON.stringify(snippToDelete);
            });
            context.globalState.update("terminal_snipps", updatedSnipps);
            vscode.window.showInformationMessage(`Terminal Snippet Removed`);
            snippDataProvider.refresh();
        });
        /**
         * Refreshes the list of terminal snippets.
         */
        vscode.commands.registerCommand("terminalSnipps.refreshEntry", () => {
            snippDataProvider.refresh();
        });
        /**
         * Inserts the snippet into an existing integrated terminal
         */
        vscode.commands.registerCommand("terminalSnipps.insertEntry", (snipp) => {
            if (vscode.window.activeTerminal) {
                vscode.window.activeTerminal.show();
                vscode.window.activeTerminal.sendText(snipp.content);
            }
            else {
                vscode.window.showErrorMessage(`Please open a terminal instance to insert this snippet.`);
            }
        });
        vscode.commands.registerCommand("terminalSnipps.editEntry", (snipp) => {
            let existingSnipps = context.globalState.get("terminal_snipps", []);
            const snipIndex = existingSnipps.findIndex((snipp1) => JSON.stringify(snipp1) === JSON.stringify(snipp));
            const panel = vscode.window.createWebviewPanel("snippetEditor", // Identifies the type of the webview. Used internally
            `Edit: ${snipp.name}`, // Title of the panel displayed to the user
            vscode.ViewColumn.One, // Editor column to show the new webview panel in.
            {
                enableScripts: true,
            } // Webview options. More on these later.
            );
            panel.webview.html = (0, edit_terminal_snipp_1.default)(snipp);
            panel.webview.onDidReceiveMessage((message) => {
                switch (message.command) {
                    case "save":
                        const { name, content } = message.snippetData;
                        if (name) {
                            snipp.name = name;
                        }
                        if (content) {
                            snipp.content = content;
                        }
                        const updatedSnipps = existingSnipps.map((exsnip, index) => {
                            if (index === snipIndex) {
                                return snipp;
                            }
                            else {
                                return exsnip;
                            }
                        });
                        context.globalState.update("terminal_snipps", updatedSnipps);
                        panel.dispose();
                        snippDataProvider.refresh();
                        vscode.window.showInformationMessage(`Terminal Snippet Updated!`);
                        return;
                }
            }, undefined, context.subscriptions);
        });
    }
}
exports.TerminalSnippExplorer = TerminalSnippExplorer;
//# sourceMappingURL=TerminalSnippProvider.js.map