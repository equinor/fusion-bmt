import { Banner, Button, Icon } from '@equinor/eds-core-react'
import { error_filled } from '@equinor/eds-icons'
import React from 'react'

interface Props {
    message: string
    onClose: () => void
}

const ErrorBanner = ({ message, onClose }: Props) => {
    return (
        <Banner style={{ backgroundColor: 'pink' }}>
            <Banner.Icon variant="warning">
                <Icon data={error_filled}></Icon>
            </Banner.Icon>
            <Banner.Message>{message}</Banner.Message>
            <Banner.Actions>
                <Button color="secondary" onClick={onClose}>
                    Close
                </Button>
            </Banner.Actions>
        </Banner>
    )
}

export default ErrorBanner
