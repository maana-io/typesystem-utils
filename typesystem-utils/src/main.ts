// This is just a test - disregard for now

import { decodeTypeExpression, encodeTypeExpression } from './serialization/typeExpression'
import * as m from './model/typeExpression'
import * as l from './model/locator'

const intsToStrings = new m.FunctionType({
  arguments: [
    { 
      id: "ints",
      name: "ints",
      description: null,
      type: new m.NonNullType({
        of: new m.ListType({
          of: new m.NonNullType({
            of: new l.IDRefLocator({
              id: 'Long'
            })
          })
        })
      })
    }
  ],
  resultType: new m.NonNullType({
    of: new m.ListType({
      of: new m.NonNullType({
        of: new l.IDRefLocator({
          id: 'String'
        })
      })
    })
  })
})

console.log(JSON.stringify(encodeTypeExpression(intsToStrings)))
console.log(decodeTypeExpression(encodeTypeExpression(intsToStrings)))
