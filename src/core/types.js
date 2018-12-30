import Type from 'union-type'

export { Type as Union }

export const Record = rec => {
  const X = Type({
    Record: {
      ...rec
    }
  })

  return (...params) => X.RecordOf(Object.keys(rec).reduce((acc, x, i) => ({ ...acc, [x]: params[i] }), {}))
}

export const Effect = sideEffect => _ => new Promise((resolve, reject) => sideEffect(resolve, reject))