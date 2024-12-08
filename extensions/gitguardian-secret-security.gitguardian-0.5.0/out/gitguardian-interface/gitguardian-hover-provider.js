"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitGuardianSecretHoverProvider = void 0;
exports.generateSecretName = generateSecretName;
const vscode = require("vscode");
class GitGuardianSecretHoverProvider {
    provideHover(document, position, token) {
        const diagnostics = vscode.languages.getDiagnostics(document.uri);
        for (const diagnostic of diagnostics) {
            if (diagnostic.range.contains(position) &&
                diagnostic.source === "gitguardian") {
                const hoverMessage = new vscode.MarkdownString();
                hoverMessage.isTrusted = true;
                const diagnosticData = diagnosticToJSON(diagnostic);
                const encodedDiagnosticData = encodeURIComponent(diagnosticData);
                hoverMessage.appendMarkdown(`[GitGuardian: Ignore Secret (update .gitguardian.yaml)](command:gitguardian.ignoreSecret?${encodedDiagnosticData} "Click to ignore this incident")`);
                return new vscode.Hover(hoverMessage, diagnostic.range);
            }
        }
        return null;
    }
}
exports.GitGuardianSecretHoverProvider = GitGuardianSecretHoverProvider;
function diagnosticToJSON(diagnostic) {
    // Extract the infos useful to generate the secret name
    const { detector, secretSha } = extractInfosFromMessage(diagnostic.message);
    const diagnosticObject = {
        startLine: diagnostic.range.start.line,
        detector: detector,
        secretSha: secretSha,
    };
    // Convert the object to a JSON string
    return JSON.stringify(diagnosticObject);
}
function extractInfosFromMessage(message) {
    const regexDetectorPattern = /Secret detected: ([a-zA-Z ]+)/;
    const regexShaPattern = /Secret SHA: ([a-zA-Z0-9]+)/;
    const matchDetector = message.match(regexDetectorPattern);
    const matchSha = message.match(regexShaPattern);
    if (matchDetector && matchSha) {
        const detector = matchDetector[1].trim();
        const secretSha = matchSha[1].trim();
        return { detector, secretSha };
    }
    else {
        throw new Error("No match found");
    }
}
function generateSecretName(currentFile, uriDiagnostic) {
    return `${uriDiagnostic.detector} - ${vscode.workspace.asRelativePath(currentFile)}:l.${uriDiagnostic.startLine}`;
}
//# sourceMappingURL=gitguardian-hover-provider.js.map