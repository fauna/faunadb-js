const path = require('path')
const github = require('@actions/github')
const core = require('@actions/core')
const { diff, generateReport } = require('webpack-bundle-diff')

async function run() {
  try {
    const stats = {
      base: require(path.resolve(process.cwd(), process.env.base_stats_path)),
      head: require(path.resolve(process.cwd(), process.env.head_stats_path)),
    }

    const summaryTable = generateReport(diff(stats.base, stats.head))

    const octokit = github.getOctokit(process.env.token)

    const pullRequestId = github.context.issue.number
    if (!pullRequestId) {
      throw new Error('Cannot find the PR id.')
    }

    await octokit.issues.createComment({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: pullRequestId,
      body: `## Bundle difference
    ${summaryTable}
    `,
    })
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
