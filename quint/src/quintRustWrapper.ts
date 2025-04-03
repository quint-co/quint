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
import child_process from 'child_process'
import { QuintEx, QuintModule } from './ir/quintIr'
import { Outcome } from './simulation'
import { debugLog } from './verbosity'
import JSONbig from 'json-bigint'
import path from 'path'
import os from 'os'
import { LookupTable } from './names/base'
import { replacer } from './jsonHelper'
import { ofItf } from './itf'

/**
 * Get the configuration directory for Quint.
 * @returns {string} The path to the Quint configuration directory.
 */
function quintConfigDir(): string {
  return path.join(os.homedir(), '.quint')
}

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
    const exe = await fetchQuintSimulatorFromGitHubReleases()
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
    const result = child_process.spawnSync(exe, args, {
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

function rustSimulatorDir(version: string): string {
  return path.join(quintConfigDir(), `rust-simulator-${version}`)
}

function rustVersionFile(): string {
  return path.join(quintConfigDir(), 'rust-simulator-version')
}

interface GitHubAsset {
  name: string
  browser_download_url: string
}

interface GitHubReleaseInfo {
  tag_name: string
  assets: GitHubAsset[]
}

const QUINT_SIMULATOR_VERSION = '0.0.0-pre.1'

/** Fetch the latest version of the Quint simulator from GitHub releases.
 *  The repository is `informalinformal/quint-simulator`.
 *  This function will check if the simulator is already downloaded and
 *  if not, it will download the latest version for the current platform and architecture.
 *  Then it will extract the binary and return the path to the executable.
 */
async function fetchQuintSimulatorFromGitHubReleases(): Promise<string> {
  const fs = require('fs')
  const path = require('path')
  const { Readable } = require('stream')
  const { finished } = require('stream/promises')
  const { unlink, stat, readFile, mkdir, writeFile } = require('fs/promises')
  const { execSync } = require('child_process')

  async function exists(filePath: string): Promise<boolean> {
    return stat(filePath)
      .then(() => true)
      .catch(() => false)
  }

  // Determine platform and architecture
  const platform = os.platform()
  const arch = os.arch()

  // Map platform and architecture to asset name
  let { assetName, executable } = inferAssetAndExecutableNames(platform, arch)

  // Check if the simulator is already downloaded
  const versionFile = rustVersionFile()
  if (await exists(versionFile)) {
    const version = (await readFile(versionFile, 'utf-8')).trim()
    const simulatorDir = rustSimulatorDir(version)
    const executablePath = path.join(simulatorDir, executable)
    if (await exists(executablePath)) {
      return executablePath
    }
  }

  // Fetch the latest release info
  console.log('Fetching latest Quint Rust simulator release...')

  const url = 'https://api.github.com/repos/informalsystems/quint-simulator/releases/latest'

  const options: any = {
    headers: {
      'User-Agent': 'quint-simulator-fetch',
      Accept: 'application/vnd.github+json',
    },
  }

  // Add GitHub token if available
  const githubToken = process.env.GITHUB_TOKEN
  if (githubToken) {
    options.headers['Authorization'] = `Bearer ${githubToken}`
  }

  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(`Failed to fetch latest release info: ${response.statusText} `)
  }

  const releaseInfo = (await response.json()) as GitHubReleaseInfo
  const version = releaseInfo.tag_name

  // Save the version to a file
  await mkdir(quintConfigDir(), { recursive: true })
  await writeFile(versionFile, version, 'utf-8')

  const simulatorDir = rustSimulatorDir(version)
  const executablePath = path.join(simulatorDir, executable)

  // Check if the simulator is already downloaded
  if (await exists(executablePath)) {
    return executablePath
  }

  // Create the simulator directory if it doesn't exist
  await mkdir(simulatorDir, { recursive: true })

  // Find the asset
  const asset = releaseInfo.assets.find(a => a.name === assetName)
  if (!asset) {
    throw new Error(`Asset ${assetName} not found in the latest release`)
  }

  const downloadUrl = asset.browser_download_url

  // Download the asset
  console.log(`Downloading ${assetName} at ${downloadUrl}...`)

  const downloadOptions: any = {
    headers: {
      'User-Agent': 'quint-simulator-fetch',
      Accept: 'application/octet-stream',
    },
  }

  if (githubToken) {
    downloadOptions.headers['Authorization'] = `token ${githubToken} `
  }

  const assetPath = path.join(simulatorDir, assetName)
  const fileStream = fs.createWriteStream(assetPath, { mode: 0o755, flags: 'wx' })

  try {
    const response = await fetch(downloadUrl, downloadOptions)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    await finished(Readable.fromWeb(response.body), fileStream)
  } catch (err) {
    await unlink(assetPath).catch(() => {})
    throw err
  }

  // Extract the asset
  console.log('Extracting...')
  if (assetName.endsWith('.tar.gz')) {
    execSync(`tar - xzf ${assetPath} -C ${simulatorDir} `)
  } else if (assetName.endsWith('.zip')) {
    // For Windows, use a simple unzip command (requires unzip to be installed)
    // You might want to use a JavaScript unzip library for better compatibility
    const AdmZip = require('adm-zip')
    const zip = new AdmZip(assetPath)
    zip.extractAllTo(simulatorDir, true)
  }

  // Clean up the downloaded archive
  await unlink(assetPath)

  console.log(`Quint simulator installed at: ${executablePath} `)
  return executablePath
}

function inferAssetAndExecutableNames(platform: string, arch: string): { assetName: string; executable: string } {
  let assetName = ''
  let executable = 'quint-simulator'

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
