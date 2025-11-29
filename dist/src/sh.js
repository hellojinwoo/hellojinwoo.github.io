"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sh = sh;
const child_process_1 = require("child_process");
/**
 * Execute simple shell command (async wrapper).
 * @param {String} cmd
 * @return {Object} { stdout: String, stderr: String }
 */
async function sh(cmd, panic = true) {
    return new Promise(function (resolve, reject) {
        (0, child_process_1.exec)(cmd, (err, stdout, stderr) => {
            if (err && panic) {
                reject(err);
            }
            else {
                resolve({ stdout, stderr });
            }
        });
    });
}
