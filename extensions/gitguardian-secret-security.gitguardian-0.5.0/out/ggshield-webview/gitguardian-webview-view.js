"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitGuardianWebviewProvider = void 0;
const vscode = require("vscode");
const authentication_1 = require("../lib/authentication");
const projectDiscussionUri = vscode.Uri.parse("https://github.com/GitGuardian/gitguardian-vscode/discussions");
const projectIssuesUri = vscode.Uri.parse("https://github.com/GitGuardian/gitguardian-vscode/issues");
const feedbackFormUri = vscode.Uri.parse("https://docs.google.com/forms/d/e/1FAIpQLSc_BemGrdQfxp6lg7KgeDoB32XZg8yMfapk2gbemu0mVfskDQ/viewform");
const documentationUri = vscode.Uri.parse("https://docs.gitguardian.com/ggshield-docs/configuration");
class GitGuardianWebviewProvider {
    constructor(ggshieldConfiguration, _extensionUri, context) {
        this.ggshieldConfiguration = ggshieldConfiguration;
        this._extensionUri = _extensionUri;
        this.context = context;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this._extensionUri, "media"),
                vscode.Uri.joinPath(this._extensionUri, "images"),
            ],
        };
        this.updateWebViewContent();
        webviewView.webview.onDidReceiveMessage(async (data) => {
            await vscode.commands.executeCommand(`gitguardian.${data.type}`);
        });
    }
    getView() {
        return this._view;
    }
    updateWebViewContent() {
        const authenticationStatus = this.context.workspaceState.get("authenticationStatus");
        if (this._view === undefined || authenticationStatus === undefined) {
            return;
        }
        const webview = this._view.webview;
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "main.css"));
        const logoUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "images", "gitguardian-icon-primary700-background.svg"));
        console.log(authenticationStatus);
        let computedHtml;
        if (authenticationStatus?.success) {
            computedHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="${styleUri}" rel="stylesheet">
          <title>GitGuardian - Authenticated</title>
        </head>
        <body>
          <h1>✅ The extension is active!</strong></h1>
          <p>This initial version scans your active document upon saving, whether manually or automatically.</p>
          <p>Stay tuned for more features coming soon!</p>

          <h1>Build with us !</h1>
          <p>As we are in the v0.x release phase, our focus is on developing v1 incrementally and collaboratively with our users (you).</p>
          <p><strong>Build with us ! Your feedback is essential to us during this process.</strong></p>
          
          <p><a href="${projectDiscussionUri}" target="_blank">👉 Join the discussion: share feedback, ideas, and vote</a></p>
          <p><a href="${projectIssuesUri}" target="_blank">👉 Report any issues you encounter</a></p>
          <p><a href="${feedbackFormUri}" target="_blank">👉 Provide anonymous feedback</a></p>
        </body>
        </html>`;
        }
        else if (authenticationStatus === undefined ||
            authenticationStatus.keySource === authentication_1.ConfigSource.noKeyFound) {
            computedHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="${styleUri}" rel="stylesheet">
          <title>GitGuardian - Welcome</title>
        </head>
        <body>
          <div class="anonymous">
            <img src="${logoUri}" alt="GitGuardian Logo" height="100px"; />
            <h1 style="margin-bottom:0px;">Welcome to GitGuardian</h1>
            <p>Protect your code from secrets leakage</p>
            <button class="button large" id="authenticate">Link your IDE to your account</button>
            
            <p id="authMessage" style="display:none;">
              If your browser doesn't open automatically, <a id="authLink" href="#" target="_blank">click here</a>.
            </p>
          </div>

          <script>
            const vscode = acquireVsCodeApi();
            
            // Button click event to trigger authentication
            document.getElementById('authenticate').addEventListener('click', () => {
              vscode.postMessage({ type: 'authenticate' });
            });
            
            // Listener for authentication link
            window.addEventListener('message', event => {
              const message = event.data;
              
              if (message.type === 'authLink') {
                const authMessage = document.getElementById('authMessage');
                const authLink = document.getElementById('authLink');
                authLink.href = message.link;  // Set the authentication link
                authMessage.style.display = 'block';  // Show the message
              }
            });
          </script>
        </body>
        </html>
    `;
        }
        else {
            computedHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="${styleUri}" rel="stylesheet">
          <title>GitGuardian - Authentication Error</title>
        </head>
        <body>
          <div class="anonymous">
            <h1>❌ Authentication failed.</strong></h1>
            <img src="${logoUri}" alt="GitGuardian Logo" height="100px"; />

          </div>
          <p>Invalid API key for instance "${authenticationStatus.instance}".</p>
          <p>Instance source: ${authenticationStatus.instanceSource}.</p>
          <p>API key source: ${authenticationStatus.keySource}.</p>
          ${authenticationStatus.keySource === authentication_1.ConfigSource.keyGGShieldConfig
                ? `
            <p>To generate a valid key, please <a id="logout" href="">log out</a> and log back in.</p>
            <script>
            const vscode = acquireVsCodeApi();
            
            // On click event, logout
            document.getElementById('logout').addEventListener('click', () => {
              vscode.postMessage({ type: 'logout' });
            });
          </script>`
                : `<p>Please change your settings then <a id='updateAuthenticationStatus' href=''>click here</a> or reload this window.</p>
              <script>
              const vscode = acquireVsCodeApi();
              
              // On click event, update the auth status
              document.getElementById('updateAuthenticationStatus').addEventListener('click', () => {
                vscode.postMessage({ type: 'updateAuthenticationStatus' });
              });
            </script>`}
          <p>For more information, please refer to our <a href="${documentationUri}">documentation</a>.</p>
        </body>
        </html>`;
        }
        this._view.webview.html = computedHtml;
    }
    refresh() {
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
exports.GitGuardianWebviewProvider = GitGuardianWebviewProvider;
GitGuardianWebviewProvider.viewType = "gitguardian.gitguardianView";
//# sourceMappingURL=gitguardian-webview-view.js.map