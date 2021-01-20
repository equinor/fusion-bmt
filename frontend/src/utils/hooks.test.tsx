import React, { useState } from 'react'

import { cleanup, fireEvent, render } from '@testing-library/react'
import { Button } from '@equinor/eds-core-react'

import { useEffectNotOnMount } from './hooks'

interface UseEffectNotOnMountComponentProps {
    effectFunction: () => void
    renderFunction: () => void
}

const UseEffectNotOnMountComponent = ({ effectFunction, renderFunction }: UseEffectNotOnMountComponentProps) => {
    const [effectState, setEffectState] = useState<number>(0)
    const [, setRenderState] = useState<number>(0)

    renderFunction()

    useEffectNotOnMount(effectFunction, [effectState])

    return (
        <>
            <Button
                onClick={() => {
                    setEffectState(oldEffectState => oldEffectState + 1)
                }}
            >
                Click me effect
            </Button>
            <Button
                onClick={() => {
                    setRenderState(oldRenderState => oldRenderState + 1)
                }}
            >
                Click me render
            </Button>
        </>
    )
}

afterEach(cleanup)

describe('Hooks', () => {
    it('useEffectNotOnMount not on mount', () => {
        const effectFunction = jest.fn()
        const renderFunction = jest.fn()

        render(<UseEffectNotOnMountComponent effectFunction={effectFunction} renderFunction={renderFunction} />)

        expect(renderFunction).toHaveBeenCalledTimes(1)
        expect(effectFunction).toHaveBeenCalledTimes(0)
    })
    it('useEffectNotOnMount with click', () => {
        const effectFunction = jest.fn()
        const renderFunction = jest.fn()

        const { getByText } = render(<UseEffectNotOnMountComponent effectFunction={effectFunction} renderFunction={renderFunction} />)

        const effectButton = getByText('Click me effect')

        fireEvent.click(effectButton)

        expect(renderFunction).toHaveBeenCalledTimes(2)
        expect(effectFunction).toHaveBeenCalledTimes(1)
    })
    it('useEffectNotOnMount not on any render', () => {
        const effectFunction = jest.fn()
        const renderFunction = jest.fn()

        const { getByText } = render(<UseEffectNotOnMountComponent effectFunction={effectFunction} renderFunction={renderFunction} />)

        const renderButton = getByText('Click me render')

        fireEvent.click(renderButton)

        expect(renderFunction).toHaveBeenCalledTimes(2)
        expect(effectFunction).toHaveBeenCalledTimes(0)
    })
})
