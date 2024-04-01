export default  async ({ socket  }) => {
    socket.handshake.session.user = null
    socket.handshake.session.save()
}
