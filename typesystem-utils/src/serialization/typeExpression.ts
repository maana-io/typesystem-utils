import * as t from 'io-ts'
import * as m from '../model/typeExpression'
import * as ls from './locator'
import { either, isRight } from 'fp-ts/lib/Either'
import { PathReporter } from 'io-ts/lib/PathReporter'

interface ListTypeFormat {
  listOf: TypeExpressionFormat
}

interface NonNullTypeFormat {
  nonNullOf: TypeExpressionFormat
}

interface TypeParameterFormat {
  typeParameter: string
}

interface ScalarFormat {
  scalar: string
}

interface SumFormat {
  sumOf: TypeExpressionFormat[]
}

interface ProductFormat {
  product: ProductDetailsFormat
}

interface ProductDetailsFormat {
  fields: ProductFieldFormat[]
  extendable: boolean
}

interface ProductFieldFormat {
  id: string | null | undefined
  name: string | null | undefined
  description: string | null | undefined
  type: TypeExpressionFormat
}

interface FunctionTypeFormat {
  function: FunctionTypeDetailsFormat
}

interface FunctionTypeDetailsFormat {
  arguments: ArgumentFormat[]
  resultType: TypeExpressionFormat
}

interface ArgumentFormat {
  id: string | null | undefined
  name: string | null | undefined
  description: string | null | undefined
  type: TypeExpressionFormat
}

type TypeExpressionFormat =
  | NonNullTypeFormat
  | ListTypeFormat
  | TypeParameterFormat
  | ScalarFormat
  | SumFormat
  | ProductFormat
  | FunctionTypeFormat
  | ls.LocatorFormat

const ListTypeCodec = new t.Type<m.ListType, ListTypeFormat>(
  'ListType',
  (u): u is m.ListType => u instanceof m.ListType,
  (u, c) =>
    either.chain(t.interface({ listOf: TypeExpressionCodec }).validate(u, c), lo => {
      return t.success(
        new m.ListType({
          of: lo.listOf
        })
      )
    }),
  lt => ({ listOf: TypeExpressionCodec.encode(lt.of) })
)

const NonNullTypeCodec = new t.Type<m.NonNullType, NonNullTypeFormat>(
  'NonNullType',
  (u): u is m.NonNullType => u instanceof m.NonNullType,
  (u, c) =>
    either.chain(t.interface({ nonNullOf: TypeExpressionCodec }).validate(u, c), nno => {
      if (nno.nonNullOf instanceof m.NonNullType) {
        return t.failure(u, c, 'Cannot have a NonNullType of a NonNullType')
      }
      return t.success(
        new m.NonNullType({
          of: nno.nonNullOf
        })
      )
    }),
  nnt => ({ nonNullOf: TypeExpressionCodec.encode(nnt.of) })
)

const TypeParameterCodec = new t.Type<m.TypeParameter, TypeParameterFormat>(
  'TypeParameter',
  (u): u is m.TypeParameter => u instanceof m.TypeParameter,
  (u, c) =>
    either.chain(t.type({ typeParameter: t.string }).validate(u, c), tp => {
      if (tp.typeParameter.length == 0) {
        return t.failure(u, c, 'Cannot have a TypeParameter with empty Name field')
      }
      return t.success(
        new m.TypeParameter({
          name: tp.typeParameter
        })
      )
    }),
  tp => ({ typeParameter: tp.name })
)

const ScalarCodec = new t.Type<m.Scalar, ScalarFormat>(
  'Scalar',
  (u): u is m.Scalar => u instanceof m.Scalar,
  (u, c) =>
    either.chain(t.type({ scalar: t.string }).validate(u, c), s => {
      return t.success(
        new m.Scalar({
          id: s.scalar
        })
      )
    }),
  s => ({ scalar: s.id })
)

const SumCodec = new t.Type<m.Sum, SumFormat>(
  'Sum',
  (u): u is m.Sum => u instanceof m.Sum,
  (u, c) =>
    either.chain(t.type({ sumOf: t.array(TypeExpressionCodec) }).validate(u, c), sum => {
      return t.success(
        new m.Sum({
          variants: sum.sumOf
        })
      )
    }),
  sum => ({ sumOf: sum.variants.map(variant => TypeExpressionCodec.encode(variant)) })
)

