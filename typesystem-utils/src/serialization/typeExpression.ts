import * as t from 'io-ts'
import * as m from '../model/typeExpression'
import { either, getOrElse, left } from 'fp-ts/lib/Either'
import { PathReporter } from 'io-ts/lib/PathReporter'

interface ListTypeFormat {
  listOf: TypeExpressionFormat
}

interface TypeRefFormat {
  typeRef: string
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
  name: string
  description: string | null
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
  id: string
  name: string
  description: string | null
  type: TypeExpressionFormat
}

type TypeExpressionFormat =
  | TypeRefFormat
  | NonNullTypeFormat
  | ListTypeFormat
  | TypeParameterFormat
  | ScalarFormat
  | SumFormat
  | ProductFormat
  | FunctionTypeFormat

const TypeRefCodec = new t.Type<m.TypeRef, TypeRefFormat>(
  'TypeRef',
  (u): u is m.TypeRef => u instanceof m.TypeRef,
  (u, c) =>
    either.chain(t.type({ typeRef: t.string }).validate(u, c), tr => {
      return t.success(
        new m.TypeRef({
          id: tr.typeRef
        })
      )
    }),
  tr => {
    return { typeRef: tr.id }
  }
)

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
          name: t.string,
          description: t.union([t.string, t.null]),
          type: TypeExpressionCodec
        })
        .validate(u, c),
      pf => {
        return t.success(
          new m.ProductField({
            name: pf.name,
            description: pf.description,
            type: pf.type
          })
        )
      }
    ),
  pf => ({ name: pf.name, description: pf.description, type: TypeExpressionCodec.encode(pf.type) })
)

const ProductCodec = new t.Type<m.Product, ProductFormat>(
  'Product',
  (u): u is m.Product => u instanceof m.Product,
  (u, c) =>
    either.chain(
      t.type({
        product: t.type({
          fields: t.array(ProductFieldCodec),
          extendable: t.boolean
        })
      }).validate(u, c),
      pf => {
        return t.success(
          new m.Product({
            fields: pf.product.fields,
            extendable: pf.product.extendable
          })
        )
      }
    ),
  product => ({ product: {
    fields: product.fields.map(pf => ProductFieldCodec.encode(pf)),
    extendable: product.extendable
  }})
)

const ArgumentCodec = new t.Type<m.Argument, ArgumentFormat>(
  'Argument',
  (u): u is m.Argument => u instanceof m.Argument,
  (u, c) =>
    either.chain(
      t
        .type({
          id: t.string,
          name: t.string,
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
  (u, c) => either.chain(
    t.type({function: t.type({ arguments: t.array(ArgumentCodec), resultType: TypeExpressionCodec })}).validate(u, c),
    ft => {
      return t.success(new m.FunctionType({
        arguments: ft.function.arguments,
        resultType: ft.function.resultType
      }))
    }
  ),
  ft => ({ function: {
    arguments: ft.arguments.map(arg => ArgumentCodec.encode(arg)),
    resultType: TypeExpressionCodec.encode(ft.resultType)
  }})
)

const TypeExpressionCodec: t.Type<m.TypeExpression, TypeExpressionFormat> = t.union([
  TypeRefCodec,
  ListTypeCodec,
  NonNullTypeCodec,
  TypeParameterCodec,
  ScalarCodec,
  SumCodec,
  ProductCodec,
  FunctionTypeCodec
])

const orThrow: (e: t.Errors) => m.TypeExpression = (e: t.Errors) => {
  const errors = PathReporter.report(left(e))
  throw new Error(errors.toString())
}

export const test = () => {
  // Test1: fn intsToStrings(ints: [Long!]!): [String!]!
  const intsToStrings = new m.FunctionType({
    arguments: [
      { 
        id: "ints",
        name: "ints",
        description: null,
        type: new m.NonNullType({
          of: new m.ListType({
            of: new m.NonNullType({
              of: new m.TypeRef({
                id: 'Long'
              })
            })
          })
        })
      }
    ],
    resultType: new m.NonNullType({
      of: new m.ListType({
        of: new m.NonNullType({
          of: new m.TypeRef({
            id: 'Long'
          })
        })
      })
    })
  })


  /*
    {
      "function": {
        "arguments": [
          {
            "id": "ints",
            "name": "ints",
            "description": null,
            "type": {
              "nonNullOf": {
                "listOf": {
                  "nonNullOf": {
                    "typeRef": "Long"
                  }
                }
              }
            }
          }
        ],
        "resultType": {
          "nonNullOf": {
            "listOf": {
              "nonNullOf": {
                "typeRef": "Long"
              }
            }
          }
        }
      }
    }
  */
  const intsToStringsEncoded = TypeExpressionCodec.encode(intsToStrings)
  const decoded = TypeExpressionCodec.decode(intsToStringsEncoded)

  // Is it symmetric, i.e. decode(encode(x)) must be equal to x (obviously, with either etc)
  console.log(JSON.stringify(decoded) === JSON.stringify(t.success(intsToStrings)))

  // const likelyRight = getOrElse(orThrow)(decoded)
  // console.log(`LikelyRight: ${JSON.stringify(likelyRight)}`)
  // console.log(`InstanceOf NonNullType: ${likelyRight instanceof m.NonNullType}`)
}
