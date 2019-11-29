/*!
Hype BlendModes 1.3
copyright (c) 2019 Max Ziebell, (https://maxziebell.de). MIT-license
*/

/*
* Version-History
* 1.0	Initial release under MIT as a symbol extension (partial preview)
* 1.2	Converted into full IDE plugin
* 1.3	Fixed IDE support, added dataset variation
*/

if("HypeBlendModes" in window === false) window['HypeBlendModes'] = (function () {
	
	/* blendmodes */
	var kBlendModes = ['color','color-burn','color-dodge','darken','difference','exclusion','hard-light','hue','lighten','luminosity','multiply','overlay','saturation','screen','soft-light'];

	/* extend Hype */
	function extendHype(hypeDocument, element, event) {
		hypeDocument.getCurrentSceneElement = function(){
			return document.querySelector('#'+hypeDocument.documentId()+' > .HYPE_scene[style*="block"]');
		}

		hypeDocument.applyBlendModeByElement = function(elm) {
			/* add blendmodes */
			var bm = String (elm.dataset.blendmode).trim().toLowerCase();
			if (kBlendModes.indexOf(bm) > -1 ) {
				elm.parentNode.style.setProperty('mix-blend-mode', bm, 'important');
			} else {
				kBlendModes.forEach(function(bm) {
					if (elm.classList.contains("blendmode-"+bm)) {
				    	elm.parentNode.style.setProperty('mix-blend-mode', bm, 'important');
					}
				});
			}
		}

		hypeDocument.removeUndeclaredBlendModes = function(){
			var nl= hypeDocument.getCurrentSceneElement().querySelectorAll("[style*='mix-blend-mode']");
			[].forEach.call (nl, function (n) {
			    if (String (n.firstChild.className).indexOf('blendmode-') == -1 && !n.firstChild.dataset.blendmode) {
			    	n.style.removeProperty('mix-blend-mode');
			    }
			});
		}

		hypeDocument.applyBlendModes = function(elm) {
			var nl=hypeDocument.getCurrentSceneElement().querySelectorAll("[class*='blendmode-'], [data-blendmode]");
			[].forEach.call (nl, function (n) {
			    hypeDocument.applyBlendModeByElement(n);	
			});
			/* remove undeclared blend modes */
			hypeDocument.removeUndeclaredBlendModes();
		}

	}

	function sceneLoad(hypeDocument, element, event) {
		hypeDocument.applyBlendModes();
	}

	/* Setup Hype listeners */
	if("HYPE_eventListeners" in window === false) { window.HYPE_eventListeners = Array();}
	window.HYPE_eventListeners.push({"type":"HypeDocumentLoad", "callback": extendHype});
	window.HYPE_eventListeners.push({"type":"HypeSceneLoad", "callback": sceneLoad});

	/* check if IDE for preview (don't remove) */
	function isHypeIDE() {
		return window.location.href.indexOf("/Hype/Scratch/HypeScratch.") != -1 && !document.querySelector('.HYPE_document');
	}

	/* IDE preview -- START (can be removed!) */
	document.addEventListener("DOMContentLoaded", function(event) {
		if (isHypeIDE()) {
			/* make a fake hypeDocument (IDE) version */
			var hypeDocument = {}
			extendHype(hypeDocument);
			hypeDocument.getCurrentSceneElement = function(){
				return document.getElementById('HypeMainContentDiv');
			}
			var installed = false;
			/* handle IDE changes */
			var firstBuildObserver = new MutationObserver(function(mutations) {
				/* stop observing first build, one ping is enough */
				firstBuildObserver.disconnect();
				/* second security to limit only one ping, avoiding async calls */
				if (!installed) {
					installed =true;
					/* unflicker & debounce by requesting to be in next animation frame of IDE */
					window.requestAnimationFrame(function(){
						/* observer blend mode changes by class or dataset attribute */
						var blendModeObserver = new MutationObserver(function(mutations) {
							mutations.forEach(function(mutation) {
								if (mutation.type == 'attributes') {
									if (mutation.attributeName == 'class' || mutation.attributeName == 'data-blendmode') {
										hypeDocument.applyBlendModeByElement(mutation.target);
										hypeDocument.removeUndeclaredBlendModes();
									}
								}
							});
						});
						blendModeObserver.observe(hypeDocument.getCurrentSceneElement(), { 
							attributes: true,
							attributeOldValue: true,
							attributeFilter: [ "class", "data-blendmode"],
							subtree: true
						});
						hypeDocument.applyBlendModes();
					});
				}
			});
			/* wait for Hype IDE to add build view */
			firstBuildObserver.observe(hypeDocument.getCurrentSceneElement(), { 
				childList : true
			});
		}
	});
	/* IDE preview -- END */

	/* Reveal Public interface to window['HypeBlendModes'] */
	return {
		version: '1.3'
	};
})();	
