#!/usr/bin/env node
const fs = require("fs")
const util = require('util');
const exec = util.promisify(require('child_process').exec);
console.log("Running Boring")

async function run(command) {
    const { stdout, stderr } = await exec(command)
    console.log(`stdout: ${stdout}`)
    if (stderr) {
        console.log(`stderr: ${stderr}`)
    }
}

function makedir(dir) {
    if (!fs.existsSync(rootPath + dir)){
        fs.mkdirSync(rootPath + dir);
    }    
}

function copy(from, to, overwrite) {
    if (overwrite || !fs.existsSync(rootPath + to)){
        fs.copyFileSync(__dirname + from, rootPath + to)
    }    

}

async function init() {
    const rootPath = require.main.paths[0].split('node_modules')[0];

    makedir(".vscode")
    makedir("contracts")
    makedir("scripts")
    makedir("test")
    makedir("flat")
    copy("/project/.vscode/settings.json", ".vscode/settings.json", false)
    copy("/project/contracts/Greeter.sol", "contracts/Greeter.sol", false)
    copy("/project/scripts/deploy.txt", "scripts/deploy.ts", false)
    copy("/project/test/index.txt", "test/index.ts", false)
    copy("/project/.eslintignore", ".eslintignore", false)
    copy("/project/.eslintrc.js", ".eslintrc.js", false)
    copy("/project/.gitignore", ".gitignore", false)
    copy("/project/.npmignore", ".npmignore", false)
    copy("/project/.prettierignore", ".prettierignore", false)
    copy("/project/.prettierrc.js", ".prettierrc.js", false)
    copy("/project/.solcover.js", ".solcover.js", false)
    copy("/project/.solhint.json", ".solhint.json", false)
    copy("/project/.solhintignore", ".solhintignore", false)
    copy("/project/hardhat.config.txt", "hardhat.config.ts", false)
    copy("/project/tsconfig.txt", "tsconfig.json", false)

    makedir("web3")
    makedir("web3/assets")
    makedir("web3/components")
    makedir("web3/public")
    copy("/project/web3/public/favicon.ico", "web3/public/favicon.ico", false)
    copy("/project/web3/assets/logo.png", "web3/assets/logo.png", false)
    copy("/project/web3/components/HelloWorld.vue", "web3/components/HelloWorld.vue", false)
    copy("/project/web3/App.vue", "web3/App.vue", false)
    copy("/project/web3/env.d.ts", "web3/env.d.ts", false)
    copy("/project/web3/main.ts", "web3/main.ts", false)
    copy("/project/web3/tsconfig.json", "web3/tsconfig.json", false)
    copy("/project/web3/tsconfig.node.json", "web3/tsconfig.node.json", false)
    copy("/project/web3/vite.config.ts", "web3/vite.config.ts", false)
    copy("/project/web3/index.html", "web3/index.html", false)

    const json = require(rootPath + 'package.json');
    
    if (!json.hasOwnProperty('scripts')) {
      json.scripts = {};
    }
    
    json.scripts['compile'] = 'hardhat compile';
    json.scripts['test'] = 'hardhat test';
    json.scripts['coverage'] = 'hardhat coverage && open-cli ./coverage/index.html';
    json.scripts['prettier'] = 'prettier --write *.js *.ts *.json test/**/*.ts contracts/**/*.sol';
    json.scripts['flat'] = 'hardhat run scripts/flat.ts Greeter.sol';
    json.scripts['dev'] = "vite --config web3/vite.config.ts";
    json.scripts['build'] = "vue-tsc --noEmit && vite build";
    json.scripts['preview'] = "vite preview";
    fs.writeFileSync(rootPath + 'package.json', JSON.stringify(json, null, 4));

    await run("npx husky-init")
    await run('yarn husky set .husky/pre-commit "npx pretty-quick --staged"')
    await run("yarn compile") // create typechain dir and files
}

async function add(name) {
    const rootPath = require.main.paths[0].split('node_modules')[0];

    fs.writeFileSync(rootPath + "contracts/" + name + ".sol", 
`//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

contract ` + name + ` {
    constructor() {
    }
}
`)
    fs.writeFileSync(rootPath + "test/" + name + ".ts",
`import { expect } from "chai";
import { ethers } from "hardhat";
import { ` + name + `__factory } from "../typechain-types";

describe("` + name + `", function () {
  it("Should do something", async function () {
    const deployer = (await ethers.getSigners())[0]
    const ` + name.toLowerCase() + ` = await new ` + name + `__factory(deployer).deploy();
    await ` + name.toLowerCase() + `.deployed();
  });
});
`)
}

async function main() {
    if (process.argv[2] == "init") {
        await init()
    }
    if (process.argv[2] == "add") {
        await add(process.argv[3])
    }
}

main()
    .then(() => process.exit(process.exitCode))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });