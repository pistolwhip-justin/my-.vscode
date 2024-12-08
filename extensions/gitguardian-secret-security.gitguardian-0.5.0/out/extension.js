"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const ggshield_api_1 = require("./lib/ggshield-api");
const ggshield_configuration_utils_1 = require("./lib/ggshield-configuration-utils");
const vscode_1 = require("vscode");
const ggshield_resolver_1 = require("./lib/ggshield-resolver");
const utils_1 = require("./utils");
const gitguardian_webview_view_1 = require("./ggshield-webview/gitguardian-webview-view");
const gitguardian_status_bar_1 = require("./gitguardian-interface/gitguardian-status-bar");
const gitguardian_hover_provider_1 = require("./gitguardian-interface/gitguardian-hover-provider");
const gitguardian_quota_webview_1 = require("./ggshield-webview/gitguardian-quota-webview");
const gitguardian_remediation_message_view_1 = require("./ggshield-webview/gitguardian-remediation-message-view");
const authentication_1 = require("./lib/authentication");
function registerOpenViewsCommands(context, outputChannel) {
    const showOutputCommand = vscode_1.commands.registerCommand("gitguardian.showOutput", () => {
        outputChannel.show();
    });
    const openSidebarCommand = vscode_1.commands.registerCommand("gitguardian.openSidebar", () => {
        vscode_1.commands.executeCommand("workbench.view.extension.gitguardian");
    });
    const openProblemsCommand = vscode_1.commands.registerCommand("gitguardian.openProblems", () => {
        vscode_1.commands.executeCommand("workbench.actions.view.problems");
    });
    context.subscriptions.push(showOutputCommand, openSidebarCommand, openProblemsCommand);
}
function activate(context) {
    const outputChannel = vscode_1.window.createOutputChannel("GitGuardian");
    let configuration = (0, ggshield_configuration_utils_1.getConfiguration)(context);
    const ggshieldResolver = new ggshield_resolver_1.GGShieldResolver(outputChannel, context, configuration);
    const ggshieldViewProvider = new gitguardian_webview_view_1.GitGuardianWebviewProvider(configuration, context.extensionUri, context);
    const ggshieldRemediationMessageViewProvider = new gitguardian_remediation_message_view_1.GitGuardianRemediationMessageWebviewProvider(configuration, context.extensionUri, context);
    const ggshieldQuotaViewProvider = new gitguardian_quota_webview_1.GitGuardianQuotaWebviewProvider(configuration, context.extensionUri, context);
    vscode_1.window.registerWebviewViewProvider("gitguardianView", ggshieldViewProvider);
    vscode_1.window.registerWebviewViewProvider("gitguardianRemediationMessageView", ggshieldRemediationMessageViewProvider);
    vscode_1.window.registerWebviewViewProvider("gitguardianQuotaView", ggshieldQuotaViewProvider);
    context.subscriptions.push(ggshieldViewProvider, ggshieldRemediationMessageViewProvider, ggshieldQuotaViewProvider);
    (0, gitguardian_status_bar_1.createStatusBarItem)(context);
    //generic commands to open correct view on status bar click
    registerOpenViewsCommands(context, outputChannel);
    vscode_1.commands.registerCommand("gitguardian.refreshQuota", ggshieldQuotaViewProvider.refresh);
    context.subscriptions.push(vscode_1.languages.registerHoverProvider("*", new gitguardian_hover_provider_1.GitGuardianSecretHoverProvider()));
    if (!(0, utils_1.checkGitInstalled)()) {
        (0, gitguardian_status_bar_1.updateStatusBarItem)(gitguardian_status_bar_1.StatusBarStatus.error);
        return;
    }
    ggshieldResolver.checkGGShieldConfiguration();
    // update authentication status
    (0, authentication_1.updateAuthenticationStatus)(context, configuration).then(() => {
        ggshieldViewProvider.refresh();
        ggshieldRemediationMessageViewProvider.refresh();
        ggshieldQuotaViewProvider.refresh();
    });
    // Start scanning documents on activation events
    // (i.e. when a new document is opened or when the document is saved)
    (0, ggshield_api_1.createDiagnosticCollection)(context);
    context.subscriptions.push(vscode_1.workspace.onDidSaveTextDocument((textDocument) => {
        // Check if the document is inside the workspace
        const workspaceFolder = vscode_1.workspace.getWorkspaceFolder(textDocument.uri);
        const authStatus = context.workspaceState.get("authenticationStatus");
        if (authStatus?.success && workspaceFolder) {
            (0, ggshield_api_1.scanFile)(textDocument.fileName, textDocument.uri, ggshieldResolver.configuration);
        }
    }), vscode_1.workspace.onDidCloseTextDocument((textDocument) => (0, ggshield_api_1.cleanUpFileDiagnostics)(textDocument.uri)), vscode_1.commands.registerCommand("gitguardian.quota", () => {
        (0, ggshield_api_1.showAPIQuota)(ggshieldResolver.configuration);
    }), vscode_1.commands.registerCommand("gitguardian.ignore", () => {
        (0, ggshield_api_1.ignoreLastFound)(ggshieldResolver.configuration);
        if (vscode_1.window.activeTextEditor) {
            (0, ggshield_api_1.cleanUpFileDiagnostics)(vscode_1.window.activeTextEditor?.document.uri);
        }
    }), vscode_1.commands.registerCommand("gitguardian.ignoreSecret", (diagnosticData) => {
        vscode_1.window.showInformationMessage("Secret ignored.");
        let currentFile = (0, utils_1.getCurrentFile)();
        let secretName = (0, gitguardian_hover_provider_1.generateSecretName)(currentFile, diagnosticData);
        (0, ggshield_api_1.ignoreSecret)(ggshieldResolver.configuration, diagnosticData.secretSha, secretName);
        (0, ggshield_api_1.scanFile)(currentFile, vscode_1.Uri.file(currentFile), ggshieldResolver.configuration);
    }), vscode_1.commands.registerCommand("gitguardian.authenticate", async () => {
        vscode_1.commands.executeCommand("gitguardian.openSidebar");
        await (0, authentication_1.loginGGShield)(ggshieldResolver.configuration, outputChannel, ggshieldViewProvider.getView(), context)
            .then(async () => {
            await (0, authentication_1.updateAuthenticationStatus)(context, configuration);
            ggshieldViewProvider.refresh();
            ggshieldRemediationMessageViewProvider.refresh();
            ggshieldQuotaViewProvider.refresh();
        })
            .catch((err) => {
            outputChannel.appendLine(`Authentication failed: ${err.message}`);
        });
    }), vscode_1.commands.registerCommand("gitguardian.logout", async () => {
        await (0, authentication_1.logoutGGShield)(ggshieldResolver.configuration, context);
        ggshieldViewProvider.refresh();
        ggshieldRemediationMessageViewProvider.refresh();
        ggshieldQuotaViewProvider.refresh();
    }), vscode_1.commands.registerCommand("gitguardian.updateAuthenticationStatus", async () => {
        await (0, authentication_1.updateAuthenticationStatus)(context, configuration);
        ggshieldViewProvider.refresh();
        ggshieldRemediationMessageViewProvider.refresh();
        ggshieldQuotaViewProvider.refresh();
    }));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map