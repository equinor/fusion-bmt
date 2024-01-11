import React from "react"
import styled from "styled-components"
import { Typography, Icon } from "@equinor/eds-core-react"
import { warning_outlined} from "@equinor/eds-icons"

interface ErrorMessageProps {
    title: string
    message : string
}

const Wrapper = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
`

const ErrorMessage = ({ title, message }: ErrorMessageProps) => {
    return (
        <Wrapper>
            <Icon data={warning_outlined} size={48} />
            <Typography variant="h2">{title}</Typography>
            <Typography variant="body_short">{message}</Typography>
        </Wrapper>
    )
}

export default ErrorMessage

