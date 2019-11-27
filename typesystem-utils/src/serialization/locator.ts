import * as t from 'io-ts'
import * as l from '../model/locator'
import { either, isRight } from 'fp-ts/lib/Either'
import { PathReporter } from 'io-ts/lib/PathReporter'

interface IDRefFormat {
  idRef: string
}

interface ServiceAndNameLocatorFormat {
  serviceAndName: ServiceAndNameLocatorDetailsFormat
}

interface ServiceAndNameLocatorDetailsFormat {
  serviceId: string
  name: string
}

interface LocalNameLocatorFormat {
  localName: string
}

export type LocatorFormat = IDRefFormat | ServiceAndNameLocatorFormat | LocalNameLocatorFormat

export const IDRefLocatorCodec = new t.Type<l.IDRefLocator, IDRefFormat>(
  'IDRefLocator',
  (u): u is l.IDRefLocator => u instanceof l.IDRefLocator,
  (u, c) =>
    either.chain(t.type({ idRef: t.string }).validate(u, c), locator => {
      return t.success(
        new l.IDRefLocator({
          id: locator.idRef
        })
      )
    }),
  locator => {
    return { idRef: locator.id }
  }
)

export const ServiceAndNameLocatorCodec = new t.Type<
  l.ServiceAndNameLocator,
  ServiceAndNameLocatorFormat
>(
  'ServiceAndNameLocator',
  (u): u is l.ServiceAndNameLocator => u instanceof l.ServiceAndNameLocator,
  (u, c) =>
    either.chain(
      t.type({ serviceAndName: t.type({ serviceId: t.string, name: t.string }) }).validate(u, c),
      locator => {
        return t.success(
          new l.ServiceAndNameLocator({
            serviceId: locator.serviceAndName.serviceId,
            name: locator.serviceAndName.name
          })
        )
      }
    ),
  locator => {
    return { serviceAndName: { serviceId: locator.serviceId, name: locator.name } }
  }
)

export const LocalNameLocatorCodec = new t.Type<l.LocalNameLocator, LocalNameLocatorFormat>(
  'LocalNameLocator',
  (u): u is l.LocalNameLocator => u instanceof l.LocalNameLocator,
  (u, c) =>
    either.chain(t.type({ localName: t.string }).validate(u, c), locator => {
      return t.success(
        new l.LocalNameLocator({
          name: locator.localName
        })
      )
    }),
  locator => {
    return { localName: locator.name }
  }
)

export const LocatorCodec: t.Type<l.Locator, LocatorFormat> = t.union([
  IDRefLocatorCodec,
  ServiceAndNameLocatorCodec,
  LocalNameLocatorCodec
])

/**
 * Encodes locator into a javascript object representing serialization format.
 */
export const encodeLocator = (locator: l.Locator): object => {
  return LocatorCodec.encode(locator)
}

/**
 * Decodes locator from javascript object representing serialization format.
 * If format is invalid, will throw an error with list of failed validations
 */
export const decodeLocator = (u: unknown): l.Locator => {
  const decodedEither = LocatorCodec.decode(u)
  if (isRight(decodedEither)) {
    return decodedEither.right
  } else {
    const errors = PathReporter.report(decodedEither)
    throw new Error(errors.toString())
  }
}
