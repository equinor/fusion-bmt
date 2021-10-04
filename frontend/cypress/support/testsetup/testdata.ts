import * as faker from 'faker'
import { Action, IAction } from './mocks'
import { Role, Priority } from '../../../src/api/models'
import { EvaluationSeed } from './evaluation_seed'

export function createAction(
    this: EvaluationSeed,
    {
        assignedTo = faker.random.arrayElement(this!.participants),
        createdBy = faker.random.arrayElement(this!.participants.filter(x => x.role !== Role.ReadOnly)),
        // no access to questions as creation is run before plant. Reconsider?
        questionOrder = faker.datatype.number({ min: 1, max: 3 }),
        dueDate = faker.date.future(),
        title = faker.lorem.sentence(),
        priority = faker.random.arrayElement(Object.values(Priority)),
        description = faker.lorem.words(),
        completed = faker.datatype.boolean(),
        onHold = faker.datatype.boolean(),
    }: Partial<IAction>
) {
    return new Action({ assignedTo, createdBy, questionOrder, dueDate, title, priority, description, completed, onHold })
}
