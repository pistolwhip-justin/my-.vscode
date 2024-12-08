"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simple = require("simple-mock");
const runGGShield = require("../../../lib/run-ggshield");
const statusBar = require("../../../gitguardian-interface/gitguardian-status-bar");
const assert = require("assert");
const vscode_1 = require("vscode");
const authentication_1 = require("../../../lib/authentication");
suite("updateAuthenticationStatus", () => {
    let authenticationStatus;
    let mockWorkspaceState;
    let mockContext;
    let runGGShieldMock;
    let updateStatusBarItemMock;
    let executeCommandMock;
    setup(function () {
        updateStatusBarItemMock = simple.mock(statusBar, "updateStatusBarItem");
        executeCommandMock = simple.mock(vscode_1.commands, "executeCommand");
        mockWorkspaceState = {
            get: (key) => key === "authenticationStatus" ? authenticationStatus : undefined,
            update: (key, value) => {
                if (key === "authenticationStatus") {
                    authenticationStatus = value;
                }
                return Promise.resolve();
            },
            keys: () => [],
            setKeysForSync: (keys) => { },
        };
        mockContext = {
            workspaceState: mockWorkspaceState,
        };
        runGGShieldMock = simple.mock(runGGShield, "runGGShieldCommand");
    });
    teardown(function () {
        simple.restore();
    });
    test("returns noKeyFound status when no key is configured", async () => {
        runGGShieldMock.returnWith({
            status: 3,
            stdout: "",
            stderr: "Error: No token is saved for this instance: 'https://dashboard.gitguardian.com'",
        });
        await (0, authentication_1.updateAuthenticationStatus)(mockContext, {});
        assert.deepStrictEqual(authenticationStatus, {
            success: false,
            instance: "https://dashboard.gitguardian.com",
            keySource: authentication_1.ConfigSource.noKeyFound,
        });
        assert.strictEqual(updateStatusBarItemMock.callCount, 1);
        assert.strictEqual(updateStatusBarItemMock.lastCall.args[0], statusBar.StatusBarStatus.unauthenticated);
        assert.strictEqual(executeCommandMock.callCount, 1);
        assert.deepStrictEqual(executeCommandMock.lastCall.args, [
            "setContext",
            "isAuthenticated",
            false,
        ]);
    });
    test("returns true when valid credentials are configured", async () => {
        runGGShieldMock.returnWith({
            status: 0,
            stdout: `{
          "status_code": 200, 
          "instance": "https://dashboard.gitguardian.com",
          "api_key_source": "${authentication_1.GGShieldConfigSource.userConfig}",
          "instance_source": "${authentication_1.GGShieldConfigSource.userConfig}"
        }`,
            stderr: "",
        });
        await (0, authentication_1.updateAuthenticationStatus)(mockContext, {});
        assert.deepStrictEqual(authenticationStatus, {
            success: true,
            instance: "https://dashboard.gitguardian.com",
            keySource: authentication_1.ConfigSource.keyGGShieldConfig,
            instanceSource: authentication_1.ConfigSource.instanceGGShieldConfig,
        });
        assert.strictEqual(updateStatusBarItemMock.callCount, 1);
        assert.strictEqual(updateStatusBarItemMock.lastCall.args[0], statusBar.StatusBarStatus.ready);
        assert.strictEqual(executeCommandMock.callCount, 1);
        assert.deepStrictEqual(executeCommandMock.lastCall.args, [
            "setContext",
            "isAuthenticated",
            true,
        ]);
    });
    test("returns false with correct sources and instance when API key is invalid", async () => {
        runGGShieldMock.returnWith({
            status: 0,
            stdout: `{
        "status_code": 401, 
        "instance": "https://dashboard.gitguardian.com",
        "api_key_source": "${authentication_1.GGShieldConfigSource.dotEnv}",
        "instance_source": "${authentication_1.GGShieldConfigSource.cmdOption}"
      }`,
            stderr: "",
        });
        await (0, authentication_1.updateAuthenticationStatus)(mockContext, {});
        assert.deepStrictEqual(authenticationStatus, {
            success: false,
            instance: "https://dashboard.gitguardian.com",
            keySource: authentication_1.ConfigSource.dotEnv,
            instanceSource: authentication_1.ConfigSource.extensionSettings,
        });
        assert.strictEqual(updateStatusBarItemMock.callCount, 1);
        assert.strictEqual(updateStatusBarItemMock.lastCall.args[0], statusBar.StatusBarStatus.authFailed);
        assert.strictEqual(executeCommandMock.callCount, 1);
        assert.deepStrictEqual(executeCommandMock.lastCall.args, [
            "setContext",
            "isAuthenticated",
            false,
        ]);
    });
});
//# sourceMappingURL=authentication.test.js.map