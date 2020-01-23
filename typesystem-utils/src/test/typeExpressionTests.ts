import { NonNullType, IDRefLocator, TypeParameter } from '../model'
import { TypeExpression } from '../scalars'

it('cannot parse NonNull(of: NonNull)', () => {
  const invalidNonNullValue = { nonNullOf: { nonNullOf: { idRef: 'String' } } }

  expect(() => {
    TypeExpression.parseValue(invalidNonNullValue)
  }).toThrowError('Cannot have a NonNullType of a NonNullType')
})

it('cannot parse TypeParameter with empty name', () => {
  const invalidTypeParameter = { typeParameter: '' }

  expect(() => {
    TypeExpression.parseValue(invalidTypeParameter)
  }).toThrowError('Cannot have a TypeParameter with empty Name field')
})

it('cannot serialize NonNull(of: NonNull)', () => {
  expect(() => {
    new NonNullType({
      of: new NonNullType({ of: new IDRefLocator({ id: 'String' }) })
    })
  }).toThrowError('Cannot have a NonNullType of a NonNullType')
})

it('cannot serialize TypeParameter with empty name', () => {
  expect(() => {
    new TypeParameter({ name: '' })
  }).toThrowError('Cannot have a TypeParameter with empty Name field')
})
