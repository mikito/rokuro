var Rokuro = {};

(function() {
  var THRESHOLD = 25;
  var rokuring = null;

  // Rokuro Event handlers
  var onStartEvent = function() {};
  var onEndEvent = function() {};

  // Support both the WebSocket and MozWebSocket objects
  if ((typeof(WebSocket) == 'undefined') &&
      (typeof(MozWebSocket) != 'undefined')) {
      WebSocket = MozWebSocket;
  }

  // Create the socket with event handlers
  Rokuro.initialize = function(callbacks) {
    var ws;
    var focusListener;
    var blurListener;

    onStartEvent = function(rokuringState) {
      console.log("Rokuring: " + rokuringState);
      rokuring = rokuringState;
      callbacks.onStart(rokuringState);
    };
    onEndEvent = function() {
      console.log("Rokuring: reset");
      callbacks.onEnd(rokuring);
      rokuring = null;
    };

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
      Rokuro.recognize(obj.hands);
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

  Rokuro.recognize = function(hands) {
    if(hands) {
      if(hands[0] && hands[1]){
        var rightHand;
        var leftHand;

        if(hands[0].palmPosition[0] < hands[1].palmPosition[0]) {
          leftHand  = hands[0];
          rightHand = hands[1];
        }else{
          leftHand  = hands[1];
          rightHand = hands[0];
        }

        if(!rokuring) {
          if(rightHand.palmPosition[2] < -THRESHOLD && leftHand.palmPosition[2] > THRESHOLD) {
            onStartEvent("forward");
          }else if(rightHand.palmPosition[2] > THRESHOLD && leftHand.palmPosition[2] < -THRESHOLD) {
            onStartEvent("backward");
          }else if(rightHand.palmNormal[1] > 0.5 && leftHand.palmNormal[1] > 0.5){
            onStartEvent("kubire");
          }else if(rightHand.palmNormal[1] < -0.5 && leftHand.palmNormal[1] < -0.5){
            onStartEvent("tsubushi");
          }
        } else if(isResettable(leftHand, rightHand)) {
          onEndEvent();
        }
      } else if(rokuring) {
        onEndEvent();
      }
    } else if(rokuring) {
      onEndEvent();
    }
  };

  var isResettable = function(leftHand, rightHand) {
      return (Math.abs(rightHand.palmPosition[2]) <= THRESHOLD || Math.abs(leftHand.palmPosition[2]) <= THRESHOLD) &&
             (Math.abs(rightHand.palmNormal[1]) <= 0.5 || Math.abs(leftHand.palmNormal[1]) <= 0.5);
  };
})();
