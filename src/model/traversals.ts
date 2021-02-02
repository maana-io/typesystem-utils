import { IDRefLocator, LocalNameLocator, ServiceAndNameLocator } from './locator'
import {
  Scalar,
  TypeExpression,
  ListType,
  NonNullType,
  Product,
  Sum,
  TypeParameter,
  FunctionType,
  ProductField,
  Argument,
  Enum
} from './typeExpression'
import { encodeTypeExpression } from '../serialization'

export type TraverseMapper = {
  onIDRefLocator?: (te: IDRefLocator) => TypeExpression
  onLocalNameLocator?: (te: LocalNameLocator) => TypeExpression
  onServiceAndNameLocator?: (te: ServiceAndNameLocator) => TypeExpression
  onScalar?: (te: Scalar) => TypeExpression
  onListType?: (te: ListType) => TypeExpression
  onNonNullType?: (te: NonNullType) => TypeExpression
  onProduct?: (te: Product) => TypeExpression
  onSum?: (te: Sum) => TypeExpression
  onTypeParameter?: (te: TypeParameter) => TypeExpression
  onFunctionType?: (te: FunctionType) => TypeExpression
  onEnum?: (te: Enum) => TypeExpression
}

/**
 * Recursively traverses type expression and applies function to each type expression, if defined
 */
export function traverseTypeExpression(te: TypeExpression, mapper: TraverseMapper): TypeExpression {
  if (te instanceof IDRefLocator) {
    return mapper.onIDRefLocator ? mapper.onIDRefLocator(te) : te
  } else if (te instanceof LocalNameLocator) {
    return mapper.onLocalNameLocator ? mapper.onLocalNameLocator(te) : te
  } else if (te instanceof ServiceAndNameLocator) {
    return mapper.onServiceAndNameLocator ? mapper.onServiceAndNameLocator(te) : te
  } else if (te instanceof Scalar) {
    return mapper.onScalar ? mapper.onScalar(te) : te
  } else if (te instanceof ListType) {
    return mapper.onListType
      ? mapper.onListType(te)
      : new ListType({
          of: traverseTypeExpression(te.of, mapper)
        })
  } else if (te instanceof NonNullType) {
    return mapper.onNonNullType
      ? mapper.onNonNullType(te)
      : new NonNullType({
          of: traverseTypeExpression(te.of, mapper)
        })
  } else if (te instanceof Product) {
    return mapper.onProduct
      ? mapper.onProduct(te)
      : new Product({
          extendable: te.extendable,
          fields: te.fields.map(field => {
            return new ProductField({
              id: field.id,
              name: field.name,
              description: field.description || null,
              type: traverseTypeExpression(field.type, mapper)
            })
          })
        })
  } else if (te instanceof Sum) {
    return mapper.onSum
      ? mapper.onSum(te)
      : new Sum({
          variants: te.variants.map(variant => traverseTypeExpression(variant, mapper))
        })
  } else if (te instanceof TypeParameter) {
    return mapper.onTypeParameter ? mapper.onTypeParameter(te) : te
  } else if (te instanceof FunctionType) {
    return mapper.onFunctionType
      ? mapper.onFunctionType(te)
      : new FunctionType({
          arguments: te.arguments.map((argument: Argument) => {
            return new Argument({
              id: argument.id,
              name: argument.name,
              description: argument.description,
              type: traverseTypeExpression(argument.type, mapper)
            })
          }),
          resultType: traverseTypeExpression(te.resultType, mapper)
        })
  } else if (te instanceof Enum) {
    return mapper.onEnum
      ? mapper.onEnum(te)
      : new Enum({
          values: te.values,
          of: traverseTypeExpression(te.of, mapper)
        })
  } else {
    throw new Error(`Type expression ${JSON.stringify(encodeTypeExpression(te))} is not supported`)
  }
}

export type TraverseMapperAsync = {
  onIDRefLocator?: (te: IDRefLocator) => Promise<TypeExpression>
  onLocalNameLocator?: (te: LocalNameLocator) => Promise<TypeExpression>
  onServiceAndNameLocator?: (te: ServiceAndNameLocator) => Promise<TypeExpression>
  onScalar?: (te: Scalar) => Promise<TypeExpression>
  onListType?: (te: ListType) => Promise<TypeExpression>
  onNonNullType?: (te: NonNullType) => Promise<TypeExpression>
  onProduct?: (te: Product) => Promise<TypeExpression>
  onSum?: (te: Sum) => Promise<TypeExpression>
  onTypeParameter?: (te: TypeParameter) => Promise<TypeExpression>
  onFunctionType?: (te: FunctionType) => Promise<TypeExpression>
  onEnum?: (te: Enum) => Promise<TypeExpression>
}

export async function traverseTypeExpressionAsync(
  te: TypeExpression,
  mapper: TraverseMapperAsync
): Promise<TypeExpression> {
  if (te instanceof IDRefLocator) {
    return mapper.onIDRefLocator ? mapper.onIDRefLocator(te) : te
  } else if (te instanceof LocalNameLocator) {
    return mapper.onLocalNameLocator ? mapper.onLocalNameLocator(te) : te
  } else if (te instanceof ServiceAndNameLocator) {
    return mapper.onServiceAndNameLocator ? mapper.onServiceAndNameLocator(te) : te
  } else if (te instanceof Scalar) {
    return mapper.onScalar ? mapper.onScalar(te) : te
  } else if (te instanceof ListType) {
    return mapper.onListType
      ? mapper.onListType(te)
      : new ListType({
          of: await traverseTypeExpressionAsync(te.of, mapper)
        })
  } else if (te instanceof NonNullType) {
    return mapper.onNonNullType
      ? mapper.onNonNullType(te)
      : new NonNullType({
          of: await traverseTypeExpressionAsync(te.of, mapper)
        })
  } else if (te instanceof Product) {
    return mapper.onProduct
      ? mapper.onProduct(te)
      : new Product({
          extendable: te.extendable,
          fields: await Promise.all(
            te.fields.map(async field => {
              const type = await traverseTypeExpressionAsync(field.type, mapper)
              return new ProductField({
                id: field.id,
                name: field.name,
                description: field.description || null,
                type
              })
            })
          )
        })
  } else if (te instanceof Sum) {
    return mapper.onSum
      ? mapper.onSum(te)
      : new Sum({
          variants: await Promise.all(
            te.variants.map(variant => traverseTypeExpressionAsync(variant, mapper))
          )
        })
  } else if (te instanceof TypeParameter) {
    return mapper.onTypeParameter ? mapper.onTypeParameter(te) : te
  } else if (te instanceof FunctionType) {
    return mapper.onFunctionType
      ? mapper.onFunctionType(te)
      : new FunctionType({
          arguments: await Promise.all(
            te.arguments.map(async (argument: Argument) => {
              return new Argument({
                id: argument.id,
                name: argument.name,
                description: argument.description,
                type: await traverseTypeExpressionAsync(argument.type, mapper)
              })
            })
          ),
          resultType: await traverseTypeExpressionAsync(te.resultType, mapper)
        })
  } else if (te instanceof Enum) {
    return mapper.onEnum
      ? mapper.onEnum(te)
      : new Enum({
          values: te.values,
          of: await traverseTypeExpressionAsync(te.of, mapper)
        })
  } else {
    throw new Error(`Type expression ${JSON.stringify(encodeTypeExpression(te))} is not supported`)
  }
}
