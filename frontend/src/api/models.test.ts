import { Organization } from './models'

describe('Test models', () => {
    test('Organization to string', () => {
        const org: Organization = Organization.ENGINEERING

        const enumString: string = Organization.toString(org)

        expect(enumString).toBe('ENGINEERING')
    })
})
