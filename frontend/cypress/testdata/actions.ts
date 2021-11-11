import { Action, Note, Participant } from '../support/testsetup/mocks'
import { Priority } from '../../src/api/models'
import { generateRandomString } from '../support/testsetup/testdata'
import * as faker from 'faker'

export class ActionTestdata {
    revisedActionData = (existingAction: Action, participant: Participant | undefined) => {
        const updatedAction = { ...existingAction }
        updatedAction.title = 'Updated' + generateRandomString(15)
        updatedAction.dueDate = faker.date.future()
        updatedAction.priority = faker.random.arrayElement(Object.values(Priority))
        updatedAction.description = faker.lorem.words()
        updatedAction.completed = !existingAction.completed
        updatedAction.onHold = !existingAction.onHold
        if (participant !== undefined) {
            updatedAction.assignedTo = participant
        }
        return updatedAction
    }

    createNewNotes = (updatedAction: Action, participant: Participant) => {
        const newNotes: Note[] = Array.from({ length: faker.datatype.number({ min: 1, max: 3 }) }, () => {
            return new Note({
                text: faker.lorem.words(),
                action: updatedAction,
                createdBy: participant,
            })
        })
        return newNotes
    }
}
