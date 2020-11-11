import { Organization } from './models'

describe('Test models', () => {
    test('Organization to string', () => {
        const org: Organization = Organization.Engineering
        const enumString: string = org
        expect(enumString).toBe('Engineering')
    })

    test('Organization from string', () => {
        const orgString: string = "Engineering"
        const enumValue: Organization = orgString as Organization
        expect(enumValue).toBe(Organization.Engineering)
    })
})
