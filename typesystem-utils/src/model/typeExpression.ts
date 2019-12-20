import { Locator } from './locator'

/**
 * Type expression may be either:
 * - Anonymous type (type signature only)
 * - Predefined list of higher kinded types (e.g. List or Stream or Promise).
 * - Reference to a type (using a locator)
 *
 * This model intentionally doesn't support and doesn't validate 'named types' or functions
 * (yet) - the first goal is to simplify serialization/deserialization of type expressions
 */
export type TypeExpression =
  | Locator
  | ListType
  | NonNullType
  | TypeParameter
  | Scalar
  | Sum
  | Product
  | FunctionType

export class ListType {
  readonly of: TypeExpression
  constructor(props: ListType) {
    this.of = props.of
  }
}

export class NonNullType {
  readonly of: TypeExpression
  constructor(props: NonNullType) {
    this.of = props.of
  }
}

export class TypeParameter {
  readonly name: string

  constructor(props: TypeParameter) {
    this.name = props.name
  }
}

export class Scalar {
  readonly id: string

  constructor(props: Scalar) {
    this.id = props.id
  }
}

export class Sum {
  readonly variants: TypeExpression[]

  constructor(props: Sum) {
    this.variants = props.variants
  }
}

export class ProductField {
  readonly id?: string | null
  readonly name?: string | null
  readonly description?: string | null
  readonly type: TypeExpression

  constructor(props: ProductField) {
    this.id = props.id
    this.name = props.name
    this.description = props.description
    this.type = props.type
  }
}

export class Product {
  readonly fields: ProductField[]
  readonly extendable: boolean

  constructor(props: Product) {
    this.fields = props.fields
    this.extendable = props.extendable
  }
}

export class FunctionType {
  readonly arguments: Argument[]
  readonly resultType: TypeExpression

  constructor(props: FunctionType) {
    this.arguments = props.arguments
    this.resultType = props.resultType
  }
}

export class Argument {
  readonly id?: string | null
  readonly name?: string | null
  readonly description?: string | null
  readonly type: TypeExpression

  constructor(props: Argument) {
    this.id = props.id
    this.name = props.name
    this.description = props.description
    this.type = props.type
  }
}
