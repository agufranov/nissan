class Command extends EventEmitter {
    constructor(...bytes) {
        super()
        this.bytes = bytes
    }
}

class Reader extends EventEmitter {
    constructor() {
        super()
        this.commands = []
        this.data = []
    }

    push(...chunk) {
        this.data = [...this.data, ...chunk]
        let frame
        do {
            const lastFrame = frame
            frame = this.pick()
            if (frame) {
                this.emit('frame', frame)
                if (this.command) this.command.emit('frame', frame)
            }
        } while (frame)
        return this
    }

    pick() {
        const { data } = this
        if (this.data.length === 0) return false

        if (data[0] === 0xff) {
            if (data.length === 1 || data.length < data[1] + 2) return false
            if (!this.command) throw new Error('Got value frame without preceding cr frame')
            return { data: data.splice(0, data[1] + 2), type: 'value' }
        }

        if (data[0] === 0xfe) {
            if (!this.command) throw new Error('Got value frame without preceding cr frame')
            if (data.length > 1) throw new Error('FE frame contains more than 1 byte')
            return { data: data.splice(0, 1), type: 'value', error: true }
        }

        if (this.commands.length === 0) throw new Error('Got cr, but command stack is empty')
        this.command = this.commands[0]
        let crLength;
        if (_.isEqual(this.command.bytes, [0xff, 0xff, 0xef])) {
            crLength = data[0] === 0x10 ? 1 : 3;
        } else {
            crLength = Math.max(this.command.bytes.length - 1, 1)
        }
        console.log('crLength', crLength)
        if (data.length < crLength) return false

        this.commands.shift()
        return { data: data.splice(0, crLength), type: 'cr' }
    }
}