const toHex = n => ('0' + n.toString(16)).slice(-2)
const fromHex = str => str.split(' ').map(s => parseInt(s, 16))

$(() => {
    const socket = io()
    window.socket = socket
    
    const send = (str) => {
        const data = fromHex(str)
        socket.send(data)
        console.log(data)
        $('#messages').append($('<div>').addClass('out').text('> ' + str.toUpperCase()))
        const comm = new Command(...data)
        reader.commands.push(comm)
        return comm;
    }

    const send1 = (str) => {
        const comm = send(str)
        let processed = false;
        const frameHandler = frame => {
            if (processed) { comm.off(frameHandler); return }
            if (frame.type === 'value') {
                console.log("VALUE")
                processed = true
                send('30')
                comm.off(frameHandler)
            }
        }
        comm.on('frame', frameHandler)
        return comm;
    }

    const sendP = (str) => {
        const comm = send1(str)
        let processed = false
        return new Promise((resolve, reject) => {
            if (processed) { comm.off('frame'); return }
            comm.on('frame', (frame) => {
                if (frame.type === 'value') {
                    processed = true
                    resolve(frame)
                }
            })
        })
    }

    $(document).keydown(e => {
        if (e.ctrlKey && e.key === 'c') send('30')
    })

    $('#form').submit(e => {
        e.preventDefault()
        sendP($('#input').val()).then(data => console.warn('SENDP', data))
    })

    const reader = new Reader()
    window.reader = reader
    reader.on('frame', (frame) => console.log('frame', frame))

    socket.on('message', (msg) => {
        const data = Array.from(new Uint8Array(msg))
        console.log(data)
        const str = data.map(toHex).join(' ').toUpperCase()
        $('#messages').append($('<div>').addClass('in').text('< ' + str))
        reader.push(...data)
    })

    $('#test').click(() => {
        const rs = []
        window.rs = rs
        console.log('click')
        const commands = _.range(0, 256).map(toHex).map(s => `5a ${s} f0`)
        console.log(commands)
        let i = 0;
        f = (data) => {
            console.warn(data)
            rs.push(data)
            i++
            setTimeout(() => sendP(commands[i]).then(f), 100)
        }
        sendP(commands[0]).then(f)
    })
})