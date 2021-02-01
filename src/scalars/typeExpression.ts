import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'
import { encodeTypeExpression, decodeTypeExpression } from '../serialization'
import { parseObject } from './util'

export const TypeExpression = new GraphQLScalarType({
  name: 'TypeExpression',
  serialize(value) {
    return encodeTypeExpression(value)
  },
  parseValue(value) {
    return decodeTypeExpression(value)
  },
  parseLiteral(ast, variables) {
    if (ast.kind == Kind.OBJECT) {
      return decodeTypeExpression(parseObject(ast, variables))
    } else {
      throw new Error('Type Expression must be an object')
    }
  }
})
