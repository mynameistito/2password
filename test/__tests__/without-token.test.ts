import { assert, describe, it } from "@effect/vitest"
import { spawnSync } from "node:child_process"
import { join } from "node:path"
import { bun } from "../sandbox.js"

const helper = join(import.meta.dirname, "../../src/without-token.ts")

describe("without-token", () => {
  it.skipIf(process.platform !== "win32")("removes the service token and forwards child stdio and status", () => {
    const result = spawnSync(
      bun,
      [
        "run",
        helper,
        bun,
        "-e",
        'process.stdout.write(process.env.OP_SERVICE_ACCOUNT_TOKEN === undefined ? "TOKEN_ABSENT" : "TOKEN_PRESENT"); process.stderr.write("CHILD_STDERR"); process.exit(23)',
      ],
      {
        encoding: "utf8",
        env: { ...process.env, OP_SERVICE_ACCOUNT_TOKEN: "FICTIONAL-WINDOWS-CHILD-TOKEN" },
      },
    )

    assert.strictEqual(result.error, undefined)
    assert.strictEqual(result.stdout, "TOKEN_ABSENT")
    assert.notInclude(result.stdout, "TOKEN_PRESENT")
    assert.strictEqual(result.stderr, "CHILD_STDERR")
    assert.strictEqual(result.status, 23)
  })

  it.skipIf(process.platform !== "win32")("exits with status 2 when no command is provided", () => {
    const result = spawnSync(bun, ["run", helper], { encoding: "utf8" })

    assert.strictEqual(result.error, undefined)
    assert.strictEqual(result.status, 2)
  })
})
