import { Barrier } from '../api/models'

export const getNextBarrier = (currentBarrier: Barrier): Barrier | undefined => {
    switch (currentBarrier)
    {
    case Barrier.Gm: return Barrier.Ps1
    case Barrier.Ps1: return Barrier.Ps2
    case Barrier.Ps2: return Barrier.Ps3
    case Barrier.Ps3: return Barrier.Ps4
    case Barrier.Ps4: return Barrier.Ps6
    case Barrier.Ps6: return Barrier.Ps7
    case Barrier.Ps7: return Barrier.Ps12
    case Barrier.Ps12: return Barrier.Ps15
    case Barrier.Ps15: return Barrier.Ps22
    case Barrier.Ps22: return undefined
    default: return undefined
    }
}
