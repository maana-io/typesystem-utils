import { Kind, ObjectValueNode, ObjectFieldNode, ValueNode } from 'graphql/language'

type Maybe<T> = null | undefined | T;

export const parseObject = (ast: ObjectValueNode, variables: any) => {
  const value = Object.create(null);
  ast.fields.forEach((field: ObjectFieldNode) => {
    // eslint-disable-next-line no-use-before-define
    value[field.name.value] = parseLiteral(
      field.value, variables);
  });

  return value;
}

export const parseLiteral = (ast: ValueNode, variables: Maybe<{ [key: string]: any }>): any => {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.OBJECT:
      return parseObject(ast, variables);
    case Kind.LIST:
      return ast.values.map((n: any) => parseLiteral(n, variables));
    case Kind.NULL:
      return null;
    case Kind.VARIABLE: {
      const name = ast.name.value;
      return variables ? variables[name] : undefined;
    }
    default:
      return undefined;
  }
}
