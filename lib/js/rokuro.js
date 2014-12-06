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
    var paused = false;
    var pauseOnGesture = false;
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

//        document.getElementById("main").style.visibility = "visible";
//        document.getElementById("connection").innerHTML = "WebSocket connection open!";
    };

    // On message received
    ws.onmessage = function(event) {
      if (!paused) {
        var obj = JSON.parse(event.data);
        console.log(obj.hands);
        /*
        if(obj.hands != null) {
          if(obj.hands[0] != null && obj.hands[1] != null){
            var rightHand;
            var leftHand;
            if(obj.hands[0].palmPosition[0] < obj.hands[1].palmPosition[0]) {
              rightHand = obj.hands[1];
              leftHand  = obj.hands[0];
            }
            if(rightHand.palmPosition[2] < -50 && leftHand.palmPosition[2] > 50) {
              console.log("ROKURO");
            }
          }

//            var str = JSON.stringify(obj, undefined, 2);
        }*/
//            document.getElementById("output").innerHTML = '<pre>' + str + '</pre>';
        if (pauseOnGesture && obj.gestures.length > 0) {
          togglePause();
        }
      }
    };

    // On socket close
    ws.onclose = function(event) {
      ws = null;
//      window.removeListener("focus", focusListener);
//      window.removeListener("blur", blurListener);
//      document.getElementById("main").style.visibility = "hidden";
//      document.getElementById("connection").innerHTML = "WebSocket connection closed";
    }

    // On socket error
    ws.onerror = function(event) {
      alert("Received error");
    };
  }

  Rokuro.togglePause = function() {
    paused = !paused;

  //  if (paused) {
  //    document.getElementById("pause").innerText = "Resume";
  //  } else {
  //    document.getElementById("pause").innerText = "Pause";
  //  }
  }

  Rokuro.pauseForGestures = function() {
  //  if (document.getElementById("pauseOnGesture").checked) {
  //    pauseOnGesture = true;
  //  } else {
  //    pauseOnGesture = false;
  //  }
  }
})();
