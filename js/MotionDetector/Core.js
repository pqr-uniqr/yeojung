;(function(App) {

	"use strict";
	
	/*
	 * The core motion detector. Does all the work.
	 *
	 * @return <Object> The initalized object.
	 */
	App.Core = function() {
        var moDecArmed = false;

		var width = 64;
		var height = 48;

		var webCam = null;
		var imageCompare = null;

		var currentImage = null;
		var oldImage = null;

		var topLeft = [Infinity,Infinity];
		var bottomRight = [0,0];

		var raf = (function(){
			return  window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
			function( callback ){ // not called in chrome
				window.setTimeout(callback, 1000/60);
			};
		})();

		/*
		 * Initializes the object.
		 * @return void.
		 */
		function initialize() {
			imageCompare = new App.ImageCompare(/* sensitvity */ 40);
			webCam = new App.WebCamCapture(document.getElementById('webCamA'));

			main();
		}

		/*
		 * Compares to images and updates the position
		 * of the motion div.
		 *
		 * @return void.
		 */
		function render() {
			oldImage = currentImage;
			currentImage = webCam.captureImage(false);

			if (!oldImage || !currentImage) {
				return;
			}

            // TODO should also return whether motion was detected. 
			var vals = imageCompare.compare(currentImage, oldImage, width, height);
            drawMovement(vals);
		}

        function drawMovement(vals) {
			topLeft[0] = vals.topLeft[0] * 10;
			topLeft[1] = vals.topLeft[1] * 10;

			bottomRight[0] = vals.bottomRight[0] * 10;
			bottomRight[1] = vals.bottomRight[1] * 10;

			document.getElementById('movementA').style.top = topLeft[1] + 'px';
			document.getElementById('movementA').style.left = topLeft[0] + 'px';
			document.getElementById('movementA').style.width = (bottomRight[0] - topLeft[0]) + 'px';
			document.getElementById('movementA').style.height = (bottomRight[1] - topLeft[1]) + 'px';

			topLeft = [Infinity,Infinity];
			bottomRight = [0,0]
        }

		/*
		 * The main rendering loop.
		 *
		 * @return void.
		 *
		 */
		function main() {
			try {
                if (moDecArmed) {
                    render();
                }
			} catch(e) {
				console.log(e);
				return;
			}

            // asks browser to call this function on  
            // new animation frame. 
            raf(main.bind(this));
		}

        function armMoDec() {
            moDecArmed = true;
        }

        function disarmMoDec() {
            moDecArmed = false;
        }

		initialize();
		return {
			armMoDec: armMoDec,
			disarmMoDec: disarmMoDec
		}
	};
})(MotionDetector);
