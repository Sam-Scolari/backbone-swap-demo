export default async function (Data, Protocol) {
  return {
    async all(stream) {
      const items = await Data.query({ lt: "~" }, stream)
      return items
    },
    async get(key) {
      const value = await Data.get(key)
      return value || null
    },
    async del(key) {
      await Protocol({
        type: "del",
        key,
      })
    },
    async set(params: { key: string; value: string }) {
      const { key, value } = params
      await Protocol({
        type: "set",
        key,
        value,
      })
    },
  }
}
