      // Initialize Firebase
      // TODO: Replace with your project's customized code snippet
      var config = {
        apiKey: "AIzaSyAw1I3J8eicTSJUZTnHPlyrqZ3G1AmaWlI",
        authDomain: "mcnotification-dda3a.firebaseapp.com",
        databaseURL: "https://mcnotification-dda3a.firebaseio.com",
        messagingSenderId: "472090871905",
      };
      var defaultApp;
      var user;


window.addEventListener('load', function () {
    
      defaultApp = firebase.initializeApp(config);
    
      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        user = result.user;
            
        requestPermession();
        // ...
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });
   
});

function requestPermession(){
     Notification.requestPermission().then(function (result) {
        
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
}

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

    var database = firebase.database();

    var emailId = user.email.split("@")[0];
    console.log(emailId);
    
    firebase.database().ref('users/'+ emailId).set({
            Endpoint: endpoint,
            PublicKey: btoa(String.fromCharCode.apply(null, new Uint8Array(key))),
            AuthSecret: btoa(String.fromCharCode.apply(null, new Uint8Array(secret)))
        });
    
}
