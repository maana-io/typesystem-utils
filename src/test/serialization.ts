import { cons } from 'fp-ts/lib/Array'
import { string } from 'io-ts'
import { Enum, isValidNamedTypeSignature, ServiceAndNameLocator, StringValue } from '../model'
import {
  decodeTypeExpression,
  decodeValue,
  encodeTypeExpression,
  encodeValue
} from '../serialization'

it('should serialize string values', () => {
  const foo = new StringValue({ value: 'foo' })

  const encoded = JSON.stringify(encodeValue(foo))
  expect(encoded).toBe('{"string":"foo"}')

  const decoded = decodeValue(JSON.parse(encoded))
  expect(decoded.value).toBe('foo')
})

it('should load product fields that are not fully defined', () => {
  const ser = '{"product":{"fields":[{"name":"id","type":{"scalar":"ID"}}],"extendable":false}}'
  const decoded = decodeTypeExpression(JSON.parse(ser))
  expect(isValidNamedTypeSignature(decoded)).toBe(true)
})

it('should serialize and deserialize enums', () => {
  const stringEnum = new Enum({
    of: new ServiceAndNameLocator({ serviceId: 'io.maana.core', name: 'String' }),
    values: [
      new StringValue({ value: 'A' }),
      new StringValue({ value: 'B' }),
      new StringValue({ value: 'C' })
    ]
  })

  const encoded = JSON.stringify(encodeTypeExpression(stringEnum))
  expect(encoded).toBe(
    '{"enum":{"of":{"serviceAndName":{"serviceId":"io.maana.core","name":"String"}},"values":[{"string":"A"},{"string":"B"},{"string":"C"}]}}'
  )

  const decoded = decodeTypeExpression(JSON.parse(encoded))

  expect(decoded instanceof Enum).toBe(true)
  expect((decoded as Enum).values.map(v => v.value)).toStrictEqual(['A', 'B', 'C'])
})
