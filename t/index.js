var assert = require('assert').strict
const bc = require('../index')

describe('Integration tests', () => {
    it('Retrieves countries', async () => {
        var ret = await bc.countries()
        assert.ok(Object.keys(ret).length > 0)
    })
    it('Retrieves banks (Argentina)', async () => {
        var ret = await bc.banks('Argentina')
        assert.ok(Object.keys(ret).length > 0)
    })
})

describe('Cache import', () => {
    it('Imports properly', () => {
        const json = require('../cache.json')
        assert.ok(!!json.fn)
    })
})