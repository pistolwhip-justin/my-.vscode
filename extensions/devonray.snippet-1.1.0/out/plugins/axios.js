"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const vscode_1 = require("vscode");
axios_1.default.defaults.baseURL = "http://tackk.api.localdev:6961/api/";
axios_1.default.interceptors.request.use(config => {
    config.headers["X-Requested-With"] = "XMLHttpRequest";
    config.headers["Accept"] = "application/json";
    return config;
}, err => {
    return Promise.reject(err);
});
axios_1.default.interceptors.response.use(response => {
    // if (response.headers.authorization) {
    //   let match = response.headers.authorization.match(/Bearer (.+)/)
    //   if (match) localStorage.setItem('token', match[1])
    // }
    return response.data;
}, err => {
    console.log(err);
    if (err.response.status === 401) {
        vscode_1.window.showErrorMessage("You have been logged out, please login again");
        vscode_1.commands.executeCommand('extension.login');
    }
    return Promise.reject(err);
});
exports.default = axios_1.default;
//# sourceMappingURL=axios.js.map