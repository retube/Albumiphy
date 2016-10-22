/*
Albumiphy static image gallery
Author: R Hill
Web: http://retu.be/albumiphy.html
*/

var _APHY = { };

_APHY.status = { 
		thumbLoc: { year: 0, month: 0 },
		imgLoc: { year: 0, month: 0, image: 0 },
		display: false,
		scrollLocation: 0,
		implementHash: true
};

// Increments image
_APHY.incrementImgLoc = function() {

	var is = _APHY.status.imgLoc;

	if (is.image < _APHY.images.years[is.year].months[is.month].images.length - 1) {
		is.image = is.image + 1;
	} else {
		is.image = 0;
		if (is.month < _APHY.images.years[is.year].months.length - 1) {
			is.month = is.month + 1;
		} else {
			is.month = 0;
			if (is.year < _APHY.images.years.length - 1) {
				is.year = is.year + 1;
			} else {
				is.year = 0;
			};
		};
	};
};

// Decrements image
_APHY.decrementImgLoc = function() {

	var is = _APHY.status.imgLoc;

	if (is.image > 0) {
		is.image = is.image - 1;
	} else {
		if (is.month > 0) {
			is.month = is.month - 1;			
		} else {
			if (is.year > 0) {
				is.year = is.year - 1;
			} else {
				is.year = _APHY.images.years.length - 1;
			}
			is.month = _APHY.images.years[is.year].months.length - 1;
		}
		is.image = _APHY.images.years[is.year].months[is.month].images.length - 1;
	}	
};

// Initialise
_APHY.init = function(obj) {
	_APHY.images = obj;
	document.getElementById("content").style.position = "fixed";
	_APHY.processUrl();
	_APHY.initVue();
	
	if (_APHY.status.display) {
		_APHY.checkControl();
	} else {
		document.getElementById("content").style.position = "static";
		_APHY.globalVue.overlay.imageSrc = 'assets/loading.png';
		_APHY.globalVue.overlay.imageDetails = '';
	};

	_APHY.getJSON("json/values.json", function(obj) {
		_APHY.globalVue.page = obj;
		document.getElementsByTagName("title")[0].innerHTML = obj.title;
	});
};

_APHY.getImages = function() {
	return _APHY.images.years[_APHY.status.thumbLoc.year].months[_APHY.status.thumbLoc.month].images;
};

_APHY.getTitle = function() {
	var year = _APHY.images['years'][_APHY.status.thumbLoc.year];
	var month = year['months'][_APHY.status.thumbLoc.month];
	return month['month'] + " " + year['year'];
};

_APHY.getOverlay = function() {
	var is = _APHY.status.imgLoc;
	return _APHY.images.years[is.year].months[is.month].images[is.image];
};

_APHY.getOverlayPath = function() {
	var is = _APHY.status.imgLoc;
	return _APHY.images.years[is.year].months[is.month].path	
};

_APHY.getImagePath = function() {
	var year = _APHY.status.thumbLoc.year;
	var month = _APHY.status.thumbLoc.month;
	return "/" + _APHY.images.years[year].year + "/" +
				_APHY.images.years[year].months[month].month;
};

// Set up the Vue
_APHY.initVue = function() {

	var data = { };
	
	data.thumbnails = { 
		images: _APHY.getImages(), 
		title: _APHY.getTitle(),
		path: "images" + _APHY.getImagePath() + "/"
	};
	
	data.overlay = { 
		imageSrc: _APHY.getOverlayPath() + _APHY.getOverlay().w,
    	imageDetails: _APHY.getOverlay().ts,
    	display: _APHY.status.display
    };

    data.menu = { images: _APHY.images };
    
    data.page = { title: "My Photo Album" };

	_APHY.globalVue = new Vue({
		el: 'html',
		data: data,
		methods: {
			load: function(index) {
				_APHY.status.imgLoc.year = _APHY.status.thumbLoc.year;
				_APHY.status.imgLoc.month = _APHY.status.thumbLoc.month;
				_APHY.status.imgLoc.image = index;
				this.overlay.imageSrc = _APHY.getOverlayPath() + _APHY.getOverlay().w;
				this.overlay.imageDetails = _APHY.getOverlay().ts;	
				_APHY.silentHashUpdate('/img/' + this.thumbnails.images[index].w);
				_APHY.status.scrollLocation = _APHY.getScrollLocation();
				document.getElementById("content").style.position = "fixed";
				_APHY.status.display = true;
				this.overlay.display = true;
			},
			close: function() {
				_APHY.status.display = false;
				this.overlay.display = false;
				this.overlay.imageSrc = 'assets/loading.png';
				this.overlay.imageDetails = '';
				_APHY.silentHashUpdate(_APHY.getImagePath());
				document.getElementById("content").style.position = "static";
				_APHY.setScrollLocation(_APHY.status.scrollLocation);
			},
			prevImageSrc: function() {
				_APHY.decrementImgLoc();
				this.overlay.imageSrc = _APHY.getOverlayPath() + _APHY.getOverlay().w;
				this.overlay.imageDetails = _APHY.getOverlay().ts;
				_APHY.silentHashUpdate('/img/' + _APHY.getOverlay().w);				
			},
			nextImageSrc: function() {
				_APHY.incrementImgLoc();
				this.overlay.imageSrc = _APHY.getOverlayPath() + _APHY.getOverlay().w;
				this.overlay.imageDetails = _APHY.getOverlay().ts;
				_APHY.silentHashUpdate('/img/' + _APHY.getOverlay().w);
			},
			check: function() {
				_APHY.checkControl();
			},
			link: function(year_index, month_index) {
				year = this.menu.images.years[year_index];
				_APHY.status.thumbLoc.year = year_index;
				_APHY.status.thumbLoc.month = month_index;
				this.thumbnails.path = "images" + _APHY.getImagePath() + "/"
				this.thumbnails.images = _APHY.getImages();
				this.thumbnails.title = _APHY.getTitle();
				_APHY.silentHashUpdate("/" + year.year + "/" + year.months[month_index].month);
				window.scrollTo(0, 0);
			},
			display: function(i) {
				return i == _APHY.status.thumbLoc.year;
			},
			expandIcon: function(i) {
				return i == _APHY.status.thumbLoc.year ? 'assets/minus.png' : 'assets/plus.png'; 
			},
			toggleDisplay: function(event) {

				var el = event.target;				
				var parent = el.parentNode;
				if (el.tagName.toLowerCase() == 'img') {
					parent = parent.parentNode;
					el = el.parentNode;
				}
				var ul = parent.querySelectorAll('ul')[0];
			 
				var display = window.getComputedStyle(ul).getPropertyValue('display');
				var img = el.querySelectorAll('img')[0];
				if (ul.style.display == 'block') {
					ul.style.display = 'none';
					img.src = "assets/plus.png"
				} else {
					ul.style.display = 'block';
					img.src = "assets/minus.png"
				};

			}
		}
	});
};

