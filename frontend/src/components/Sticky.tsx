import React, { ReactNode } from 'react'

const fusionTopBarHeight = '100px'

interface Props {
    children?: ReactNode
}

const StickyWithMaxHeight = ({ children }: Props) => {
    return (
        <>
            <div
                data-testid="sticky"
                style={{
                    position: 'sticky',
                    top: 0,
                    overflowY: 'auto',
                    maxHeight: `calc(100vh - ${fusionTopBarHeight})`,
                }}
            >
                {children}
            </div>
        </>
    )
}

export default StickyWithMaxHeight
