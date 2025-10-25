module.exports = (keys, obj) => {
  // const { [key]: omitted, ...rest } = obj
  let newObj = { ...obj }
  if (!Array.isArray(keys)) {
    delete newObj[keys]
  }
  for (const key of keys) {
    delete newObj[key]
  }

  return newObj
}