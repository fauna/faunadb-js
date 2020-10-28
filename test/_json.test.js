const { parseJSONStreaming } = require('../src/_json')

describe('parseJSONStreaming', () => {
  test('mutiple JSON objects in a message', () => {
    const jsonText = `{"event":"version","txnTS":1603314266030000,"data":{"ref":{"@ref":{"id":"279947947320279552","collection":{"@ref":{"id":"Status","collection":{"@ref":{"id":"collections"}}}}}},"ts":{"@ts":"2020-10-21T21:04:26.030Z"},"action":"update","new":{"data":{"foo":"bar","scores":[30,27,9]}}}}{"event":"version","txnTS":1603314266050000,"data":{"ref":{"@ref":{"id":"279947947320279552","collection":{"@ref":{"id":"Status","collection":{"@ref":{"id":"collections"}}}}}},"ts":{"@ts":"2020-10-21T21:04:26.050Z"},"action":"update","new":{"data":{"foo":"bar","scores":[31,27,9]}}}}`
    const result = parseJSONStreaming(jsonText)

    expect(result).toHaveLength(2)
  })
})
