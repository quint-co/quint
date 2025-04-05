/* ----------------------------------------------------------------------------------
 * Copyright 2025 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * A wrapper around the Rust simulator for Quint.
 *
 * @author Gabriela Moreira
 *
 * @module
 */
import { QuintEx, QuintModule } from './ir/quintIr'
import { Outcome } from './simulation'
import { debugLog } from './verbosity'
import JSONbig from 'json-bigint'
import { LookupTable } from './names/base'
import { replacer } from './jsonHelper'
import { ofItf } from './itf'
const spawn = require('cross-spawn')

import path from 'path'
import os from 'os'
import chalk from 'chalk'

const QUINT_SIMULATOR_VERSION = 'v0.0.0-pre.1'

export type ParsedQuint = {
  modules: QuintModule[]
  table: LookupTable
  main: string
  init: QuintEx
  step: QuintEx
  invariant: QuintEx
}

export class QuintRustWrapper {
  private verbosityLevel: number

  /**
   * Constructor for QuintRustWrapper.
   * @param {number} verbosityLevel - The level of verbosity for logging.
   */
  constructor(verbosityLevel: number) {
    this.verbosityLevel = verbosityLevel
  }

  /**
   * Simulate the parsed Quint model using the Rust simulator
   *
   * @param {ParsedQuint} parsed - The parsed Quint model.
   * @param {string} source - The source code of the Quint model.
   * @param {QuintEx[]} witnesses - The witnesses for the simulation.
   * @param {number} nruns - The number of runs for the simulation.
   * @param {number} nsteps - The number of steps per run.
   * @param {number} ntraces - The number of traces to store.
   *
   * @returns {Outcome} The outcome of the simulation.
   * @throws Will throw an error if the Rust simulator fails to launch or returns an error.
   */
  async simulate(
    parsed: ParsedQuint,
    source: string,
    witnesses: QuintEx[],
    nruns: number,
    nsteps: number,
    ntraces: number
  ): Promise<Outcome> {
    const exe = await getRustSimulatorPath()
    const args = ['simulate-from-stdin']
    const input = JSONbig.stringify(
      {
        parsed: parsed,
        source: source,
        witnesses: witnesses,
        nruns: nruns,
        nsteps: nsteps,
        ntraces: ntraces,
      },
      replacer
    )

    debugLog(this.verbosityLevel, 'Starting Rust simulator synchronously')
    const result = spawn.sync(exe, args, {
      shell: false,
      input: input,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', process.stderr], // stdin, stdout, stderr
    })

    if (result.error) {
      throw new Error(`Failed to launch Rust simulator: ${result.error.message}`)
    }

    if (result.status !== 0) {
      throw new Error(`Rust simulator exited with code ${result.status}`)
    }

    if (!result.stdout) {
      throw new Error('No output received from Rust simulator')
    }

    debugLog(this.verbosityLevel, `Received data from Rust simulator: ${result.stdout}`)

    try {
      const parsed = JSONbig.parse(result.stdout)
      if (parsed.error) {
        throw new Error(parsed.error)
      }

      // Convert traces to ITF
      parsed.bestTraces = parsed.bestTraces.map((trace: any) => ({ ...trace, states: ofItf(trace.states) }))

      return parsed
    } catch (error) {
      throw new Error(`Failed to parse data from Rust simulator: ${JSONbig.stringify(error)}`)
    }
  }
}

interface GitHubRelease {
  tag_name: string
  assets: GitHubAsset[]
}

interface GitHubAsset {
  name: string
  url: string
}

/**
 * Get the configuration directory for Quint.
 * @returns {string} The path to the Quint configuration directory.
 */
function quintConfigDir(): string {
  return path.join(os.homedir(), '.quint')
}

/**
 * Get the path to the Rust simulator executable.
 * @param {string} version - The version of the simulator.
 * @returns {string} The path to the Quint simulator executable.
 */
function rustSimulatorDir(version: string): string {
  return path.join(quintConfigDir(), `rust-simulator-${version}`)
}

/**
 * Get the path to the Rust simulator executable.
 * @param {string} version - The version of the simulator.
 * @returns {string} The path to the Quint simulator executable.
 * @throws Will throw an error if the simulator is not found or cannot be downloaded.
 */
async function getRustSimulatorPath(version: string = QUINT_SIMULATOR_VERSION): Promise<string> {
  const path = require('path')

  // Determine platform and architecture
  const platform = os.platform()
  const arch = os.arch()

  // Map platform and architecture to asset name
  let { assetName, executable } = inferAssetAndExecutableNames(platform, arch)

  // Check if the simulator is already downloaded
  const simulatorDir = rustSimulatorDir(version)
  const executablePath = path.join(simulatorDir, executable)
  if (await exists(executablePath)) {
    return executablePath
  }

  // Otherwise, fetch it from GitHub releases
  return await fetchSimulator(version, assetName, executable)
}

/**
 *  Fetch the latest version of the Quint simulator from GitHub releases.
 *  @param {string} version - The version of the simulator to fetch.
 *  @param {string} assetName - The name of the asset to download.
 *  @param {string} executable - The name of the executable file.
 *  @return {Promise<string>} - The path to the downloaded simulator executable.
 *  @throws Will throw an error if the download fails or the asset format is unsupported.
 */
