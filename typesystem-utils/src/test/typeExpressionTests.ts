import {
  NonNullType,
  IDRefLocator,
  TypeParameter,
  isValidLocator,
  ServiceAndNameLocator,
  LocalNameLocator,
  isValidNamedTypeSignature,
  Scalar,
  ListType,
  Sum,
  Product,
  ProductField,
  Argument,
  FunctionType
} from '../model'
import { TypeExpression } from '../scalars'

it('cannot parse NonNull(of: NonNull)', () => {
  const invalidNonNullValue = { nonNullOf: { nonNullOf: { idRef: 'String' } } }

  expect(() => {
    TypeExpression.parseValue(invalidNonNullValue)
  }).toThrowError('Cannot have a NonNullType of a NonNullType')
})

it('cannot parse TypeParameter with empty name', () => {
  const invalidTypeParameter = { typeParameter: '' }

  expect(() => {
    TypeExpression.parseValue(invalidTypeParameter)
  }).toThrowError('Cannot have a TypeParameter with empty Name field')
})

it('cannot construct Scalar with empty ID', () => {
  expect(() => {
    new Scalar({ id: '' })
  }).toThrowError('Cannot have a Scalar with ID of an empty string')
})

it('cannot construct NonNull(of: NonNull)', () => {
  expect(() => {
    new NonNullType({
      of: new NonNullType({ of: new IDRefLocator({ id: 'String' }) })
    })
  }).toThrowError('Cannot have a NonNullType of a NonNullType')
})

it('cannot construct TypeParameter with empty name', () => {
  expect(() => {
    new TypeParameter({ name: '' })
  }).toThrowError('Cannot have a TypeParameter with empty Name field')
})

it('isValidLocator can validate locators', () => {
  expect(isValidLocator(new IDRefLocator({ id: '' }))).toBe(false)
  expect(isValidLocator(new IDRefLocator({ id: 'Anything' }))).toBe(true)
  expect(isValidLocator(new ServiceAndNameLocator({ serviceId: '', name: '' }))).toBe(false)
  expect(isValidLocator(new ServiceAndNameLocator({ serviceId: 'Service', name: '' }))).toBe(false)
  expect(isValidLocator(new ServiceAndNameLocator({ serviceId: '', name: 'Name' }))).toBe(false)
  expect(isValidLocator(new ServiceAndNameLocator({ serviceId: 'Service', name: 'Name' }))).toBe(
    true
  )
  expect(isValidLocator(new LocalNameLocator({ name: '' }))).toBe(false)
  expect(isValidLocator(new LocalNameLocator({ name: 'Anything' }))).toBe(true)
})

