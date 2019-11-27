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