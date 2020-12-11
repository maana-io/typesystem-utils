# Maana Q Typesystem Utils

Collection of utilities to work with Q type system, specifically with its Public API representation

# TypeExpression and Locator Scalars

To use scalars, add them to your schema:

```
scalar Locator
scalar TypeExpression
```

and add them to your resolver map:

```
import { Locator, TypeExpression } from 'typesystem-utils/scalars'

  ...
  Mutation: {
    ...FunctionResolver.Mutation,
    ...FunctionGraphResolver.Mutation,
    ...ServiceResolver.Mutation,
    ...TypeResolver.Mutation
  },
  Locator,
  TypeExpression
```

You can also use `encodeLocator`, `decodeLocator`, `encodeTypeExpression` and `decodeTypeExpression`
functions directly for encoding and validation.

**Note**: To use this scalar, instances of model classes should be used, i.e. you must use
`const locator = new IDRefLocator({ id: "myTypeId" })` instead of `const locator = { id: "myTypeId"})`,
but as class constructors all receive an object with type properties, second constant can be used to
instantiate an object of required class:

```
import { IDRefLocator } from 'typesystem-utils'

const locatorObject = { id: "myTypeId"})
const locatorClassInstance = new IDRefLocator(locatorObject)
```

## Locator scalar

Convenience data structure that is used to uniquely identify referred entity, e.g. types and functions.
Locators can be used in type expressions to identify a type within a type expression, or to request
information about types or functions from catalog service's public API.

There are three types of locators:

### IDRefLocator

Locate entity (e.g. type or function) using its id.

**Model**

```
new IDRefLocator({id: "myTypeId"})
```

**Serialization**

```
{ "idRef": "myTypeId"}
```

### ServiceAndNameLocator
Locate entity (e.g. type or function) using its service id and name

**Model**

```
new ServiceAndNameLocator({ serviceId: "io.maana.catalog" name: "updateService" })
```

**Serialization**

```
{ "serviceAndName": { "serviceId": "io.maana.catalog", name: "updateService" }}
```

### LocalNameLocator

Locate entity (e.g. type or function) using its name within a local context,
e.g. in the service being added.

**Model**
```
new LocalNameLocator({ name: "ThatOtherType" })
```

**Serialization**

```
{ "localName": "ThatOtherType" }
```

## TypeExpression Scalar

Replacement for all types in Public API that are related to TypeExpression - i.e.:
* TypeExpression and its hierarchy
* TypeExpressionInput and its hierarchy
* Additionally, Locators for pointing to concrete type and function

