import { Organization } from './models'

describe('Test models', () => {
    test('Organization to string', () => {
        const org: Organization = Organization.Engineering
        const enumString: string = org
        expect(enumString).toBe('ENGINEERING')
    })

    test('Organization from string', () => {
        const orgString: string = "ENGINEERING"
        const enumValue: Organization = orgString as Organization
        expect(enumValue).toBe(Organization.Engineering)
    })
})
