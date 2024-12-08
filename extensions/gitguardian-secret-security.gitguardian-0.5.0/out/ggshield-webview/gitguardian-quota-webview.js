"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitGuardianQuotaWebviewProvider = void 0;
const ggshield_api_1 = require("../lib/ggshield-api");
class GitGuardianQuotaWebviewProvider {
    constructor(ggshieldConfiguration, _extensionUri, context) {
        this.ggshieldConfiguration = ggshieldConfiguration;
        this._extensionUri = _extensionUri;
        this.context = context;
        this.quota = 0;
        this.isLoading = false;
        this.isAuthenticated = false;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        this.refresh();
        webviewView.onDidChangeVisibility(() => {
            if (webviewView.visible) {
                // Refresh the quota when the view becomes visible (e.g., after being collapsed and reopened)
                this.refresh();
            }
        });
    }
    updateQuota() {
        const authStatus = this.context.workspaceState.get("authenticationStatus");
        this.isAuthenticated = authStatus?.success ?? false;
        if (authStatus?.success) {
            this.quota = (0, ggshield_api_1.getAPIquota)(this.ggshieldConfiguration);
        }
    }
    updateWebViewContent() {
        if (this._view === undefined) {
            return;
        }
        let computedHtml;
        if (this.isLoading) {
            computedHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <body>
          <p>Loading...</p>
        </body>
        </html>`;
        }
        else if (this.quota !== undefined) {
            computedHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <body>
          <p>Your current quota: ${this.quota}</p>
        </body>
        </html>`;
        }
        else {
            computedHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <body>
            <p>Please authenticate to see your quota.</p>
        </body>
        </html>`;
        }
        this._view.webview.html = computedHtml;
    }
    refresh() {
        this.isLoading = true;
        this.updateWebViewContent();
        this.updateQuota();
        this.isLoading = false;
        this.updateWebViewContent();
    }
    dispose() {
        if (this._view) {
            this._view.webview.onDidReceiveMessage(() => { });
            this._view.webview.html = "";
            this._view = undefined;
        }
    }
}
exports.GitGuardianQuotaWebviewProvider = GitGuardianQuotaWebviewProvider;
GitGuardianQuotaWebviewProvider.viewType = "gitguardian.gitguardianQuotaView";
//# sourceMappingURL=gitguardian-quota-webview.js.map