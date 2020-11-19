const crypt = require('crypto')

declare var window: Window & typeof globalThis

Object.defineProperty(window.self, 'crypto', {
    value: {
        getRandomValues: (arr: any[]) => crypt.randomBytes(arr.length)
    }
})
