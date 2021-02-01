import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'
import { encodeValue, decodeValue } from '../serialization'
import { parseObject } from './util'

export const Value = new GraphQLScalarType({
  name: 'Value',
  serialize(value) {
    return encodeValue(value)
  },
  parseValue(value) {
    return decodeValue(value)
  },
  parseLiteral(ast, variables) {
    if (ast.kind == Kind.OBJECT) {
      return decodeValue(parseObject(ast, variables))
    } else {
      throw new Error('Value must be an object')
    }
  }
})
