import { test, expect } from "@playwright/test"
import Config from "../backbone.json"
import App from "../src/app"
import Core from "../../core"

let app
test.beforeAll(async () => {
  app = await Core({
    config: { ...Config.settings, storage: "ram" },
    app: App,
  })
})

test.describe("Backend", async () => {
  test("API exists", async () => {
    const api = Object.keys(app)
    expect(api).toEqual(expect.arrayContaining(["connect", "all", "set", "get", "del"]))
  })

  test("Protocol works", async () => {
    await app.set({ key: "centralization", value: "meh" })
    expect(await app.all()).toHaveLength(1)
    expect(await app.get("centralization")).toEqual("meh")
    await app.del("centralization")
    expect(await app.all()).toHaveLength(0)
  })
})
