const path = require('path')
const fs = require('fs')
const github = require('@actions/github')
const core = require('@actions/core')
const { getStatsDiff } = require('webpack-stats-diff')
const fileSize = require('filesize')
const markdownTable = require('markdown-table')

const doesPathExists = path => {
  if (!fs.existsSync(path)) {
    throw new Error(`${path} does not exist!`)
  }
}

async function run() {
  try {
    const statsPaths = {
      base: core.getInput('base_stats_path'),
      head: core.getInput('head_stats_path'),
    }

    const paths = {
      base: path.resolve(process.cwd(), statsPaths.base),
      head: path.resolve(process.cwd(), statsPaths.head),
    }

    doesPathExists(paths.base)
    doesPathExists(paths.head)

    const assets = {
      base: require(paths.base).assets,
      head: require(paths.head).assets,
    }

    const diff = getStatsDiff(assets.base, assets.head, {})

    const summaryTable = markdownTable([
      ['Old size', 'New size', 'Diff'],
      [
        fileSize(diff.total.oldSize),
        fileSize(diff.total.newSize),
        `${fileSize(diff.total.diff)} (${diff.total.diffPercentage.toFixed(
          2
        )}%)`,
      ],
    ])

    /**
     * Publish a comment in the PR with the diff result.
     */
    const octokit = github.getOctokit(core.getInput('token'))

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
