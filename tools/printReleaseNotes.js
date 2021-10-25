const { version, repository, name } = require('../package.json')
import boxen from 'boxen'
import chalk from 'chalk'
import { resolveFetch } from '../src/_util'

async function printReleaseNotes() {
  const releaseInfo = await resolveFetch()(
    `https://api.github.com/repos/${repository}/releases/tags/${version}`
  ).then(resp => resp.json())

  if (releaseInfo === undefined || releaseInfo.body === undefined) return

  const releaseNotes = releaseInfo.body
    .replace(/-/g, chalk.green(' - '))
    .replace(/\r\n/g, '\n')

  console.info(
    boxen(chalk.cyan(`${name}@${version} release notes: \n\n`) + releaseNotes, {
      padding: 1,
      borderColor: 'yellow',
    })
  )
}

printReleaseNotes()
