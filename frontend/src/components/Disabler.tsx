import React, { PropsWithChildren } from 'react'

interface Props {
    disable: boolean
}

const Disabler = ({disable, children}: PropsWithChildren<Props>) => {
    return <>
        <div style={{
            position: 'relative'
        }}>
            <div
                style={{
                    background: 'rgba(0, 0, 0, 0.1)',
                    display: disable ? 'block' : 'none',
                    position: 'absolute',
                    zIndex: 1,
                    height: '100%',
                    width: '100%'
                }}
            />
            {children}
        </div>


    </>
}

export default Disabler
