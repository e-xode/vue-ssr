export default  async ({ data, db, socket  }) => {
    socket.handshake.session.user = null
    socket.handshake.session.auth = null
    socket.handshake.session.save()
}
