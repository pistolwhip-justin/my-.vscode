"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const ggshield_results_parser_1 = require("../../lib/ggshield-results-parser");
const vscode_1 = require("vscode");
const constants_1 = require("../constants");
suite("parseGGShieldResults", () => {
    test("Should parse ggshield scan output", () => {
        const diagnostics = (0, ggshield_results_parser_1.parseGGShieldResults)(JSON.parse(constants_1.scanResultsWithIncident));
        assert.strictEqual(diagnostics.length, 1);
        const diagnostic = diagnostics[0];
        assert.ok(diagnostic.message.includes("apikey"));
        assert.ok(diagnostic.message.includes("Generic High Entropy Secret"));
        assert.strictEqual(diagnostic.range.start.line, 3);
        assert.strictEqual(diagnostic.range.start.character, 11);
        assert.strictEqual(diagnostic.range.end.line, 3);
        assert.strictEqual(diagnostic.range.end.character, 79);
        assert.strictEqual(diagnostic.severity, vscode_1.DiagnosticSeverity.Warning);
    });
    test("Should return an empty array if there are no incidents", () => {
        const diagnostics = (0, ggshield_results_parser_1.parseGGShieldResults)(JSON.parse(constants_1.scanResultsNoIncident));
        assert.strictEqual(diagnostics.length, 0);
    });
    test("Should return an empty array on an invalid ggshield output", () => {
        const diagnostics = (0, ggshield_results_parser_1.parseGGShieldResults)(JSON.parse("{}"));
        assert.strictEqual(diagnostics.length, 0);
    });
    test("Should only return the 'connection_uri' match if the secret is an URI", () => {
        const diagnostics = (0, ggshield_results_parser_1.parseGGShieldResults)(JSON.parse(constants_1.scanResultsWithUriIncident));
        assert.strictEqual(diagnostics.length, 1);
        assert.ok(diagnostics[0].message.includes("connection_uri"));
    });
});
//# sourceMappingURL=results-parser.test.js.map