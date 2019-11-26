# Maana Q Typesystem Utils

Collection of utilities to work with Q type system, specifically with its Public API representation

## TypeExpression Scalar

Replacement for all types in Public API that are related to TypeExpression - i.e.:
* TypeExpression and its hierarchy
* TypeExpressionInput and its hierarchy
* Additionally, Locators for pointing to concrete type and function

In addition to scalar itself, this library exposes validation and serialization format, with following goals in mind:
* Serialization format should be concise (there's no need to include '__typename' like in GraphQL)
* At the same time, it must not be ambiguous, i.e. serialized type expression should have one and only one representation in JSON

### Model types and serialization format

Each type expression has JSON representation as one of the following variants:

#### TypeRef

To be replaces with locators.

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
  "listOf": <inner type expression serialized>
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
  "nonNullOf": <inner type expression serialized>
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
