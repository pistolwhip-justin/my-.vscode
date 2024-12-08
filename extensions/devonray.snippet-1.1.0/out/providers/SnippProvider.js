"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnippExplorer = exports.SnippProvider = exports.GroupModel = exports.SnippModel = void 0;
const vscode = require("vscode");
const path_1 = require("path");
const edit_snipp_1 = require("../components/edit_snipp");
class SnippModel {
    constructor(view, context) {
        this.view = view;
        this.context = context;
    }
    get roots() {
        var _a, _b;
        const snipps = (_b = (_a = this.context) === null || _a === void 0 ? void 0 : _a.globalState) === null || _b === void 0 ? void 0 : _b.get("snipps", []);
        const types = snipps
            .map((snipp) => snipp.contentType)
            .filter((value, index, self) => self.indexOf(value) === index)
            .map((type) => ({ name: type, contentType: undefined }));
        return Promise.resolve(types);
    }
    getChildren(node) {
        var _a, _b;
        const snipps = (_b = (_a = this.context) === null || _a === void 0 ? void 0 : _a.globalState) === null || _b === void 0 ? void 0 : _b.get("snipps", []).filter((snipp) => {
            return snipp.contentType === node.name;
        }).sort((a, b) => a.name.localeCompare(b.name));
        return Promise.resolve(snipps);
    }
    getContent(resource) {
        return Promise.resolve("");
    }
}
exports.SnippModel = SnippModel;
class GroupModel {
}
exports.GroupModel = GroupModel;
class SnippProvider {
    constructor(model, context) {
        this.model = model;
        this.context = context;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire(null);
    }
    isSnipp(object) {
        return "content" in object;
    }
    getTreeItem(element) {
        const t = element.name;
        let icn = (0, path_1.join)(__filename, "..", "..", "..", "resources", "icons", `folder-${t}.svg`);
        const isSnip = this.isSnipp(element);
        if (isSnip) {
            const it = element.contentType;
            icn = (0, path_1.join)(__filename, "..", "..", "..", "resources", "icons", `${it}.svg`);
        }
        const snippcomm = {
            command: "allSnipps.insertEntry",
            title: "",
            arguments: [element],
        };
        let snippetInfo = `**${element.name}⇥ ${element.contentType}** _\n___`;
        return {
            // @ts-ignore
            label: isSnip ? element.name : element.name.toUpperCase(),
            iconPath: icn,
            command: isSnip ? snippcomm : undefined,
            tooltip: isSnip
                ? new vscode.MarkdownString(
                // @ts-ignore
                `${snippetInfo}\n\n\`\`\`${element.contentType}\n${element.content}\n\`\`\``)
                : undefined,
            collapsibleState: !isSnip
                ? vscode.TreeItemCollapsibleState.Collapsed
                : undefined,
        };
    }
    getChildren(element) {
        return element ? this.model.getChildren(element) : this.model.roots;
    }
    provideTextDocumentContent(uri, token) {
        return this.model.getContent(uri).then((content) => {
            return content;
        });
    }
}
exports.SnippProvider = SnippProvider;
class SnippExplorer {
    constructor(context) {
        const snippModel = new SnippModel("recent", context);
        const snippDataProvider = new SnippProvider(snippModel, context);
        this.snippViewer = vscode.window.createTreeView("allSnipps", {
            treeDataProvider: snippDataProvider,
        });
        vscode.commands.registerCommand("allSnipps.refreshEntry", () => {
            snippDataProvider.refresh();
        });
        vscode.commands.registerCommand("allSnipps.addEntry", () => {
            vscode.window.showInformationMessage(`Successfully called add entry.`);
        });
        vscode.commands.registerCommand("allSnipps.deleteEntry", (snippToDelete) => {
            if (!snippToDelete.content) {
                vscode.window.showErrorMessage(`You can't delete a snippet group!`);
                return;
            }
            const existingSnipps = context.globalState.get("snipps", []);
            const updatedSnipps = existingSnipps.filter((snipp) => {
                return JSON.stringify(snipp) !== JSON.stringify(snippToDelete);
            });
            context.globalState.update("snipps", updatedSnipps);
            vscode.window.showInformationMessage(`Snipp deleted`);
            snippDataProvider.refresh();
        });
        vscode.commands.registerCommand("allSnipps.insertEntry", (snipp) => {
            const editor = vscode.window.activeTextEditor;
            if (editor && snippDataProvider.isSnipp(snipp)) {
                const position = editor === null || editor === void 0 ? void 0 : editor.selection.active;
                editor.edit((edit) => {
                    edit.insert(position, snipp.content || "");
                });
            }
            else if (editor && !snippDataProvider.isSnipp(snipp)) {
                vscode.window.showErrorMessage(`Please choose a Snipp instead of a group`);
            }
            else if (!editor) {
                vscode.window.showErrorMessage(`Please open a file to insert a Snipp`);
            }
            else {
                vscode.window.showErrorMessage(`Failed to insert Snipp!`);
            }
        });
        vscode.commands.registerCommand("allSnipps.editEntry", (snipp) => {
            if (!snipp.content) {
                vscode.window.showErrorMessage(`You can't edit a snippet group!`);
                return;
            }
            let existingSnipps = context.globalState.get("snipps", []);
            const snipIndex = existingSnipps.findIndex((snipp1) => JSON.stringify(snipp1) === JSON.stringify(snipp));
            const panel = vscode.window.createWebviewPanel("snippetEditor", // Identifies the type of the webview. Used internally
            `Edit: ${snipp.name}`, // Title of the panel displayed to the user
            vscode.ViewColumn.One, // Editor column to show the new webview panel in.
            {
                enableScripts: true,
            } // Webview options. More on these later.
            );
            panel.webview.html = (0, edit_snipp_1.default)(snipp);
            panel.webview.onDidReceiveMessage((message) => {
                switch (message.command) {
                    case "save":
                        const { name, content, tags } = message.snippetData;
                        if (name) {
                            snipp.name = name;
                        }
                        if (content) {
                            snipp.content = content;
                        }
                        if (tags) {
                            snipp.tags = tags
                                .split("+")
                                .map((sty) => sty.trim())
                                .filter((e) => e.length >= 2);
                        }
                        const updatedSnipps = existingSnipps.map((exsnip, index) => {
                            if (index === snipIndex) {
                                return snipp;
                            }
                            else {
                                return exsnip;
                            }
                        });
                        context.globalState.update("snipps", updatedSnipps);
                        panel.dispose();
                        snippDataProvider.refresh();
                        vscode.window.showInformationMessage(`Snippet Updated!`);
                        return;
                }
            }, undefined, context.subscriptions);
        });
    }
}
exports.SnippExplorer = SnippExplorer;
//# sourceMappingURL=SnippProvider.js.map