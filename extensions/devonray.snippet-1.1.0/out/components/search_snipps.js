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
exports.SearchSnippForm = void 0;
const vscode_1 = require("vscode");
function SearchSnippForm(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const title = "Search Snipps";
        function startSearchSnipp(state) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                const snipps = (_a = context === null || context === void 0 ? void 0 : context.globalState) === null || _a === void 0 ? void 0 : _a.get("snipps", []);
                const result = yield vscode_1.window.showQuickPick(snipps.map((sn) => ({
                    label: sn.name,
                    description: `(${sn.tags.join(', ')})`,
                    snipp: sn
                })), {
                    placeHolder: "Search snipps",
                    matchOnDescription: true,
                    matchOnDetail: true
                });
                if (result && result.snipp) {
                    vscode_1.commands.executeCommand('allSnipps.insertEntry', result.snipp);
                }
            });
        }
        yield startSearchSnipp({});
    });
}
exports.SearchSnippForm = SearchSnippForm;
//# sourceMappingURL=search_snipps.js.map