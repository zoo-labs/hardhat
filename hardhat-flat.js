const { task, subtask, types } = require("hardhat/config");
const fs = require("fs")

function getSortedFiles(dependenciesGraph) {
    const tsort = require("tsort")
    const graph = tsort()

    const filesMap = {}
    const resolvedFiles = dependenciesGraph.getResolvedFiles()
    resolvedFiles.forEach((f) => (filesMap[f.sourceName] = f))

    for (const [from, deps] of dependenciesGraph.entries()) {
        for (const to of deps) {
            graph.add(to.sourceName, from.sourceName)
        }
    }

    const topologicalSortedNames = graph.sort()

    // If an entry has no dependency it won't be included in the graph, so we
    // add them and then dedup the array
    const withEntries = topologicalSortedNames.concat(resolvedFiles.map((f) => f.sourceName))

    const sortedNames = [...new Set(withEntries)]
    return sortedNames.map((n) => filesMap[n])
}

function getFileWithoutImports(resolvedFile) {
    const IMPORT_SOLIDITY_REGEX = /^\s*import(\s+)[\s\S]*?;\s*$/gm

    return resolvedFile.content.rawContent.replace(IMPORT_SOLIDITY_REGEX, "").trim()
}

subtask("flat:get-flattened-sources", "Returns all contracts and their dependencies flattened")
    .addOptionalParam("files", undefined, undefined, types.any)
    .addOptionalParam("output", undefined, undefined, types.string)
    .setAction(async ({ files, output }, { run }) => {
        const dependencyGraph = await run("flat:get-dependency-graph", { files })

        let flattened = ""

        if (dependencyGraph.getResolvedFiles().length === 0) {
            return flattened
        }

        const sortedFiles = getSortedFiles(dependencyGraph)

        let isFirst = true
        for (const file of sortedFiles) {
            if (!isFirst) {
                flattened += "\n"
            }
            flattened += `// File ${file.getVersionedName()}\n`
            flattened += `${getFileWithoutImports(file)}\n`

            isFirst = false
        }

        // Remove every line started with "// SPDX-License-Identifier:"
        flattened = flattened.replace(/SPDX-License-Identifier:/gm, "License-Identifier:")

        flattened = `// SPDX-License-Identifier: MIXED\n\n${flattened}`

        // Remove every line started with "pragma experimental ABIEncoderV2;" except the first one
        flattened = flattened.replace(
            /pragma experimental ABIEncoderV2;\n/gm,
            (
                (i) => (m) =>
                    !i++ ? m : ""
            )(0)
        )

        flattened = flattened.trim()
        if (output) {
            console.log("Writing to", output)
            fs.writeFileSync(output, flattened)
            return ""
        }
        return flattened
    })

subtask("flat:get-dependency-graph")
    .addOptionalParam("files", undefined, undefined, types.any)
    .setAction(async ({ files }, { run }) => {
        const sourcePaths = files === undefined ? await run("compile:solidity:get-source-paths") : files.map((f) => fs.realpathSync(f))

        const sourceNames = await run("compile:solidity:get-source-names", {
            sourcePaths,
        })

        const dependencyGraph = await run("compile:solidity:get-dependency-graph", { sourceNames })

        return dependencyGraph
    })

task("flat", "Flattens and prints contracts and their dependencies")
    .addOptionalVariadicPositionalParam("files", "The file or contract name to flatten", undefined, types.string)
    .addOptionalParam("output", "Specify the output file", undefined, types.string)
    .setAction(async ({ files, output }, { run }) => {
        if (!output) {
            output = "./flat/" + files[0] + ".sol"
        }
        files = files.map((file) => {
            return file.endsWith(".sol")
                ? file
                : "./contracts/" + file + ".sol"
        })
        await run("flat:get-flattened-sources", {
            files,
            output,
        })
    })