"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginForm = void 0;
const vscode_1 = require("vscode");
const axios_1 = require("../plugins/axios");
function LoginForm(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const title = "Snippit";
        function startLoginProcess(state) {
            return __awaiter(this, void 0, void 0, function* () {
                // const state = {} as Partial<State>;
                yield MultiStepInput.run(input => startLogin(input, state));
                return state;
            });
        }
        function startLogin(input, state) {
            return __awaiter(this, void 0, void 0, function* () {
                state.username = yield input.showInputBox({
                    title,
                    step: 1,
                    totalSteps: 2,
                    value: typeof state.username === "string" ? state.username : "",
                    prompt: "Enter username or email address",
                    validate: validateUsernameOrEmailExists,
                    shouldResume: shouldResume
                });
                return (input) => startLoginPassword(input, state);
            });
        }
        function startLoginPassword(input, state) {
            return __awaiter(this, void 0, void 0, function* () {
                state.password = yield input.showInputBox({
                    title,
                    step: 2,
                    totalSteps: 2,
                    value: typeof state.password === "string" ? state.password : "",
                    prompt: "Enter password",
                    validate: validatePasswordInput,
                    shouldResume: shouldResume
                });
                attemptLogin(state);
                // return (input: MultiStepInput) => inputName(input, state);
            });
        }
        function attemptLogin(state) {
            return __awaiter(this, void 0, void 0, function* () {
                const { username, password } = state;
                axios_1.default.post('login', { email: username, password })
                    .then((response) => {
                    context.globalState.update('token', response.token); // eslint-disable-line
                })
                    .catch((e) => __awaiter(this, void 0, void 0, function* () {
                    vscode_1.window.showErrorMessage("Failed to login, details incorrect!");
                    state.password = "";
                    const s = yield startLoginProcess(state);
                })).finally(() => {
                    // console.log(context.globalState.get('token'));
                });
            });
        }
        function shouldResume() {
            // Could show a notification with the option to resume.
            return new Promise((resolve, reject) => { });
        }
        function validateUsernameOrEmailExists(username) {
            return __awaiter(this, void 0, void 0, function* () {
                yield new Promise(resolve => setTimeout(resolve, 1000));
                const regexp = new RegExp('/^(([^<>()[]\\.,;:s@"]+(.[^<>()[]\\.,;:s@"]+)*)|(".+"))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/');
                return !username.includes("@") ? "Username or Email is invalid" : undefined;
            });
        }
        function validatePasswordInput(password) {
            return __awaiter(this, void 0, void 0, function* () {
                yield new Promise(resolve => setTimeout(resolve, 1000));
                return password.length < 8 ? "Password is invalid" : undefined;
            });
        }
        yield startLoginProcess({});
    });
}
exports.LoginForm = LoginForm;
// -------------------------------------------------------
// Helper code that wraps the API for the multi-step case.
// -------------------------------------------------------
class InputFlowAction {
    constructor() { }
}
InputFlowAction.back = new InputFlowAction();
InputFlowAction.cancel = new InputFlowAction();
InputFlowAction.resume = new InputFlowAction();
class MultiStepInput {
    constructor() {
        this.steps = [];
    }
    static run(start) {
        return __awaiter(this, void 0, void 0, function* () {
            const input = new MultiStepInput();
            return input.stepThrough(start);
        });
    }
    stepThrough(start) {
        return __awaiter(this, void 0, void 0, function* () {
            let step = start;
            while (step) {
                this.steps.push(step);
                if (this.current) {
                    this.current.enabled = false;
                    this.current.busy = true;
                }
                try {
                    step = yield step(this);
                }
                catch (err) {
                    if (err === InputFlowAction.back) {
                        this.steps.pop();
                        step = this.steps.pop();
                    }
                    else if (err === InputFlowAction.resume) {
                        step = this.steps.pop();
                    }
                    else if (err === InputFlowAction.cancel) {
                        step = undefined;
                    }
                    else {
                        throw err;
                    }
                }
            }
            if (this.current) {
                this.current.dispose();
            }
        });
    }
    showInputBox({ title, step, totalSteps, value, prompt, validate, buttons, shouldResume }) {
        return __awaiter(this, void 0, void 0, function* () {
            const disposables = [];
            try {
                return yield new Promise((resolve, reject) => {
                    const input = vscode_1.window.createInputBox();
                    input.title = title;
                    input.step = step;
                    input.totalSteps = totalSteps;
                    input.value = value || "";
                    input.prompt = prompt;
                    input.buttons = [
                        ...(this.steps.length > 1 ? [vscode_1.QuickInputButtons.Back] : []),
                        ...(buttons || [])
                    ];
                    let validating = validate("");
                    disposables.push(input.onDidTriggerButton(item => {
                        if (item === vscode_1.QuickInputButtons.Back) {
                            reject(InputFlowAction.back);
                        }
                        else {
                            resolve(item);
                        }
                    }), input.onDidAccept(() => __awaiter(this, void 0, void 0, function* () {
                        const value = input.value;
                        input.enabled = false;
                        input.busy = true;
                        if (!(yield validate(value))) {
                            resolve(value);
                        }
                        input.enabled = true;
                        input.busy = false;
                    })), input.onDidChangeValue((text) => __awaiter(this, void 0, void 0, function* () {
                        const current = validate(text);
                        validating = current;
                        const validationMessage = yield current;
                        if (current === validating) {
                            input.validationMessage = validationMessage;
                        }
                    })), input.onDidHide(() => {
                        (() => __awaiter(this, void 0, void 0, function* () {
                            reject(shouldResume && (yield shouldResume())
                                ? InputFlowAction.resume
                                : InputFlowAction.cancel);
                        }))().catch(reject);
                    }));
                    if (this.current) {
                        this.current.dispose();
                    }
                    this.current = input;
                    this.current.show();
                });
            }
            finally {
                disposables.forEach(d => d.dispose());
            }
        });
    }
}
//# sourceMappingURL=login_form.js.map