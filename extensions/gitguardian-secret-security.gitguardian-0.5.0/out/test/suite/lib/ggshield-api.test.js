"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const statusBar = require("../../../gitguardian-interface/gitguardian-status-bar");
const simple = require("simple-mock");
const ggshield_api_1 = require("../../../lib/ggshield-api");
const runGGShield = require("../../../lib/run-ggshield");
const vscode_1 = require("vscode");
const constants_1 = require("../../constants");
const assert = require("assert");
suite("scanFile", () => {
    let updateStatusBarMock;
    let runGGShieldCommandMock;
    let errorMessageMock = simple.mock(vscode_1.window, "showErrorMessage");
    setup(() => {
        updateStatusBarMock = simple.mock(statusBar, "updateStatusBarItem");
        runGGShieldCommandMock = simple.mock(runGGShield, "runGGShieldCommand");
        errorMessageMock = simple.mock(vscode_1.window, "showErrorMessage");
    });
    teardown(() => {
        simple.restore();
    });
    test("successfully scans a file with no incidents", () => {
        runGGShieldCommandMock.returnWith({
            status: 0,
            stdout: constants_1.scanResultsNoIncident,
            stderr: "",
        });
        (0, ggshield_api_1.scanFile)("test.py", vscode_1.Uri.file("test.py"), {});
        // The status bar displays "No Secret Found"
        assert.strictEqual(updateStatusBarMock.callCount, 1);
        assert.strictEqual(updateStatusBarMock.lastCall.args[0], statusBar.StatusBarStatus.noSecretFound);
    });
    test("successfully scans a file with incidents", () => {
        runGGShieldCommandMock.returnWith({
            status: 1,
            stdout: constants_1.scanResultsWithIncident,
            stderr: "",
        });
        (0, ggshield_api_1.scanFile)("test.py", vscode_1.Uri.file("test.py"), {});
        // The status bar displays "Secret Found"
        assert.strictEqual(updateStatusBarMock.callCount, 1);
        assert.strictEqual(updateStatusBarMock.lastCall.args[0], statusBar.StatusBarStatus.secretFound);
        // The diagnostic collection contains the incident
        assert.strictEqual(ggshield_api_1.diagnosticCollection.get(vscode_1.Uri.file("test.py"))?.length, 1);
    });
    test("skips the file if it is gitignored", () => {
        const filePath = "out/test.py";
        (0, ggshield_api_1.scanFile)(filePath, vscode_1.Uri.file(filePath), {});
        // The status bar displays "Ignored File"
        assert.strictEqual(updateStatusBarMock.callCount, 1);
        assert.strictEqual(updateStatusBarMock.lastCall.args[0], statusBar.StatusBarStatus.ignoredFile);
    });
    const errorCodes = [128, 3];
    errorCodes.forEach((code) => {
        test(`displays an error message if the scan command fails with error code ${code}`, () => {
            runGGShieldCommandMock.returnWith({
                status: code,
                stdout: "",
                stderr: "Error",
            });
            (0, ggshield_api_1.scanFile)("test.py", vscode_1.Uri.file("test.py"), {});
            // The error message is displayed
            assert.strictEqual(errorMessageMock.callCount, 1);
            assert.strictEqual(errorMessageMock.lastCall.args[0], "ggshield: Error");
        });
    });
    test("ignores the 'ignored file cannot be scanned' error", () => {
        runGGShieldCommandMock.returnWith({
            status: 2,
            stdout: "",
            stderr: "Error: An ignored file or directory cannot be scanned.",
        });
        (0, ggshield_api_1.scanFile)("test", vscode_1.Uri.file("test"), {});
        // No error message is displayed
        assert.strictEqual(errorMessageMock.callCount, 0);
        // The status bar displays "Ignored File"
        assert.strictEqual(updateStatusBarMock.callCount, 1);
        assert.strictEqual(updateStatusBarMock.lastCall.args[0], statusBar.StatusBarStatus.ignoredFile);
    });
});
//# sourceMappingURL=ggshield-api.test.js.map