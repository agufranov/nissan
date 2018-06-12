const toHex = (n) => n.toString(16).slice(-2)
const fromHex = (str) => str.split(' ').map(s => parseInt(s, 16))

$(() => {
    const socket = io()
    window.socket = socket
    
    const send = (str) => {
        socket.send(fromHex(str))
        $('#messages').append($('<div>').addClass('out').text('> ' + str.toUpperCase()))
    }

    $(document).keydown(e => {
        if (e.ctrlKey && e.key === 'c') send('30')
    })

    $('#form').submit(e => {
        e.preventDefault()
        send($('#input').val())
    })

    socket.on('message', (msg) => {
        console.log('message', msg)
        const str = msg.map(toHex).join(' ').toUpperCase()
        $('#messages').append($('<div>').addClass('in').text('< ' + str))
    })
})