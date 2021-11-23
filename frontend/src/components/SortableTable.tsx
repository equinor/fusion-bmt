import React, { useMemo, useState } from 'react'
import { Icon, Table } from '@equinor/eds-core-react'
import { chevron_down, chevron_up } from '@equinor/eds-icons'
import styled from 'styled-components'
import { SortDirection } from '../utils/sort'

const { Body, Row, Cell, Head } = Table

Icon.add({ chevron_down, chevron_up })
const SortIcon = styled(Icon)<{
    name: string
    isSelected: boolean
}>`
    visibility: ${({ isSelected }) => (isSelected ? 'visible' : 'hidden')};
`

export type Column = {
    name: string
    accessor: string
    sortable: boolean
}

interface Props<DataType> {
    columns: Column[]
    data: DataType[]
    sortOnAccessor: (a: DataType, b: DataType, accessor: string, sortDirection: SortDirection) => number
    renderRow: (dataObject: DataType, index: number) => React.ReactChild
    testId: string
}

const SortableTable = <DataType,>({ columns, data, sortOnAccessor, renderRow, testId }: Props<DataType>) => {
    const [sortDirection, setSortDirection] = useState<SortDirection>('none')
    const [columnToSortBy, setColumnToSortBy] = useState<Column>()

    const sortedData = useMemo(() => {
        if (columnToSortBy) {
            return [...data].sort((a: DataType, b: DataType) => {
                const { accessor } = columnToSortBy

                return sortOnAccessor(a, b, accessor, sortDirection)
            })
        }
        return data
    }, [columnToSortBy, sortDirection, data])

    const setSortOn = (selectedColumn: Column) => {
        if (columnToSortBy && selectedColumn.name === columnToSortBy.name) {
            if (sortDirection === 'ascending') {
                setSortDirection('descending')
            } else {
                setSortDirection('none')
                setColumnToSortBy(undefined)
            }
        } else {
            setColumnToSortBy(selectedColumn)
            setSortDirection('ascending')
        }
    }

    return (
        <>
            <Table style={{ width: '100%' }} data-testid={testId}>
                <Head>
                    <Row>
                        {columns.map(column => {
                            const isSelected = columnToSortBy ? column.name === columnToSortBy.name : false
                            return (
                                <Cell
                                    key={column.name}
                                    onClick={column.sortable ? () => setSortOn(column) : undefined}
                                    sort={isSelected ? sortDirection : 'none'}
                                    style={{ cursor: column.sortable ? 'pointer' : 'default' }}
                                >
                                    {column.name}
                                    {column.sortable && (
                                        <SortIcon
                                            name={sortDirection === 'descending' ? 'chevron_up' : 'chevron_down'}
                                            isSelected={isSelected}
                                        />
                                    )}
                                </Cell>
                            )
                        })}
                    </Row>
                </Head>
                <Body>{sortedData.map((dataObject, index) => renderRow(dataObject, index))}</Body>
            </Table>
        </>
    )
}

export default SortableTable
