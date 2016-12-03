self.addEventListener('push', function (event) {
    if (event.data) {
        try {
            fireJsonNotification(event, event.data.json());
        } catch (error) {
            console.log(error);
            fireNotification(event, 'Test Title', 'Test Body');
        }
    }
});

self.addEventListener('notificationclick', function (event) {
    console.log('[Service Worker] Notification click Received.', event);

    var url = event.notification.data.url;

    console.log(url);

    event.notification.close();

    event.waitUntil(
      clients.openWindow(url)
    );
});


function fireJsonNotification(event, obj) {
    event.waitUntil(
        self.registration.showNotification(obj.title, {
            body: obj.body,
            icon: obj.icon,
            data: obj,
            actions: [
                { action: 'confirm', title: '確認' }
            ]
        })
    );
}

function fireNotification(event, title, body) {
    event.waitUntil(
        self.registration.showNotification(title, {
            body: body
        })
    );
}
