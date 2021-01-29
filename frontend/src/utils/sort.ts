import { Priority } from '../api/models'

export type SortDirection = 'ascending' | 'descending' | 'none'

export const sort = (a: string | boolean | number, b: string | boolean | number, sortDirection: SortDirection) => {
    if (a < b) {
        return sortDirection === 'ascending' ? -1 : 1
    }

    if (a > b) {
        return sortDirection === 'ascending' ? 1 : -1
    }

    return 0
}

export const sortPriority = (a: Priority, b: Priority, sortDirection: SortDirection) => {
    if (
        (a === Priority.Low && b === Priority.Medium) ||
        (a === Priority.Medium && b === Priority.High) ||
        (a === Priority.Low && b === Priority.High)
    ) {
        return sortDirection === 'ascending' ? -1 : 1
    } else if (
        (a === Priority.High && b === Priority.Low) ||
        (a === Priority.Medium && b === Priority.Low) ||
        (a === Priority.High && b === Priority.Medium)
    ) {
        return sortDirection === 'ascending' ? 1 : -1
    }

    return 0
}
