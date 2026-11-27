/* ----------------------------------------------------------------------------------
 * Copyright 2025 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Binary manager for the Rust evaluator.
 * Handles version management, downloading, and path resolution.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import path from 'path'
import os from 'os'
import chalk from 'chalk'
import { rustEvaluatorDir } from '../config'
import { releaseTarget } from '../download'

export const QUINT_EVALUATOR_VERSION = 'v0.8.0'

interface GitHubRelease {
  tag_name: string
  assets: GitHubAsset[]
}

interface GitHubAsset {
  name: string
  url: string
}

/**
 * Get the path to the Rust evaluator executable.
 * @param {string} version - The version of the evaluator.
 * @returns {string} The path to the Quint evaluator executable.
 * @throws Will throw an error if the evaluator is not found or cannot be downloaded.
 */
export async function getRustEvaluatorPath(version: string = QUINT_EVALUATOR_VERSION): Promise<string> {
  // Determine platform and architecture
  const platform = os.platform()
  const arch = os.arch()

  // Map platform and architecture to asset name
  let { assetName, executable } = inferAssetAndExecutableNames(platform, arch)

  // Check if the evaluator is already downloaded
  const evaluatorDir = rustEvaluatorDir(version)
  const executablePath = path.join(evaluatorDir, executable)
  if (await exists(executablePath)) {
    return executablePath
  }

  // Otherwise, fetch it from GitHub releases
  return await fetchEvaluator(version, assetName, executable)
}

/**
 *  Fetch the latest version of the Quint evaluator from GitHub releases.
 *  @param {string} version - The version of the evaluator to fetch.
 *  @param {string} assetName - The name of the asset to download.
 *  @param {string} executable - The name of the executable file.
 *  @return {Promise<string>} - The path to the downloaded evaluator executable.
 *  @throws Will throw an error if the download fails or the asset format is unsupported.
 */
async function fetchEvaluator(version: string, assetName: string, executable: string): Promise<string> {
  const { unlink, mkdir } = require('fs/promises')

  console.log(chalk.gray(`Fetching Rust evaluator ${version}...`))

  // Create a GitHub client
  const client = new GitHubClient()

  // Fetch the release from GitHub
  const release = await client.fetchRelease(version)

  const evaluatorDir = rustEvaluatorDir(version)
  const executablePath = path.join(evaluatorDir, executable)

  // Create the evaluator directory if it doesn't exist
  await mkdir(evaluatorDir, { recursive: true })

  // Download the asset from GitHub
  const assetPath = await downloadGitHubAsset(client, release, assetName, evaluatorDir)

  // Extract the asset
  await extractAsset(executable, assetName, assetPath, evaluatorDir)

  // Clean up the downloaded archive
  await unlink(assetPath)

  console.log(chalk.green(`  [ok] `) + `Rust evaluator installed at: ${executablePath}\n`)

  return executablePath
}

/**
 * Extract the downloaded asset to the evaluator directory.
 * @param {string} executable - The name of the executable file.
 * @param {string} assetName - The name of the asset to extract.
 * @param {string} assetPath - The path to the downloaded asset.
 * @param {string} evaluatorDir - The path to the evaluator directory.
 * @throws Will throw an error if the asset format is unsupported.
 */
async function extractAsset(executable: string, assetName: string, assetPath: string, evaluatorDir: string) {
  const util = require('util')
  const exec = util.promisify(require('child_process').exec)

  console.log(chalk.gray(`  Extracting ${assetPath}...`))

  const executablePath = path.join(evaluatorDir, executable)

  if (assetName.endsWith('.tar.gz')) {
    await exec(`tar -xzf ${assetPath} -C ${evaluatorDir} `)
    await exec(`chmod +x ${executablePath}`)
  } else if (assetName.endsWith('.zip')) {
    // For Windows, use a simple unzip command (requires unzip to be installed)
    // You might want to use a JavaScript unzip library for better compatibility
    const AdmZip = require('adm-zip')
    const zip = new AdmZip(assetPath)
    zip.extractAllTo(evaluatorDir, true)
  } else {
    throw new Error(`Unsupported asset format: ${assetName}`)
  }
}

