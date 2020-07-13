export type Locator = IDRefLocator | ServiceAndNameLocator | LocalNameLocator

/**
 * Locate entity (e.g. type or function) using its id
 */
export class IDRefLocator {
  readonly id: string
  constructor(props: IDRefLocator) {
    this.id = props.id
  }
}

/**
 * Locate entity (e.g. type or function) using its service id and name
 */
export class ServiceAndNameLocator {
  readonly serviceId: string
  readonly name: string

  constructor(props: ServiceAndNameLocator) {
    this.serviceId = props.serviceId
    this.name = props.name
  }
}

/**
 * Locate entity (e.g. type or function) using its name within a local context,
 * e.g. in the service being added.
 */

export class LocalNameLocator {
  readonly name: string

  constructor(props: LocalNameLocator) {
    this.name = props.name
  }
}

export function isValidLocator(locator: Locator): boolean {
  if (!locator) return false

  if (locator instanceof IDRefLocator) {
    return locator.id !== undefined && locator.id.length > 0
  }

  if (locator instanceof ServiceAndNameLocator) {
    return (
      locator.serviceId !== undefined &&
      locator.serviceId.length > 0 &&
      locator.name !== undefined &&
      locator.name.length > 0
    )
  }

  if (locator instanceof LocalNameLocator) {
    return locator.name !== undefined && locator.name.length > 0
  }

  return false
}