_APHY.imgLocation = function(imgName) {
	for (var i = 0; i < _APHY.images['years'].length; i++) {
		for (var j = 0; j < _APHY.images['years'][i]['months'].length; j++) {
			for (var k = 0; k < _APHY.images['years'][i]['months'][j]['images'].length; k++) {
				if (_APHY.images['years'][i]['months'][j]['images'][k].w == imgName) {
					return { year: i, month: j, image: k };
				}
			}
		}
	}
	return null;
};

_APHY.thumbLocation = function(month, year) {
	for (var i = 0; i < _APHY.images['years'].length; i++) {
		if (year == _APHY.images['years'][i].year) {
			for (var j = 0; j < _APHY.images['years'][i]['months'].length; j++) {
				if (month == _APHY.images['years'][i]['months'][j].month) {
					return { year: i, month:j };
				}
			}
		}
	}
	return null;
};

_APHY.processUrl = function() {

	var frag = _APHY.getFragment();
	var success = false;

	if (frag != null && frag.length == 3) {

		if (frag[1] == 'img') {
			
			var loc = _APHY.imgLocation(frag[2]);

			if (loc != null) {
				_APHY.status.imgLoc = loc;
				_APHY.status.thumbLoc.year = loc.year;
				_APHY.status.thumbLoc.month = loc.month;
				_APHY.status.display = true;
				success = true;
			};
			
		} else {
			
			var loc = _APHY.thumbLocation(frag[2], frag[1]);

			if (loc != null) {
				_APHY.status.thumbLoc = loc;
				_APHY.status.imgLoc.year = loc.year;
				_APHY.status.imgLoc.month = loc.month;
				_APHY.status.display = false;
				success = true;
			};
		};

		if (!success) {
			console.log("WARN: invalid url fragment")
		};
	}; 
};

_APHY.load = function() {
	_APHY.getJSON("json/images.json", _APHY.init);
};

_APHY.getJSON = function(url, callback) {
	var request = new XMLHttpRequest();
	request.onload = function() {
  		callback(JSON.parse(request.responseText));
  	};
	request.onerror = function() { };
	request.open('GET', url, true);
	request.send();
};

// Extract fragment from URL
_APHY.getFragment = function() {
	var frag = window.location.hash;
	if (frag != null && frag.length > 0) {
		var re = new RegExp("#/(.*)/(.*)");
		return re.exec(frag);
	}
	return null;
};

// Positioning of overlay control
_APHY.checkControl = function() {
	if (_APHY.globalVue.overlay.display) {
		var control = document.getElementById("controls");
		var ref = document.getElementById("ref");
		if (_APHY.isBelowFold(ref, 60)) {
			control.style.position = "relative";
		} else {
			control.style.position = "absolute";
		};
	};
};

// Check if element is below fold
_APHY.isBelowFold = function(element, bottomOffset) {
	var rect = element.getBoundingClientRect();
	return rect.bottom + bottomOffset <= (window.innerHeight || document.documentElement.clientHeight);
}

_APHY.getScrollLocation = function() {
	return document.documentElement.scrollTop || document.body.scrollTop;
};

_APHY.setScrollLocation = function(location) {
	document.documentElement.scrollTop = document.body.scrollTop = location;
};

// Stops popstate listener
_APHY.silentHashUpdate = function(hash) {
	_APHY.status.implementHash = false;
	window.location.hash = hash;
	_APHY.status.implementHash = true;	
};

window.addEventListener('resize', function(){
	_APHY.checkControl();
}, false);

window.addEventListener('load', function(){
	_APHY.load();
}, false);

window.addEventListener('popstate', function (e) {

    if (_APHY.status.implementHash) {

    	_APHY.processUrl();
    	var vue = _APHY.globalVue;

    	if (_APHY.status.display) {
    		document.getElementById("content").style.position = "fixed";
    		vue.overlay.imageSrc = _APHY.getOverlayPath() + _APHY.getOverlay().w;
    		vue.overlay.imageDetails = _APHY.getOverlay().ts;
    		_APHY.checkControl();
    	} else {
    		document.getElementById("content").style.position = "static";
    		vue.thumbnails.path = "images" + _APHY.getImagePath() + "/"
    		vue.thumbnails.images = _APHY.getImages();
			vue.thumbnails.title = _APHY.getTitle();
    	};

   		vue.overlay.display = _APHY.status.display;

   		if (!_APHY.status.display) {
   			vue.overlay.imageDetails = ''
   			vue.overlay.imageSrc = 'assets/loading.png'
   		};
    };
});

