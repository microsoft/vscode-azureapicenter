const path = require('path');
const fs = require('fs');
const rootPath = path.join(__dirname, "..", "..", "..");
const evalPromptDir = path.join(rootPath, "evalprompt");
// collect results
let commentContent = '';
const directories = fs.readdirSync(evalPromptDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
console.log(directories);
for (const dir of directories) {
    const outputFile = path.join(path.join(evalPromptDir, dir), 'output.json');
    const baselineFile = path.join(path.join(evalPromptDir, dir), 'baseline.json');
    if (outputFile == null || !fs.existsSync(outputFile))
        continue;
    console.log(outputFile);
    const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));

    let body = ` LLM prompt result for ${dir}

| From | Success | Failure |
|---------|---------|---------|
| Output | ${output.results.stats.successes} | ${output.results.stats.failures} |
`;
    if (baseline == null || !fs.existsSync(baselineFile)) {
        const output = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
        let body = '';
        body += `|Baseline| ${baseline.successes} | ${baseline.failures} |
        `
        if (baseline.successes < output.results.stats.successes || baseline.failures > output.results.stats.failures || baseline.score > outputFile.results.prompts.metrics.score) {
            body = `[Not PASS]🚨 ` + body;
        } else {
            body = `[PASS]✅ ` + body;
        }
    }
    if (output.shareableUrl) {
        body = body.concat(`**» [View eval results](${output.shareableUrl}) «**`);
    } else {
        body = body.concat('**» View eval results in CI console «**');
    }
    commentContent += body + "\n\n";
}

fs.writeFileSync(path.join(rootPath, 'commentContent.txt'), commentContent, 'utf-8');
