export default  async ({ data, db, socket  }) => {

    const { user = {} } = socket.handshake.session
    const { _id = null, email = null } = user
    return socket.emit('me', {
        _id,
        email,
        status: 200,
    })
}
