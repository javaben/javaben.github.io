window.addEventListener('load', function () {
    Notification.requestPermission().then(function (result) {
        console.log(result);
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
        }
        else if (result === "granted") {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/ServiceWorker.js').then(function (reg) {
                    initialiseState(reg);
                    if (reg.installing) {
                        console.log('Service worker installing');
                    } else if (reg.waiting) {
                        console.log('Service worker installed');
                    } else if (reg.active) {
                        console.log('Service worker active');
                    }
                });
            } else {
                console.log('Service workers aren\'t supported in this browser.');
            }
        }
    });
});

function initialiseState(reg) {
    console.log('initialiseState');
    // Are Notifications supported in the service worker?  
    if (!(reg.showNotification)) {
        console.log('Notifications aren\'t supported on service workers.');
        useNotifications = false;
    } else {
        console.log('Notifications are supported on service workers.');
        useNotifications = true;
    }

    // Check the current Notification permission.  
    // If its denied, it's a permanent block until the  
    // user changes the permission  
    if (Notification.permission === 'denied') {
        console.log('The user has blocked notifications.');
        return;
    }

    // Check if push messaging is supported  
    if (!('PushManager' in window)) {
        console.log('Push messaging isn\'t supported.');
        return;
    }

    // We need the service worker registration to check for a subscription  
    navigator.serviceWorker.ready.then(function (reg) {
        // Do we already have a push message subscription?  
        reg.pushManager.subscribe({
            userVisibleOnly: true
        }).then(function (subscription) {
            // Enable any UI which subscribes / unsubscribes from  
            // push messages.  

            if (!subscription) {
                console.log('Not yet subscribed to Push')
                // We aren't subscribed to push, so set UI  
                // to allow the user to enable push  
                return;
            }

            // initialize status, which includes setting UI elements for subscribed status
            // and updating Subscribers list via push
            //console.log(subscription.toJSON());
            var endpoint = subscription.endpoint;
            var key = subscription.getKey('p256dh');
            var secret = subscription.getKey('auth');

            postSubscribeObj(endpoint, key, secret);
        }).catch(function (err) {
            console.log('Error during getSubscription()', err);
        });
    });

}

function postSubscribeObj(endpoint, key, secret) {

    var pathArray = window.location.pathname.split('/');

    /*
    console.log(BASE_URL);
    $.post(BASE_URL + 'WPA/SaveEndpoint', {
        endpoint: endpoint,
        secret: btoa(String.fromCharCode.apply(null, new Uint8Array(secret))),
        key: btoa(String.fromCharCode.apply(null, new Uint8Array(key)))
    });
    */
    var database = firebase.database();
    
    firebase.database().ref('users/Steve').set({
            Endpoint: endpoint,
            PublicKey: btoa(String.fromCharCode.apply(null, new Uint8Array(key))),
            AuthSecret: btoa(String.fromCharCode.apply(null, new Uint8Array(secret)))
        });
    
}