/**
 * Download a GitHub asset from a release.
 * @param {GitHubClient} client - The GitHub client to use for downloading.
 * @param {GitHubRelease} release - The GitHub release object.
 * @param {string} assetName - The name of the asset to download.
 * @param {string} evaluatorDir - The directory to save the downloaded asset.
 * @returns {Promise<string>} - The path to the downloaded asset.
 * @throws Will throw an error if the download fails or the asset is not found.
 */
async function downloadGitHubAsset(
  client: GitHubClient,
  release: GitHubRelease,
  assetName: string,
  evaluatorDir: string
): Promise<string> {
  const version = release.tag_name
  const asset = release.assets.find(asset => asset.name === assetName)

  if (!asset) {
    throw new Error(`Asset ${assetName} not found in release ${version}`)
  }

  const assetPath = path.join(evaluatorDir, assetName)
  if (await exists(assetPath)) {
    console.log(chalk.gray(`File ${assetPath} already exists. Skipping download.`))
    return assetPath
  }

  // Download the asset
  return await client.downloadAsset(asset, assetPath)
}

function inferAssetAndExecutableNames(platform: string, arch: string): { assetName: string; executable: string } {
  const target = releaseTarget(platform, arch)
  if (target.isLeft()) {
    throw new Error(target.value)
  }
  const { triple, archive } = target.value
  return {
    assetName: `quint_evaluator-${triple}${archive}`,
    executable: platform === 'win32' ? 'quint_evaluator.exe' : 'quint_evaluator',
  }
}

async function exists(filePath: string): Promise<boolean> {
  const { stat } = require('fs/promises')
  return stat(filePath)
    .then(() => true)
    .catch(() => false)
}

/**
 * Explain how to build the evaluator `version` when it has no release on GitHub. This happens to a quint built from
 * the main branch, which may pin an evaluator that is newer than the latest release.
 */
function unreleasedEvaluatorMessage(version: string): string {
  const { executable } = inferAssetAndExecutableNames(os.platform(), os.arch())
  const evaluatorDir = rustEvaluatorDir(version)
  return [
    `Rust evaluator ${version} is not released yet. A quint built from the main branch may need an evaluator that is`,
    'newer than the latest release. Build it from your clone of the quint repository, and copy it to the folder',
    'where quint looks for it, by running these commands from the root of the clone:',
    '',
    '  cd evaluator',
    '  cargo build --release',
    `  mkdir -p ${evaluatorDir}`,
    `  cp target/release/${executable} ${evaluatorDir}/`,
  ].join('\n')
}

class GitHubClient {
  async fetch(url: string, accept: string): Promise<Response> {
    const options: any = {
      redirect: 'follow',
      follow: 10,
      headers: {
        'User-Agent': 'quint-evaluator-fetch',
        Accept: accept,
      },
    }

    const response = await fetch(url, options)
    if (!response.ok) {
      throw Object.assign(new Error(`Failed to fetch from GitHub: ${response.statusText}`), { status: response.status })
    }

    return response
  }

  async fetchRelease(version: string): Promise<GitHubRelease> {
    // Fetch the release by tag directly, instead of listing releases, which is
    // paginated and would eventually stop including older evaluator releases.
    const url = `https://api.github.com/repos/quint-co/quint/releases/tags/evaluator/${version}`
    try {
      const response = await this.fetch(url, 'application/vnd.github.v3+json')
      return (await response.json()) as GitHubRelease
    } catch (err: any) {
      if (err.status === 404) {
        throw new Error(unreleasedEvaluatorMessage(version))
      }
      throw new Error(`Release ${version} not found: ${err}`)
    }
  }

  async downloadAsset(asset: GitHubAsset, path: string): Promise<string> {
    const fs = require('fs')
    const { unlink } = require('fs/promises')
    const { Readable } = require('stream')
    const { finished } = require('stream/promises')

    const fileStream = fs.createWriteStream(path, { mode: 0o755, flags: 'wx' })

    // Download the asset
    console.log(chalk.gray(`  Downloading Rust evaluator from ${asset.url}...`))

    try {
      const response = await this.fetch(asset.url, 'application/octet-stream')

      if (!response.ok) {
        throw new Error(`Failed to download Rust evaluator: ${response.statusText}`)
      }

      await finished(Readable.fromWeb(response.body).pipe(fileStream))
    } catch (err) {
      await unlink(path).catch(() => {})
      throw err
    }

    return path
  }
}
