"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simple = require("simple-mock");
const childProcess = require("child_process");
const runGGShield = require("../../../lib/run-ggshield");
const assert = require("assert");
suite("runGGShieldCommand", () => {
    let spawnSyncMock;
    setup(() => {
        spawnSyncMock = simple.mock(childProcess, "spawnSync"); // Mock spawnSync
    });
    teardown(() => {
        simple.restore();
    });
    test("Global env variables are set correctly", () => {
        process.env.TEST_GLOBAL_VAR = "GlobalValue";
        runGGShield.runGGShieldCommand({
            ggshieldPath: "path/to/ggshield",
            apiUrl: "",
        }, []);
        // Assert that spawnSync was called
        assert(spawnSyncMock.called, "spawnSync should be called once");
        // Check the arguments passed to spawnSync
        const spawnSyncArgs = spawnSyncMock.lastCall.args;
        const options = spawnSyncArgs[2];
        assert.strictEqual(options.env.TEST_GLOBAL_VAR, "GlobalValue");
        delete process.env.TEST_GLOBAL_VAR;
    });
    const testCasesAllowSelfSigned = [
        {
            allowSelfSigned: true,
            description: "GGshield is called with flag --allow-self-signed when allowSelfSigned is true",
        },
        {
            allowSelfSigned: false,
            description: "GGshield is not called with flag --allow-self-signed when allowSelfSigned is false",
        },
    ];
    testCasesAllowSelfSigned.forEach(({ allowSelfSigned, description }) => {
        test(description, () => {
            process.env.TEST_GLOBAL_VAR = "GlobalValue";
            runGGShield.runGGShieldCommand({
                ggshieldPath: "path/to/ggshield",
                apiUrl: "",
                allowSelfSigned: allowSelfSigned,
            }, ["test"]);
            assert(spawnSyncMock.called, "spawnSync should be called once");
            const spawnSyncArgs = spawnSyncMock.lastCall.args;
            const args = spawnSyncArgs[1];
            assert.strictEqual(args[0] === "--allow-self-signed", allowSelfSigned);
        });
    });
    test("adds the --instance option when apiUrl is set in the settings", () => {
        runGGShield.runGGShieldCommand({
            ggshieldPath: "path/to/ggshield",
            apiUrl: "https://example.com",
        }, ["test"]);
        assert(spawnSyncMock.called, "spawnSync should be called once");
        assert.deepStrictEqual(spawnSyncMock.lastCall.args[1], [
            "test",
            "--instance",
            "https://example.com",
        ]);
    });
    test("does not add the --instance option when calling ggshield --version", () => {
        runGGShield.runGGShieldCommand({
            ggshieldPath: "path/to/ggshield",
            apiUrl: "https://example.com",
        }, ["--version"]);
        assert(spawnSyncMock.called, "spawnSync should be called once");
        assert.deepStrictEqual(spawnSyncMock.lastCall.args[1], ["--version"]);
    });
});
//# sourceMappingURL=run-ggshield.test.js.map