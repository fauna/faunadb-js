declare function before(action: () => Promise<void>): void
declare function after(action: () => Promise<void>): void
declare function describe(name: string, action: () => void): void
declare function it(description: string, action: () => void): void


