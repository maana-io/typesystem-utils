import {
  Locator,
  IDRefLocator,
  ServiceAndNameLocator,
  LocalNameLocator,
  isValidLocator
} from './locator'
import { TypeExpression } from '../scalars'

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
    if (props.of instanceof NonNullType) {
      throw new Error('Cannot have a NonNullType of a NonNullType')
    }

    this.of = props.of
  }
}

export class TypeParameter {
  readonly name: string

  constructor(props: TypeParameter) {
    if (props.name.length == 0) {
      throw new Error('Cannot have a TypeParameter with empty Name field')
    }

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

export function isValidNamedTypeSignature(signature: TypeExpression): boolean {
  if (signature instanceof Scalar || signature instanceof Sum || signature instanceof Product) {
    return validateSignature(signature)
  } else {
    console.log('NamedType Signature root must be Scalar, Sum, or Product.')
    return false
  }
}

function validateSignature(signature: TypeExpression): boolean {
  if (signature === undefined) return false

  if (
    signature instanceof IDRefLocator ||
    signature instanceof ServiceAndNameLocator ||
    signature instanceof LocalNameLocator
  ) {
    return isValidLocator(signature)
  } else if (signature instanceof TypeParameter) {
    console.log(`NamedType cannot contain a TypeParameter. ${JSON.stringify(signature)}`)
    return false
  } else if (signature instanceof Scalar) {
    if (signature.id === undefined || signature.id.length <= 0) {
      console.log(`NamedType cannot define a Scalar with no ID. ${JSON.stringify(signature)}`)
      return false
    }
    return true
  } else if (signature instanceof ListType) {
    return validateSignature(signature.of)
  } else if (signature instanceof NonNullType) {
    if (signature.of instanceof NonNullType) {
      console.log(
        `NamedType cannot contain NonNullType of a NonNullType. ${JSON.stringify(signature)}`
      )
      return false
    } else {
      return validateSignature(signature.of)
    }
  } else if (signature instanceof Sum) {
    // OPEN ISSUE -- Should Sum enforce uniqueness of its variants?
    // Note: Array.prototype.some() will return False on an empty array. This works
    // because an empty Product Field array is a valid Product signature.
    return !signature.variants.some(sig => !validateSignature(sig))
  } else if (signature instanceof Product) {
    const fieldNames: string[] = []
    // Note: Array.prototype.some() will return False on an empty array. This works
    // because an empty Product Field array is a valid Product signature.
    return !signature.fields.some(field => {
      // This logic returns TRUE if the Field is invalid
      if (!field.name || field.name.length <= 0 || fieldNames.includes(field.name)) {
        console.log(
          `NamedType of a Product must have all unique ProductField names. ${JSON.stringify(
            signature
          )}`
        )
        return true
      }
      fieldNames.push(field.name)
      return !validateSignature(field.type)
    })
  } else if (signature instanceof FunctionType) {
    const argumentNames: string[] = []
    // Note: Array.prototype.some() will return False on an empty array. This works
    // because an empty Product Field array is a valid Product signature.
    const argumentsValidCheck: boolean = !signature.arguments.some(arg => {
      // This logic returns TRUE if the Field is invalid
      if (!arg.name || arg.name.length <= 0 || argumentNames.includes(arg.name)) {
        console.log(
          `NamedType of a FunctionType must have all unique Argument names. ${JSON.stringify(
            signature
          )}`
        )
        return true
      }
      argumentNames.push(arg.name)
      return !validateSignature(arg.type)
    })

    return argumentsValidCheck && validateSignature(signature.resultType)
  } else {
    return false
  }
}
