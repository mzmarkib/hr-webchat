// alert('bar')

// Wait for TynApp to be ready
TynApp.Ready(function () {
    TynApp.Chat.send('App is ready');
    alert('foo')
});