it('isValidTypeExpression can validate TypeExpressions', () => {
  // Scalar
  //const invalidScalar = new Scalar({ id: '' })
  //expect(isValidNamedTypeSignature(invalidScalar)).toBe(false)
  const validScalar = new Scalar({ id: 'Anything' })
  expect(isValidNamedTypeSignature(validScalar)).toBe(true)

  // TypeParameter
  const validTypeParam = new TypeParameter({ name: 'Anything' })
  expect(isValidNamedTypeSignature(validTypeParam)).toBe(false)

  // List
  //const invalidListOfInvalidScalar = new ListType({ of: invalidScalar })
  //expect(isValidNamedTypeSignature(invalidListOfInvalidScalar)).toBe(false)
  const invalidListOfJsonObject = new ListType({ of: { id: 'Anything' } })
  const invalidListOfTypeParam = new ListType({ of: validTypeParam })
  const validListOfValidScalar = new ListType({ of: validScalar })
  expect(isValidNamedTypeSignature(invalidListOfJsonObject)).toBe(false)
  expect(isValidNamedTypeSignature(invalidListOfTypeParam)).toBe(false)
  expect(isValidNamedTypeSignature(validListOfValidScalar)).toBe(false)

  // NonNull
  const invalidNonNullOfJsonObject = new NonNullType({ of: { id: 'Anything' } })
  const invalidNonNullOfTypeParam = new NonNullType({ of: validTypeParam })
  const validNonNullOfValidScalar = new NonNullType({ of: validScalar })
  expect(isValidNamedTypeSignature(invalidNonNullOfJsonObject)).toBe(false)
  expect(isValidNamedTypeSignature(invalidNonNullOfTypeParam)).toBe(false)
  expect(isValidNamedTypeSignature(validNonNullOfValidScalar)).toBe(false)

  // Sum
  const invalidSumOfInvalidJsonObject = new Sum({ variants: [{ id: 'Anything' }] })
  const invalidSumOfTypeParam = new Sum({ variants: [validTypeParam] })
  const invalidSumOfMultipleVariants = new Sum({
    variants: [validNonNullOfValidScalar, validListOfValidScalar, invalidListOfJsonObject]
  })
  const validSumOfEmptyVariants = new Sum({ variants: [] })
  const validSumOfMultipleVariants = new Sum({
    variants: [validNonNullOfValidScalar, validListOfValidScalar, validScalar]
  })
  expect(isValidNamedTypeSignature(invalidSumOfInvalidJsonObject)).toBe(false)
  expect(isValidNamedTypeSignature(invalidSumOfTypeParam)).toBe(false)
  expect(isValidNamedTypeSignature(invalidSumOfMultipleVariants)).toBe(false)
  expect(isValidNamedTypeSignature(validSumOfEmptyVariants)).toBe(true)
  expect(isValidNamedTypeSignature(validSumOfMultipleVariants)).toBe(true)

  // Product
  const invalidProductFieldOfValidSum = new ProductField({ type: validSumOfEmptyVariants })
  const invalidProductFieldOfInvalidNonNull = new ProductField({
    name: 'invalidProductFieldOfInvalidNonNull',
    type: invalidNonNullOfJsonObject
  })
  const validProductFieldOfValidSum = new ProductField({
    name: 'validProductFieldOfValidSum',
    type: validSumOfEmptyVariants
  })

  const invalidProductOfNamelessField = new Product({
    fields: [invalidProductFieldOfValidSum],
    extendable: false
  })
  const invalidProductOfNonuniqueFieldNames = new Product({
    fields: [validProductFieldOfValidSum, validProductFieldOfValidSum],
    extendable: false
  })
  const invalidProductOfInvalidFieldType = new Product({
    fields: [validProductFieldOfValidSum, invalidProductFieldOfInvalidNonNull],
    extendable: true
  })
  const validProductEmpty = new Product({ fields: [], extendable: true })
  const validProductSingleField = new Product({
    fields: [validProductFieldOfValidSum],
    extendable: false
  })

  expect(isValidNamedTypeSignature(invalidProductOfNamelessField)).toBe(false)
  expect(isValidNamedTypeSignature(invalidProductOfNonuniqueFieldNames)).toBe(false)
  expect(isValidNamedTypeSignature(invalidProductOfInvalidFieldType)).toBe(false)
  expect(isValidNamedTypeSignature(validProductEmpty)).toBe(true)
  expect(isValidNamedTypeSignature(validProductSingleField)).toBe(true)

  // FunctionType
  const invalidArgumentOfValidProduct = new Argument({ type: validSumOfEmptyVariants })
  const invalidArgumentfInvalidList = new Argument({
    name: 'invalidArgumentOfInvalidList',
    type: invalidListOfTypeParam
  })
  const validArgumentOfValidList = new ProductField({
    name: 'validArgumentOfValidList',
    type: validListOfValidScalar
  })

  const invalidFunctionTypeOfNamelessArgument = new FunctionType({
    arguments: [invalidArgumentOfValidProduct],
    resultType: validScalar
  })
  const invalidFunctionTypeOfNonuniqueArgumentNames = new FunctionType({
    arguments: [validArgumentOfValidList, validArgumentOfValidList],
    resultType: validScalar
  })
  const invalidFunctionTypeOfInvalidArgumentType = new FunctionType({
    arguments: [validArgumentOfValidList, invalidArgumentfInvalidList],
    resultType: validProductSingleField
  })
  const invalidFunctionTypeOfInvalidResultType = new FunctionType({
    arguments: [validArgumentOfValidList],
    resultType: invalidProductOfInvalidFieldType
  })

  const validFunctionTypeEmptyArguments = new FunctionType({
    arguments: [],
    resultType: validListOfValidScalar
  })
  const validFunctionTypeSingleArgument = new FunctionType({
    arguments: [validArgumentOfValidList],
    resultType: validNonNullOfValidScalar
  })

  expect(isValidNamedTypeSignature(invalidFunctionTypeOfNamelessArgument)).toBe(false)
  expect(isValidNamedTypeSignature(invalidFunctionTypeOfNonuniqueArgumentNames)).toBe(false)
  expect(isValidNamedTypeSignature(invalidFunctionTypeOfInvalidArgumentType)).toBe(false)
  expect(isValidNamedTypeSignature(invalidFunctionTypeOfInvalidResultType)).toBe(false)

  expect(isValidNamedTypeSignature(validFunctionTypeEmptyArguments)).toBe(false)
  expect(isValidNamedTypeSignature(validFunctionTypeSingleArgument)).toBe(false)

  // Sum and Products of FunctionType
  const invalidSumOfInvalidFunction = new Sum({variants: [validFunctionTypeEmptyArguments, validFunctionTypeSingleArgument, validProductSingleField, invalidFunctionTypeOfNonuniqueArgumentNames]})
  expect(isValidNamedTypeSignature(invalidSumOfInvalidFunction)).toBe(false)
  const validSumOfValidFunction = new Sum({variants: [validFunctionTypeEmptyArguments, validFunctionTypeSingleArgument, validProductSingleField, validSumOfMultipleVariants]})
  expect(isValidNamedTypeSignature(validSumOfValidFunction)).toBe(true)

  const invalidProductFieldOfInvalidFunction = new ProductField({ name: 'invalidProductFieldOfInvalidFunction', type: invalidFunctionTypeOfInvalidResultType })
  const invalidProductOfInvalidFunction = new Product({ fields: [validProductFieldOfValidSum, invalidProductFieldOfInvalidFunction], extendable: true })
  expect(isValidNamedTypeSignature(invalidProductOfInvalidFunction)).toBe(false)
})
