import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import { encodeLocator, decodeLocator } from '../serialization/locator'
import { parseObject } from './util'

export const Locator = new GraphQLScalarType({
  name: 'Locator',
  serialize(value) {
    return encodeLocator(value)
  },
  parseValue(value) {
    return decodeLocator(value)
  },
  parseLiteral(ast, variables) {
    if(ast.kind == Kind.OBJECT) {
      return decodeLocator(parseObject(ast, variables))
    } else {
      throw new Error('Locator must be an object')
    }
  }
})