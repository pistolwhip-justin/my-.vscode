"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitGuardianRemediationMessageWebviewProvider = void 0;
class GitGuardianRemediationMessageWebviewProvider {
    constructor(ggshieldConfiguration, _extensionUri, context) {
        this.ggshieldConfiguration = ggshieldConfiguration;
        this._extensionUri = _extensionUri;
        this.context = context;
        this.isAuthenticated = false;
        this.remediationMessage = "";
        this.isLoading = false;
        this.updateRemediationMessage();
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        this.refresh();
        webviewView.onDidChangeVisibility(() => {
            if (webviewView.visible) {
                // Refresh when the view becomes visible (e.g., after being collapsed and reopened)
                this.refresh();
            }
        });
    }
    checkAuthenticationStatus() {
        this.isAuthenticated = this.context.workspaceState.get("authenticationStatus", false);
    }
    updateRemediationMessage() {
        if (this.isAuthenticated) {
            //TODO: Get remediation message
            this.remediationMessage = "";
        }
    }
    updateWebViewContent(webviewView) {
        if (webviewView) {
            webviewView.webview.html = this.getHtmlForWebview();
        }
    }
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    getHtmlForWebview() {
        if (this.isLoading) {
            return `
        <!DOCTYPE html>
        <html lang="en">
        <body>
          <p>Loading...</p>
        </body>
        </html>`;
        }
        if (this.isAuthenticated) {
            return `
        <!DOCTYPE html>
        <html lang="en">
        <body>
          <pre style="white-space:pre-wrap">
${this.escapeHtml(this.remediationMessage)}
          </pre>
        </body>
        </html>`;
        }
        else {
            return `
        <!DOCTYPE html>
        <html lang="en">
        <body>
            <p>Please authenticate to see your personalized remediation message.</p>
        </body>
        </html>`;
        }
    }
    refresh() {
        this.isLoading = true;
        this.updateWebViewContent(this._view);
        this.checkAuthenticationStatus();
        console.log("Well authenticated");
        this.updateRemediationMessage();
        this.isLoading = false;
        this.updateWebViewContent(this._view);
    }
    dispose() {
        if (this._view) {
            this._view.webview.onDidReceiveMessage(() => { });
            this._view.webview.html = "";
            this._view = undefined;
        }
    }
}
exports.GitGuardianRemediationMessageWebviewProvider = GitGuardianRemediationMessageWebviewProvider;
GitGuardianRemediationMessageWebviewProvider.viewType = "gitguardian.gitguardianRemediationMessageView";
//# sourceMappingURL=gitguardian-remediation-message-view.js.map