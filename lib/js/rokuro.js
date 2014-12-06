var Rokuro = {};

(function() {
  // Support both the WebSocket and MozWebSocket objects
  if ((typeof(WebSocket) == 'undefined') &&
      (typeof(MozWebSocket) != 'undefined')) {
      WebSocket = MozWebSocket;
  }

  // Create the socket with event handlers
  Rokuro.init = function() {
    var ws;
    var focusListener;
    var blurListener;

    // Create and open the socket
    ws = new WebSocket("ws://localhost:6437/v6.json");

    // On successful connection
    ws.onopen = function(event) {
        var enableMessage = JSON.stringify({enableGestures: true});
        ws.send(enableMessage); // Enable gestures
        ws.send(JSON.stringify({focused: true})); // claim focus

        focusListener = window.addEventListener('focus', function(e) {
          ws.send(JSON.stringify({focused: true})); // claim focus
        });

        blurListener = window.addEventListener('blur', function(e) {
          ws.send(JSON.stringify({focused: false})); // relinquish focus
        });
    };

    // On message received
    ws.onmessage = function(event) {
      var obj = JSON.parse(event.data);
      console.log(obj.hands);
    };

    // On socket close
    ws.onclose = function(event) {
      ws = null;
      window.removeListener("focus", focusListener);
      window.removeListener("blur", blurListener);
    }

    // On socket error
    ws.onerror = function(event) {
      alert("Received error");
    };
  }
})();
