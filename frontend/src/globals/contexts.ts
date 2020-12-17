import { createContext, useContext } from 'react'

import { Participant } from '../api/models'

export const CurrentParticipantContext = createContext<Participant | undefined>(undefined)

export const useParticipant = (): Participant => {
    const participant = useContext(CurrentParticipantContext)
    if(participant === undefined){
        throw new Error(`No participant provided for context`)
    }
    return participant
}