async function fetchSimulator(version: string, assetName: string, executable: string): Promise<string> {
  const path = require('path')
  const { unlink, mkdir } = require('fs/promises')

  console.log(chalk.gray(`Fetching Rust simulator ${version}...`))

  // Create a GitHub client
  const client = new GitHubClient(process.env.GITHUB_TOKEN)

  // Fetch the release from GitHub
  const release = await client.fetchRelease(version)

  const simulatorDir = rustSimulatorDir(version)
  const executablePath = path.join(simulatorDir, executable)

  // Create the simulator directory if it doesn't exist
  await mkdir(simulatorDir, { recursive: true })

  // Download the asset from GitHub
  const assetPath = await downloadGitHubAsset(client, release, assetName, simulatorDir)

  // Extract the asset
  await extractAsset(executable, assetName, assetPath, simulatorDir)

  // Clean up the downloaded archive
  await unlink(assetPath)

  console.log(chalk.green(`  [ok] `) + `Rust simulator installed at: ${executablePath}\n`)

  return executablePath
}

/**
 * Extract the downloaded asset to the simulator directory.
 * @param {string} executable - The name of the executable file.
 * @param {string} assetName - The name of the asset to extract.
 * @param {string} assetPath - The path to the downloaded asset.
 * @param {string} simulatorDir - The path to the simulator directory.
 * @throws Will throw an error if the asset format is unsupported.
 */
async function extractAsset(executable: string, assetName: string, assetPath: string, simulatorDir: string) {
  const util = require('util')
  const exec = util.promisify(require('child_process').exec)

  console.log(chalk.gray(`  Extracting ${assetPath}...`))

  const executablePath = path.join(simulatorDir, executable)

  if (assetName.endsWith('.tar.gz')) {
    await exec(`tar -xzf ${assetPath} -C ${simulatorDir} `)
    await exec(`chmod +x ${executablePath}`)
  } else if (assetName.endsWith('.zip')) {
    // For Windows, use a simple unzip command (requires unzip to be installed)
    // You might want to use a JavaScript unzip library for better compatibility
    const AdmZip = require('adm-zip')
    const zip = new AdmZip(assetPath)
    zip.extractAllTo(simulatorDir, true)
  } else {
    throw new Error(`Unsupported asset format: ${assetName}`)
  }
}

/**
 * Download a GitHub asset from a release.
 * @param {GitHubClient} client - The GitHub client to use for downloading.
 * @param {GitHubRelease} release - The GitHub release object.
 * @param {string} assetName - The name of the asset to download.
 * @param {string} simulatorDir - The directory to save the downloaded asset.
 * @returns {Promise<string>} - The path to the downloaded asset.
 * @throws Will throw an error if the download fails or the asset is not found.
 */
async function downloadGitHubAsset(
  client: GitHubClient,
  release: GitHubRelease,
  assetName: string,
  simulatorDir: string
): Promise<string> {
  const path = require('path')

  const version = release.tag_name
  const asset = release.assets.find(asset => asset.name === assetName)

  if (!asset) {
    throw new Error(`Asset ${assetName} not found in release ${version}`)
  }

  const assetPath = path.join(simulatorDir, assetName)
  if (await exists(assetPath)) {
    console.log(chalk.gray(`File ${assetPath} already exists. Skipping download.`))
    return assetPath
  }

  // Download the asset
  return await client.downloadAsset(asset, assetPath)
}

function inferAssetAndExecutableNames(platform: string, arch: string): { assetName: string; executable: string } {
  let assetName = ''
  let executable = 'quint_simulator'

  if (platform === 'darwin') {
    // macOS
    if (arch === 'arm64') {
      assetName = 'quint_simulator-aarch64-apple-darwin.tar.gz'
    } else if (arch === 'x64') {
      assetName = 'quint_simulator-x86_64-apple-darwin.tar.gz'
    }
  } else if (platform === 'linux') {
    if (arch === 'arm64') {
      assetName = 'quint_simulator-aarch64-unknown-linux-gnu.tar.gz'
    } else if (arch === 'x64') {
      assetName = 'quint_simulator-x86_64-unknown-linux-gnu.tar.gz'
    }
  } else if (platform === 'win32') {
    if (arch === 'x64') {
      assetName = 'quint_simulator-x86_64-pc-windows-msvc.zip'
      executable = 'quint-simulator.exe'
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
  private token: string | undefined

  constructor(token: string | undefined) {
    this.token = token
  }

  async fetch(url: string, accept: string): Promise<Response> {
    const options: any = {
      redirect: 'follow',
      follow: 10,
      headers: {
        'User-Agent': 'quint-simulator-fetch',
        Accept: accept,
      },
    }

    if (this.token) {
      options.headers['Authorization'] = `Bearer ${this.token} `
    }

    const response = await fetch(url, options)
    if (!response.ok) {
      throw new Error(`Failed to fetch from GitHub: ${response.statusText}`)
    }

    return response
  }

  async fetchRelease(version: string): Promise<GitHubRelease> {
    const url = `https://api.github.com/repos/informalsystems/quint-simulator/releases`
    const response = await this.fetch(url, 'application/vnd.github.v3+json')
    const releases = (await response.json()) as GitHubRelease[]
    const release = releases.find(release => release.tag_name === version)
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
    console.log(chalk.gray(`  Downloading Rust simulator from ${asset.url}...`))

    try {
      const response = await this.fetch(asset.url, 'application/octet-stream')

      if (!response.ok) {
        throw new Error(`Failed to download Rust simulator: ${response.statusText}`)
      }

      await finished(Readable.fromWeb(response.body).pipe(fileStream))
    } catch (err) {
      await unlink(path).catch(() => {})
      throw err
    }

    return path
  }
}
