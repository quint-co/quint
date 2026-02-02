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

export const RUST_EVALUATOR_VERSION = 'v0.4.0'

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
export async function getRustEvaluatorPath(version: string = RUST_EVALUATOR_VERSION): Promise<string> {
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
  let assetName = ''
  let executable = 'quint_evaluator'

  if (platform === 'darwin') {
    // macOS
    if (arch === 'arm64') {
      assetName = 'quint_evaluator-aarch64-apple-darwin.tar.gz'
    } else if (arch === 'x64') {
      assetName = 'quint_evaluator-x86_64-apple-darwin.tar.gz'
    }
  } else if (platform === 'linux') {
    if (arch === 'arm64') {
      assetName = 'quint_evaluator-aarch64-unknown-linux-gnu.tar.gz'
    } else if (arch === 'x64') {
      assetName = 'quint_evaluator-x86_64-unknown-linux-gnu.tar.gz'
    }
  } else if (platform === 'win32') {
    if (arch === 'x64') {
      assetName = 'quint_evaluator-x86_64-pc-windows-msvc.zip'
      executable = 'quint-evaluator.exe'
    }
  }

  if (!assetName) {
    throw new Error(`Unsupported platform or architecture: ${platform} ${arch} `)
  }

  return { assetName, executable }
}

async function exists(filePath: string): Promise<boolean> {
  const { stat } = require('fs/promises')
  return stat(filePath)
    .then(() => true)
    .catch(() => false)
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
      throw new Error(`Failed to fetch from GitHub: ${response.statusText}`)
    }

    return response
  }

  async fetchRelease(version: string): Promise<GitHubRelease> {
    const url = `https://api.github.com/repos/informalsystems/quint/releases`
    const response = await this.fetch(url, 'application/vnd.github.v3+json')
    const releases = (await response.json()) as GitHubRelease[]
    const release = releases.find(release => release.tag_name === `evaluator/${version}`)
    if (!release) {
      throw new Error(`Release ${version} not found`)
    }
    return release
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
