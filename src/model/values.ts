import { Locator } from './locator'

export type Value =
  | StringValue
  | EnumValue
  | IDValue
  | LongValue
  | BooleanValue
  | DoubleValue
  | ObjectValue
  | ListValue
  | FunctionValue

export class StringValue {
  readonly value: string

  constructor(props: StringValue) {
    this.value = props.value
  }
}

export class EnumValue {
  readonly value: Value

  constructor(props: EnumValue) {
    this.value = props.value
  }
}

export class IDValue {
  readonly value: string

  constructor(props: IDValue) {
    this.value = props.value
  }
}

export class LongValue {
  readonly value: bigint

  constructor(props: { value: number | Number | string | bigint }) {
    this.value = BigInt(props.value)
  }
}

export class BooleanValue {
  readonly value: boolean

  constructor(props: BooleanValue) {
    this.value = props.value
  }
}

export class DoubleValue {
  readonly value: Number

  constructor(props: { value: number | Number | string | bigint }) {
    this.value = Number(props.value)
  }
}

export class ObjectValue {
  readonly value: Map<string, Value>

  constructor(props: ObjectValue) {
    this.value = props.value
  }
}
7

export class ListValue {
  readonly value: Value[]

  constructor(props: ListValue) {
    this.value = props.value
  }
}

export class FunctionValue {
  readonly value: Locator

  constructor(props: FunctionValue) {
    this.value = props.value
  }
}
