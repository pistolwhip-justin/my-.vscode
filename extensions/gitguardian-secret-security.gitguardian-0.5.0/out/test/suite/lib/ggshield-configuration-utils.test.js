"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simple = require("simple-mock");
const assert = require("assert");
const vscode_1 = require("vscode");
const ggshield_configuration_utils_1 = require("../../../lib/ggshield-configuration-utils");
suite("getConfiguration", () => {
    let getConfigurationMock;
    setup(() => {
        // Mock workspace.getConfiguration
        getConfigurationMock = simple.mock(vscode_1.workspace, "getConfiguration");
    });
    teardown(() => {
        simple.restore();
    });
    test("Vscode settings are correctly read", () => {
        const context = {};
        simple.mock(context, "asAbsolutePath").returnWith("");
        getConfigurationMock.returnWith({
            get: (key) => {
                if (key === "apiUrl") {
                    return "https://custom-url.com";
                }
                if (key === "allowSelfSigned") {
                    return true;
                }
            },
        });
        const configuration = (0, ggshield_configuration_utils_1.getConfiguration)(context);
        // Assert both workspace.getConfiguration  and GGShieldConfiguration constructor were called
        assert(getConfigurationMock.called, "getConfiguration should be called once");
        // Assert that the configuration has the expected values
        assert.strictEqual(configuration.apiUrl, "https://custom-url.com");
        assert.strictEqual(configuration.allowSelfSigned, true);
    });
});
//# sourceMappingURL=ggshield-configuration-utils.test.js.map