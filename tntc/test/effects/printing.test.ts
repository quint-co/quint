import { describe, it } from 'mocha'
import { assert } from 'chai'
import { errorTreeToString } from '../../src/effects/printing'

// Other printing methods are heavily tested throughout the suite

describe('errorTreeToString', () => {
  it('converts errorTree to multiline string', () => {
    const errorTree = {
      location: 'General location',
      children: [
        {
          location: 'Specific location 1',
          message: 'Message for 1',
          children: [],
        },
        {
          location: 'Specific location 2',
          message: 'Message for 2',
          children: [],
        },
      ],
    }

    const expectedError = `Message for 1
Specific location 1
and
Message for 2
Specific location 2
General location
`

    assert.deepEqual(errorTreeToString(errorTree), expectedError)
  })
})