const ProductFieldCodec = new t.Type<m.ProductField, ProductFieldFormat>(
  'ProductField',
  (u): u is m.ProductField => u instanceof m.ProductField,
  (u, c) =>
    either.chain(
      t
        .type({
          id: t.union([t.string, t.null]),
          name: t.union([t.string, t.null]),
          description: t.union([t.string, t.null]),
          type: TypeExpressionCodec
        })
        .validate(u, c),
      pf => {
        return t.success(
          new m.ProductField({
            id: pf.id,
            name: pf.name,
            description: pf.description,
            type: pf.type
          })
        )
      }
    ),
  pf => ({
    id: pf.id,
    name: pf.name,
    description: pf.description,
    type: TypeExpressionCodec.encode(pf.type)
  })
)

const ProductCodec = new t.Type<m.Product, ProductFormat>(
  'Product',
  (u): u is m.Product => u instanceof m.Product,
  (u, c) =>
    either.chain(
      t
        .type({
          product: t.type({
            fields: t.array(ProductFieldCodec),
            extendable: t.boolean
          })
        })
        .validate(u, c),
      pf => {
        return t.success(
          new m.Product({
            fields: pf.product.fields,
            extendable: pf.product.extendable
          })
        )
      }
    ),
  product => ({
    product: {
      fields: product.fields.map(pf => ProductFieldCodec.encode(pf)),
      extendable: product.extendable
    }
  })
)

const ArgumentCodec = new t.Type<m.Argument, ArgumentFormat>(
  'Argument',
  (u): u is m.Argument => u instanceof m.Argument,
  (u, c) =>
    either.chain(
      t
        .type({
          id: t.union([t.string, t.null]),
          name: t.union([t.string, t.null]),
          description: t.union([t.string, t.null]),
          type: TypeExpressionCodec
        })
        .validate(u, c),
      arg => {
        return t.success(
          new m.Argument({
            id: arg.id,
            name: arg.name,
            description: arg.description,
            type: arg.type
          })
        )
      }
    ),
  arg => ({
    id: arg.id,
    name: arg.name,
    description: arg.description,
    type: TypeExpressionCodec.encode(arg.type)
  })
)

const FunctionTypeCodec = new t.Type<m.FunctionType, FunctionTypeFormat>(
  'FunctionType',
  (u): u is m.FunctionType => u instanceof m.FunctionType,
  (u, c) =>
    either.chain(
      t
        .type({
          function: t.type({ arguments: t.array(ArgumentCodec), resultType: TypeExpressionCodec })
        })
        .validate(u, c),
      ft => {
        return t.success(
          new m.FunctionType({
            arguments: ft.function.arguments,
            resultType: ft.function.resultType
          })
        )
      }
    ),
  ft => ({
    function: {
      arguments: ft.arguments.map(arg => ArgumentCodec.encode(arg)),
      resultType: TypeExpressionCodec.encode(ft.resultType)
    }
  })
)

const TypeExpressionCodec: t.Type<m.TypeExpression, TypeExpressionFormat> = t.union([
  ls.LocatorCodec,
  ListTypeCodec,
  NonNullTypeCodec,
  TypeParameterCodec,
  ScalarCodec,
  SumCodec,
  ProductCodec,
  FunctionTypeCodec
])

/**
 * Encodes type expression into a javascript object representing serialization format.
 */
export const encodeTypeExpression = (expr: m.TypeExpression): object => {
  return TypeExpressionCodec.encode(expr)
}

/**
 * Decodes type expression from javascript object representing serialization format.
 * If format is invalid, will throw an error with list of failed validations
 */
export const decodeTypeExpression = (u: unknown): m.TypeExpression => {
  const decodedEither = TypeExpressionCodec.decode(u)
  if (isRight(decodedEither)) {
    return decodedEither.right
  } else {
    const errors = PathReporter.report(decodedEither)
    throw new Error(errors.toString())
  }
}
