#!/usr/bin/env node
console.log("Running Boring")

async function main() {
    console.log(process.argv)
}

main()
    .then(() => process.exit(process.exitCode))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });