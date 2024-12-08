"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const vscode_1 = require("vscode");
suite("activate", () => {
    test("Should activate extension successfully", async () => {
        const ext = vscode_1.extensions.getExtension("gitguardian-secret-security.gitguardian");
        await ext?.activate();
        assert.ok(ext?.isActive, "Extension should be active");
    });
    test("Should register all gitguardian commands", async () => {
        const commandIds = [
            "gitguardian.quota",
            "gitguardian.ignore",
            "gitguardian.authenticate",
            "gitguardian.logout",
            "gitguardian.showOutput",
            "gitguardian.openSidebar",
            "gitguardian.openProblems",
            "gitguardian.refreshQuota",
            "gitguardian.showOutput",
        ];
        const registered = await vscode_1.commands.getCommands(true);
        const gitguardianCommands = registered.filter((command) => command.startsWith("gitguardian"));
        for (const command of commandIds) {
            assert.ok(gitguardianCommands.includes(command), `Command ${command} should be registered`);
        }
    });
});
//# sourceMappingURL=extension.test.js.map