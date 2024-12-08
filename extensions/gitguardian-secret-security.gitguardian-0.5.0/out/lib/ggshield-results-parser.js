"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGGShieldResults = parseGGShieldResults;
/* eslint-disable @typescript-eslint/naming-convention */
const vscode_1 = require("vscode");
const validityDisplayName = {
    unknown: "Unknown",
    cannot_check: "Cannot Check",
    no_checker: "No Checker",
    failed_to_check: "Failed to Check",
    not_checked: "Not Checked",
    invalid: "Invalid",
    valid: "Valid",
};
/**
 * Given a list of occurrences, this function searches for the matches of type "connection_uri"
 * and returns it if found. If no "connection_uri" match is found, the original list is returned.
 * This ensures that only the full URI match is kept, avoiding multiple matches for its components (e.g. scheme, username, password, host).
 *
 * @param occurrences - An array of `Occurrence` objects to be filtered.
 * @returns An array containing the "connection_uri" occurrence, or the original list if no such match exists.
 */
function filterUriOccurrences(occurrences) {
    const uriOccurrence = occurrences.find(({ type }) => type === "connection_uri");
    return uriOccurrence ? [uriOccurrence] : occurrences;
}
/**
 * Parse ggshield results and return diagnostics of found incidents
 *
 * @param results ggshield scan results
 * @returns incidents diagnostics
 */
function parseGGShieldResults(results) {
    let diagnostics = [];
    try {
        if (!results.entities_with_incidents) {
            return diagnostics;
        }
        results.entities_with_incidents.forEach((entityWithIncidents) => {
            entityWithIncidents.incidents.forEach((incident) => {
                filterUriOccurrences(incident.occurrences).forEach((occurrence) => {
                    let range = new vscode_1.Range(new vscode_1.Position(occurrence.line_start - 1, occurrence.index_start), new vscode_1.Position(occurrence.line_end - 1, occurrence.index_end));
                    let diagnostic = new vscode_1.Diagnostic(range, `ggshield: ${occurrence.type}

Secret detected: ${incident.type}
Validity: ${validityDisplayName[incident.validity]}
Known by GitGuardian dashboard: ${incident.known_secret ? "YES" : "NO"}
Total occurrences: ${incident.total_occurrences}
Incident URL: ${incident.incident_url || "N/A"}
Secret SHA: ${incident.ignore_sha}`, vscode_1.DiagnosticSeverity.Warning);
                    diagnostic.source = "gitguardian";
                    diagnostics.push(diagnostic);
                });
            });
        });
    }
    catch (e) {
        console.error(e);
        vscode_1.window.showErrorMessage("ggshield: Error parsing scan results");
    }
    return diagnostics;
}
//# sourceMappingURL=ggshield-results-parser.js.map