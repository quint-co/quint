/* ----------------------------------------------------------------------------------
 * Copyright 2026 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Downloading the tools a backend runs: a release archive, unpacked into Quint's
 * configuration directory, and the name of the platform it is built for. What is
 * downloaded or built there is installed whole, as other quint processes may install it too.
 *
 * @module
 */

import { Either, left, right } from '@sweet-monads/either'
import { createHash } from 'crypto'
import fs from 'fs'
import path from 'path'
import { Transform } from 'stream'
import { pipeline } from 'stream/promises'
import * as tar from 'tar'

/**
 * The Rust target triple of a platform, which release assets of `quint_evaluator` and
 * elan are named after, and the archive format they come in there.
 *
 * @param platform as `process.platform` names it
 * @param arch as `process.arch` names it
 * @returns the triple and the archive extension, or the reason the platform has no
 * release
 */
export function releaseTarget(platform: string, arch: string): Either<string, { triple: string; archive: string }> {
  const cpu = arch === 'arm64' ? 'aarch64' : arch === 'x64' ? 'x86_64' : undefined
  if (platform === 'darwin' && cpu) {
    return right({ triple: `${cpu}-apple-darwin`, archive: '.tar.gz' })
  }
  if (platform === 'linux' && cpu) {
    return right({ triple: `${cpu}-unknown-linux-gnu`, archive: '.tar.gz' })
  }
  if (platform === 'win32' && cpu === 'x86_64') {
    return right({ triple: 'x86_64-pc-windows-msvc', archive: '.zip' })
  }
  return left(`Unsupported platform or architecture: ${platform} ${arch}`)
}

/**
 * Download the `.tar.gz` at `url`, optionally verify its SHA-256 digest, and
 * install its top-level entry `entry` as `distDir/entry`.
 *
 * The archive is unpacked into a temporary directory and then moved into place, so
 * that other quint processes (e.g., running in parallel) never see a partially
 * unpacked entry. If another process installs the entry first, that one is kept.
 *
 * @returns the installed path, or why it could not be installed
 */
export async function downloadAndUnpack(
  url: string,
  distDir: string,
  entry: string,
  expectedSha256?: string
): Promise<Either<string, string>> {
  return installAtomically(path.join(distDir, entry), async tmpDir => {
    let res: Response
    try {
      res = await fetch(url)
    } catch (error) {
      return left(`Error fetching ${url}: ${error}`)
    }
    if (!res.ok || res.body === null) {
      return left(`Error fetching ${url}: HTTP ${res.status}`)
    }

    const archive = path.join(tmpDir, 'download.tar.gz')
    const unpackDir = path.join(tmpDir, 'unpacked')
    const hash = createHash('sha256')
    const hashingStream = new Transform({
      transform(chunk, _encoding, callback) {
        hash.update(chunk)
        callback(null, chunk)
      },
    })
    try {
      await pipeline(res.body, hashingStream, fs.createWriteStream(archive))
    } catch (error) {
      return left(`Error downloading ${url}: ${error}`)
    }

    const actualSha256 = hash.digest('hex')
    if (expectedSha256 !== undefined && actualSha256 !== expectedSha256.toLowerCase()) {
      return left(`Checksum mismatch for ${url}: expected SHA-256 ${expectedSha256}, got ${actualSha256}`)
    }

    try {
      fs.mkdirSync(unpackDir)
      await pipeline(fs.createReadStream(archive), tar.extract({ cwd: unpackDir, strict: true }))
    } catch (error) {
      return left(`Error unpacking ${url}: ${error}`)
    }
    return right(path.join(unpackDir, entry))
  })
}

/**
 * Install at `target`, whole, what `fill` puts in a temporary directory beside it: `fill` returns the path there
 * that is renamed to `target`, so that other quint processes never see it in part. If another process installs
 * `target` first, that one is kept.
 *
 * @returns `target`, or why it could not be installed
 */
export async function installAtomically(
  target: string,
  fill: (tmpDir: string) => Promise<Either<string, string>>
): Promise<Either<string, string>> {
  fs.mkdirSync(path.dirname(target), { recursive: true })
  const tmpDir = fs.mkdtempSync(path.join(path.dirname(target), 'installing-'))
  try {
    const filled = await fill(tmpDir)
    if (filled.isLeft()) {
      return filled
    }
    try {
      fs.renameSync(filled.value, target)
    } catch (error) {
      if (!fs.existsSync(target)) {
        return left(`Error installing ${target}: ${error}`)
      }
    }
    return right(target)
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}
