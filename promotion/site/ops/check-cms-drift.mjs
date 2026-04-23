#!/usr/bin/env node

import { execFileSync } from "node:child_process"

const DEFAULT_SITE_URL = "https://pegasmebel.ru"
const EXPECTED_VERSION = "landing-literal-2026-03-11"

function logResult(status, name, detail) {
  console.log(`${status}: ${name} :: ${detail}`)
}

function fetchText(url) {
  return execFileSync("curl", ["--fail", "--show-error", "--silent", "--location", url], {
    encoding: "utf8",
  })
}

function fetchJson(url) {
  return JSON.parse(fetchText(url))
}

async function main() {
  const siteUrl = (process.argv[2] || DEFAULT_SITE_URL).replace(/\/+$/, "")
  const bootstrapUrl = `${siteUrl}/api/cms/bootstrap`
  const [bootstrap, html] = await Promise.all([fetchJson(bootstrapUrl), fetchText(siteUrl)])
  const bootstrapText = JSON.stringify(bootstrap)

  const checks = [
    {
      name: "bootstrap source",
      pass: bootstrap.ok === true && bootstrap.source === "supabase",
      detail: `ok=${bootstrap.ok} source=${bootstrap.source}`,
    },
    {
      name: "bootstrap errors",
      pass: Array.isArray(bootstrap.diagnostics?.errors) && bootstrap.diagnostics.errors.length === 0,
      detail: `errors=${JSON.stringify(bootstrap.diagnostics?.errors ?? null)}`,
    },
    {
      name: "content version",
      pass: bootstrap.content?.site?.contentVersion === EXPECTED_VERSION,
      detail: `contentVersion=${bootstrap.content?.site?.contentVersion}`,
    },
    {
      name: "page description spelling",
      pass: bootstrap.content?.page?.description?.includes("3D-проект") === true,
      detail: `description=${bootstrap.content?.page?.description}`,
    },
    {
      name: "header CTA canonical",
      pass: bootstrap.content?.navigation?.headerCta?.label === "Получить персональный расчет",
      detail: `label=${bootstrap.content?.navigation?.headerCta?.label}`,
    },
    {
      name: "canonical strings present",
      pass:
        bootstrapText.includes("Созидание замыслов") &&
        bootstrapText.includes("Скандинавский минимализм") &&
        bootstrapText.includes("Свобода для полёта мечты") &&
        bootstrapText.includes("посудомоечная машина") &&
        bootstrapText.includes("3D-проект"),
      detail: "must contain canonical content markers",
    },
    {
      name: "stale bootstrap strings absent",
      pass:
        !bootstrapText.includes("Оставить заявку") &&
        !bootstrapText.includes("3D проект для Вас") &&
        !bootstrapText.includes("Создайте свою кухню") &&
        !bootstrapText.includes("Мойка и ПМ") &&
        !bootstrapText.includes('"PМ"') &&
        !bootstrapText.includes("ПМ"),
      detail: "must not contain stale CTA/header/configurator/PM markers",
    },
    {
      name: "old domain absent in public html",
      pass: !html.includes("zakazpegas.ru"),
      detail: "must not contain zakazpegas.ru",
    },
    {
      name: "stale style labels absent in public html",
      pass: !html.includes("Неоклассика") && !html.includes("Сканди-дзен"),
      detail: "must not contain stale hardcoded style labels",
    },
    {
      name: "canonical html markers present",
      pass:
        html.includes("Получить персональный расчет") &&
        html.includes("Созидание замыслов") &&
        html.includes("Скандинавский минимализм") &&
        html.includes("Свобода для полёта мечты") &&
        html.includes("3D-проект") &&
        html.includes("посудомоечная машина"),
      detail: "must contain canonical page markers",
    },
  ]

  console.log("# CMS Drift Check")
  console.log(`Site URL: ${siteUrl}`)
  console.log(`Bootstrap URL: ${bootstrapUrl}`)
  console.log(`Expected contentVersion: ${EXPECTED_VERSION}`)

  let hasFailure = false
  for (const check of checks) {
    const status = check.pass ? "PASS" : "FAIL"
    logResult(status, check.name, check.detail)
    if (!check.pass) {
      hasFailure = true
    }
  }

  if (hasFailure) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error.stack || String(error))
  process.exit(1)
})
