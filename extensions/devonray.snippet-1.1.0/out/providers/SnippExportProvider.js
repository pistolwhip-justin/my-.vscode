"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SnippetExportProvider {
    constructor(context, isTerminal) {
        var _a, _b;
        if (isTerminal) {
            this.snipps = (_a = context === null || context === void 0 ? void 0 : context.globalState) === null || _a === void 0 ? void 0 : _a.get("terminal_snipps", []);
        }
        else {
            this.snipps = (_b = context === null || context === void 0 ? void 0 : context.globalState) === null || _b === void 0 ? void 0 : _b.get("snipps", []);
        }
    }
    /**
     *
     * @param {vscode.Uri} uri - a fake uri
     * @returns {string} - settings read from the JSON file
     **/
    provideTextDocumentContent(uri) {
        let returnString = { test: "testing" };
        return JSON.stringify(this.snipps, null, 4) || ""; // prettify and return
    }
}
exports.default = SnippetExportProvider;
//# sourceMappingURL=SnippExportProvider.js.map