In addition to scalar itself, this library exposes validation and serialization format, with following goals in mind:
* Serialization format should be concise (there's no need to include '__typename' like in GraphQL)
* At the same time, it must not be ambiguous, i.e. serialized type expression should have one and only one representation in JSON

### Model types and serialization format

Each type expression has JSON representation as one of the following variants or locator (see above):

#### ListType

Lists of values of specific type - equivalent to KindDB's 'LIST' modifier

**Model**:

```
new ListType({
  of: <other type expression>
})
```

**Serialization**:

```
{
  "listOf": <serialized inner type expression>
}
```

#### NonNullType

Non-nullable type - equivalent to KindDB's 'NONULL' modifier

**Model**:

```
new NonNullType({
  of: <other type expression>
})
```

**Serialization**:
```
{
  "nonNullOf": <serialized inner type expression>
}
```

#### TypeParameter

Type parameters are placeholders for types that will be determined from usage. For instance,
the function "isEmpty" that returns true if a list is empty, and false otherwise can be given a type:

```
  isEmpty( list: [ a ] ): Boolean
```

where "a" is a placeholder for the type of elements in the list. Types can contain multiple type parameters.
For example, the map function contains two type parameters that represent the type of elements in the source
and target lists:

```
  map( function: a -> b, list: [a] ): [b]
```

Type parameters are scoped to the definition in which they occur. The type parameter "a" that occurs in
isEmpty can be assigned a different type parameter "a" that occurs in the map function. Furthermore, two
different instances of a function can have different types assigned to their parameters. This allows us 
to define generic types and functions.

**Model**:

```
new TypeParameter({
  name: <name of type parameter>
})
```

**Serialization**:

```
{
  "typeParameter": "<name of type parameter>"
}
```

#### Scalar

Reference to a scalar type (note: current definition is somewhat vague - scalar type has only one field - id of the scalar type itself)

**Model**:

```
new Scalar({
  id: <id of the scalar type>
})
```

**Serialization**:

```
{
  "scalar": "<id of the scalar type>"
}
```

#### Sum

Sum type - one of multiple types.

**Model**:

```
new Sum({
  variants: [<... variant type expressions>]
})
```

**Serialization**:

```
{
  "sum": [<serialized variant type expressions>]
}
```

#### Product

Product type - combination ('product') of other types.

Contrary to other type systems, it is name-based rather than position-based,
as most of external interfaces use named fields; and it is easy to go from
position-based to name-based products, but opposite is hard.

**Model**:

```
new Product({
  fields: [
    { name: "<name of field>", description: "<optional description>", type: <type of a field> }
    ...
  ],
  extendable: <boolean flag if it is exact list of fields or there may be more>
})
```

**Serialization**:
```
{
  "product": {
    fields: [
      { name: "<name of field>", description: "<optional description>", type: <serialized type expression> }
    ],
    "extendable": <boolean>
  }
}
```

#### Function Type

Function Type is a Type Expression that allows using Functions as first-class values.

Arguments of a function are name-based rather than order-based, but as order of arguments matters for Type
System internals, it is guaranteed to be returned in the same order between updates.

If ordering matters in the future, Catalog will define API for changing order of fields without exposing 
actual ordinals.

**Model**:

```
new m.FunctionType({
  arguments: [
    { 
      id: "<id of a field>",
      name: "<name>",
      description: "optional descrption",
      type: <type of the argument>
    }
  ],
  resultType: <result type of a function>
})
```

**Serialization**:

```
{
  "function": {
    "arguments": [
      {
        "id": "<id>",
        "name": "<name>",
        "description": "description",
        "type": <serialized type expression>
      }
    ],
    "resultType": <serialized type expression>
  }
}
```

### Examples

All of the examples above mention `<serialized type expression>` to describe nested types, example:

Type Promise is generic over type of value V, with two fields - indicator if promise is ready, and a function
to get value.

Type defined in a model:

```
const promiseType = new Product({
    fields: [
      {
        name: 'isReady',
        type: new NonNullType({ of: new Scalar({ id: 'Boolean' })}) 
      },
      {
        name: 'getValue',
        type: new FunctionType({
          arguments: [],
          resultType: new TypeParameter({ name: 'V'})
        })
      }
    ],
    extendable: false
  })
```

Serialized format:

```
{
  "product": {
    "fields": [
      { "name": "isReady", "type": { "nonNullOf": { "scalar": "Boolean" } } },
      {
        "name": "getValue",
        "type": {
          "function": {
            "arguments": [],
            "resultType": { "typeParameter": "V" }
          }
        }
      }
    ],
    "extendable": false
  }
}
```

References to types and functions are done using Locators, for instance, following is simplicitic definition of services,
based on (non-existent at the moment) types Function and Type defined in 'io.maana.core' service:

Model:

```
const IDScalar = new Scalar({ id: 'ID '})
const StringScalar = new Scalar({ id: 'String' })

const FunctionTypeRef = new ServiceAndNameLocator({ name: 'Function', serviceId: 'io.maana.core' })
const TypeTypeRef = new ServiceAndNameLocator({ name: 'Type', serviceId: 'io.maana.core' })

const logicServiceType = new Product({
  extendable: false,
  fields: [
    { name: 'id', type: IDScalar },
    { name: 'functions', type: new ListType({ of: FunctionTypeRef })},
    { name: 'types', type: new ListType({ of: TypeTypeRef })}
  ]
})

const externalServiceType = new Product({
  extendable: false,
  fields: [
    { name: 'endpointUrl', type: StringScalar },
    { name: 'graphQLSchema', type: StringScalar }
  ]
})

const serviceType = new Sum({
  variants: [
    logicServiceType,
    externalServiceType
  ]
})
```

Serialized format:

```
{
  "sumOf": [
    {
      "product": {
        "fields": [
          { "name": "id", "type": { "scalar": "ID " } },
          {
            "name": "functions",
            "type": {
              "listOf": { "serviceAndName": { "serviceId": "io.maana.core", "name": "Function" }
              }
            }
          },
          {
            "name": "types",
            "type": {
              "listOf": { "serviceAndName": { "serviceId": "io.maana.core", "name": "Type" }}
            }
          }
        ],
        "extendable": false
      }
    },
    {
      "product": {
        "fields": [
          { "name": "endpointUrl", "type": { "scalar": "String" } },
          { "name": "graphQLSchema", "type": { "scalar": "String" } }
        ],
        "extendable": false
      }
    }
  ]
}
```

## Type expression traversals

This package also exposes two functions that make type expression interrogation and modification easier, `traverseTypeExpression` and `traverseTypeExpressionAsync`.
These functions take a list of callbacks for specific type expression types, type expression, and produce a type expression that applied callbacks to all type expressions,
recursively.

Mapper has the following shape (async version takes async functions as arguments):
```
type TraverseMapper = {
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
}
```

### Usage examples

Traverse type expression recursively and collect all locators, without modification of original type expression

```
export function extractLocatorsFromTypeExpression(typeExpression: tsutils.TypeExpression): tsutils.Locator[] {
  const locators: tsutils.Locator[] = []

  function addLocator(locator: tsutils.Locator): tsutils.Locator {
    locators.push(locator)
    return locator
  }

  traverseTypeExpression(typeExpression, {
    onIDRefLocator: addLocator,
    onServiceAndNameLocator: addLocator,
    onLocalNameLocator: addLocator
  })

  return _.uniqWith(locators, _.isEqual)
}
```

Rewrite all IDRefLocators with ServiceAndNameLocators

```
export async function rewriteIdRefToSnNLocator(te: tsutils.TypeExpression, store: Store) {
  return traverseTypeExpressionAsync(te, {
    onIDRefLocator: async (loc) => {
      const type = await store.type(loc)
      return type ? new tsutils.ServiceAndNameLocator({ serviceId: type.serviceId, name: type.name }) : new tsutils.ServiceAndNameLocator({
        serviceId: "Unknown service",
        name: JSON.stringify(tsutils.encodeTypeExpression(loc))
      })
    }
  })
}
```