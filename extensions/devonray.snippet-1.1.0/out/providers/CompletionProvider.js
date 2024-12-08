"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompletionProvider = void 0;
const vscode_1 = require("vscode");
class CompletionProvider {
    constructor(context) {
        var _a;
        const snipps = (_a = context === null || context === void 0 ? void 0 : context.globalState) === null || _a === void 0 ? void 0 : _a.get("snipps", []);
        const tags = snipps.map((snipp) => snipp.contentType);
        const providers = tags
            .filter((value, index, self) => self.indexOf(value) === index)
            .map(type => vscode_1.languages.registerCompletionItemProvider(type, {
            provideCompletionItems(document, position, token, context) {
                return snipps
                    .filter((snipp) => {
                    return snipp.contentType === type;
                })
                    .map((snipp) => {
                    const commandCompletion = new vscode_1.CompletionItem(snipp.name);
                    commandCompletion.insertText = snipp.content || "";
                    return commandCompletion;
                });
            }
        }));
        context.subscriptions.push(...providers);
    }
}
exports.CompletionProvider = CompletionProvider;
//# sourceMappingURL=CompletionProvider.js.map