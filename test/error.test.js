const {
  ValidationError,
  FunctionCallError,
  FaunaHTTPError,
  InvalidArgumentError,
} = require('../src/errors')

const makeError = (statusCode, error) => ({
  statusCode,
  responseContent: { errors: [error] },
})

describe('Error', () => {
  test('ValidationError', () => {
    try {
      FaunaHTTPError.raiseForStatusCode(
        makeError(400, {
          position: ['create_access_provider'],
          code: 'validation failed',
          description: 'document data is not valid.',
          failures: [
            {
              field: ['issuer'],
              code: 'duplicate value',
              description: 'Value is not unique.',
            },
          ],
        })
      )
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError)
      expect(error.position).toEqual(['issuer'])
      expect(error.code).toEqual('duplicate value')
      expect(error.description).toEqual('Value is not unique.')
    }
  })

  test('FunctionCallError', () => {
    try {
      FaunaHTTPError.raiseForStatusCode(
        makeError(400, {
          position: [],
          code: 'call error',
          description: 'Calling the function resulted in an error.',
          cause: [
            {
              position: ['expr'],
              code: 'invalid argument',
              description: 'Illegal division by zero.',
            },
          ],
        })
      )
    } catch (error) {
      expect(error).toBeInstanceOf(FunctionCallError)
      expect(error.position).toEqual(['expr'])
      expect(error.code).toEqual('invalid argument')
      expect(error.description).toEqual('Illegal division by zero.')
    }
  })

  test('InvalidArgumentError', () => {
    try {
      FaunaHTTPError.raiseForStatusCode(
        makeError(400, {
          position: ['params'],
          code: 'invalid argument',
          description: 'Object expected, String provided.',
        })
      )
    } catch (error) {
      expect(error.name).toEqual('InvalidArgumentError')
      expect(error.position).toEqual(['params'])
      expect(error.code).toEqual('invalid argument')
      expect(error.description).toEqual('Object expected, String provided.')
    }
  })
})
