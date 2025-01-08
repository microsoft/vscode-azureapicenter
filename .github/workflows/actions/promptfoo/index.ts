import * as core from '@actions/core';
import * as github from '@actions/github';
import * as fs from 'fs';
import * as path from 'path';

import type { OutputFile } from 'promptfoo';

export async function run(): Promise<void> {
    try {
        const githubToken: string = core.getInput('github-token', { required: true });
        const pullRequest = github.context.payload.pull_request;
        core.setSecret(githubToken);

        const event = github.context.eventName;
        if (event !== 'pull_request') {
            core.warning(
                `This action is designed to run on pull request events only, but a "${event}" event was received.`,
            );
        }
        let errorToThrow: Error | undefined;

        // collect results
        let commentContent: string = '';
        const directories = fs.readdirSync(process.cwd(), { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const dir of directories) {
            const outputFile = path.join(path.join(process.cwd(), dir), 'output.json');
            const output = JSON.parse(
                fs.readFileSync(outputFile, 'utf8'),
            ) as OutputFile;
            let body = `⚠️ LLM prompt was modified in these files: ${dir}

    | Success | Failure |
    |---------|---------|
    | ${output.results.stats.successes}      | ${output.results.stats.failures}       |

    `;
            if (output.shareableUrl) {
                body = body.concat(`**» [View eval results](${output.shareableUrl}) «**`);
            } else {
                body = body.concat('**» View eval results in CI console «**');
            }
            commentContent += body + "\n\n";
        }

        // Comment PR
        const octokit = github.getOctokit(githubToken);
        await octokit.rest.issues.createComment({
            ...github.context.repo,
            issue_number: pullRequest.number,
            commentContent,
        });

        if (errorToThrow) {
            throw errorToThrow;
        }
    } catch (error) {
        if (error instanceof Error) {
            handleError(error);
        } else {
            handleError(new Error(String(error)));
        }
    }
}

export function handleError(error: Error): void {
    core.setFailed(error.message);
}

if (require.main === module) {
    run();
}
