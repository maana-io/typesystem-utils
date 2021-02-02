import * as t from 'io-ts'
import * as v from '../model/values'
import * as ls from './locator'
import { either, isRight } from 'fp-ts/lib/Either'
import { PathReporter } from 'io-ts/lib/PathReporter'

interface StringValueFormat {
  string: string
}

interface EnumValueFormat {
  enumValue: ValueFormat
}

interface IDValueFormat {
  id: string
}

interface LongValueFormat {
  long: string
}

interface BooleanValueFormat {
  boolean: boolean
}

interface DoubleValueFormat {
  double: number
}

interface ObjectValueFormat {
  object: object
}

interface ListValueFormat {
  list: ValueFormat[]
}

interface FunctionValueFormat {
  fn: ls.LocatorFormat
}

export type ValueFormat =
  | StringValueFormat
  | EnumValueFormat
  | IDValueFormat
  | LongValueFormat
  | BooleanValueFormat
  | DoubleValueFormat
  | ObjectValueFormat
  | ListValueFormat
  | FunctionValueFormat

export const StringValueCodec = new t.Type<v.StringValue, StringValueFormat>(
  'StringValue',
  (u): u is v.StringValue => u instanceof v.StringValue,
  (u, c) =>
    either.chain(t.type({ string: t.string }).validate(u, c), sv => {
      return t.success(new v.StringValue({ value: sv.string }))
    }),
  sv => {
    return { string: sv.value }
  }
)

export const EnumValueCodec = new t.Type<v.EnumValue, EnumValueFormat>(
  'EnumValue',
  (u): u is v.EnumValue => u instanceof v.EnumValue,
  (u, c) =>
    either.chain(t.interface({ enumValue: ValueCodec }).validate(u, c), ev => {
      return t.success(new v.EnumValue({ value: ev.enumValue }))
    }),
  ev => {
    return { enumValue: ValueCodec.encode(ev.value) }
  }
)

export const IDValueCodec = new t.Type<v.IDValue, IDValueFormat>(
  'IDValue',
  (u): u is v.IDValue => u instanceof v.IDValue,
  (u, c) =>
    either.chain(t.type({ id: t.string }).validate(u, c), iv => {
      return t.success(new v.IDValue({ value: iv.id }))
    }),
  iv => {
    return { id: iv.value }
  }
)

export const LongValueCodec = new t.Type<v.LongValue, LongValueFormat>(
  'LongValue',
  (u): u is v.LongValue => u instanceof v.LongValue,
  (u, c) =>
    either.chain(t.type({ long: t.string }).validate(u, c), lv => {
      return t.success(new v.LongValue({ value: lv.long }))
    }),
  lv => {
    return { long: lv.value.toString() }
  }
)

export const BooleanValueCodec = new t.Type<v.BooleanValue, BooleanValueFormat>(
  'BooleanValue',
  (u): u is v.BooleanValue => u instanceof v.BooleanValue,
  (u, c) =>
    either.chain(t.type({ boolean: t.boolean }).validate(u, c), bv => {
      return t.success(new v.BooleanValue({ value: bv.boolean }))
    }),
  bv => {
    return { boolean: bv.value }
  }
)

export const DoubleValueCodec = new t.Type<v.DoubleValue, DoubleValueFormat>(
  'DoubleValue',
  (u): u is v.DoubleValue => u instanceof v.DoubleValue,
  (u, c) =>
    either.chain(t.type({ double: t.number }).validate(u, c), dv => {
      return t.success(new v.DoubleValue({ value: dv.double }))
    }),
  dv => {
    return { double: dv.value.valueOf() }
  }
)

export const ObjectValueCodec = new t.Type<v.ObjectValue, ObjectValueFormat>(
  'ObjectValue',
  (u): u is v.ObjectValue => u instanceof v.ObjectValue,
  (u, c) =>
    either.chain(t.type({ object: t.object }).validate(u, c), ov => {
      return t.success(new v.ObjectValue({ value: new Map(Object.entries(ov.object)) }))
    }),
  ov => {
    return { object: Object.fromEntries(ov.value) }
  }
)

export const ListValueCodec = new t.Type<v.ListValue, ListValueFormat>(
  'ListValue',
  (u): u is v.ListValue => u instanceof v.ListValue,
  (u, c) =>
    either.chain(t.interface({ list: t.array(ValueCodec) }).validate(u, c), lv => {
      return t.success(new v.ListValue({ value: lv.list }))
    }),
  lv => {
    return { list: lv.value.map(ValueCodec.encode) }
  }
)

export const FunctionValueCodec = new t.Type<v.FunctionValue, FunctionValueFormat>(
  'FunctionValue',
  (u): u is v.FunctionValue => u instanceof v.FunctionValue,
  (u, c) =>
    either.chain(t.type({ fn: ls.LocatorCodec }).validate(u, c), fv => {
      return t.success(new v.FunctionValue({ value: fv.fn }))
    }),
  fv => {
    return { fn: ls.LocatorCodec.encode(fv.value) }
  }
)

export const ValueCodec: t.Type<v.Value, ValueFormat> = t.union([
  StringValueCodec,
  IDValueCodec,
  EnumValueCodec,
  LongValueCodec,
  BooleanValueCodec,
  DoubleValueCodec,
  ObjectValueCodec,
  ListValueCodec,
  FunctionValueCodec
])

export const decodeValue = (u: unknown): v.Value => {
  const decodedEither = ValueCodec.decode(u)
  if (isRight(decodedEither)) {
    return decodedEither.right
  } else {
    const errors = PathReporter.report(decodedEither)
    throw new Error(errors.toString())
  }
}

export const encodeValue = (value: v.Value): object => {
  return ValueCodec.encode(value)
}
