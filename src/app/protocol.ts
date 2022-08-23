export default async function(op, Data) {
  switch (op.type) {
    case 'set': {
      await Data.put({ key: op.key, value: op.value })
      break
    }
    case 'del': {
      const p = await Data.get(op.key)
      if (!p) break

      await Data.del(op.key)
      break
    }
    case "helloworld": {
      await Data.put({ key: "hello", value: "hello world" })
      break
    }
    default:
      return Data.discard(op, "unknown operation")
  }
}