/**
 * hash.js
 *
 * Copyright (C) 2012 Emmanuel Garcia
 * MIT Licensed
 *
 * *************************************** *
 *
 * Hash.pushState(true);
 *
 * Hash.on('/page/([0-9]+)$', function(path, parts) {
 * 	alert('You are on page '+ parts[1]);
 * });
 *
 * Hash.go('/page/1');
 **/

(function() {

'use strict';

var _hashes = {},
	_regexp = {},
	_history = [],
	_freq = 100,
	_num = 0,
	_pushState = false,
	_timer = null,
	_currentUrl = null,

	_freeze = function(obj) {
		if (Object.freeze) return Object.freeze(obj);
		return obj;
	},

	_getHashParts = function() {
		return window.location.href.split('#');
	},

	_startTimer = function() {
		
		if (!_timer)
			_timer = setInterval(function() {
				if (_num && _currentUrl!=window.location.href) {
					_currentUrl = window.location.href;
					Hash.check();
				}
			}, _freq);

	},

	_stopTimer = function() {

		if (_timer) {
			clearInterval(_timer);
			_timer = null;
		}

	};

window.Hash = _freeze({

		pushState: function(yes) {

			if (window.history && window.history.pushState)
				_pushState = yes;

			return this;
		},

		fragment: function() {
			
			var hash = _getHashParts();
			return (_pushState) ? window.location.pathname + ((hash[1]) ? '#' + hash[1] : '')  : hash[1] || '';

		},
		
		get: function(path, params) {
			
			var p, fragment = '', parameters = [];

			for(p in params) {
				if (!Object.prototype.hasOwnProperty(p))
					continue;
				parameters.push(encodeURIComponent(p) + '=' + encodeURIComponent(params[p]));
			}

			if (parameters.length>0)
				parameters = '?' + parameters.join('&');
		
			return (_pushState) ? path + parameters :  _getHashParts()[0] + '#' + path + parameters;

		},

		go: function(hash, params) {

			var to = this.get(hash, params);

			if (_pushState)
				window.history.pushState(null, document.title, to);
			else
				window.location.href =  to;
			
			return this;
		},

		on: function(hash, callback, title) {

			if (!_hashes[hash])
				_hashes[hash] = {title: title, listeners: []};
			
			_hashes[hash].listeners.push(callback);
			_num++;
			_startTimer();

			return this;
		}, 

		remove: function(hash, callback) {
			
			if (_hashes[hash]) {

				var i, 
					l = _hashes[hash].listeners.length;

				for (var i = 0; i<l; i++)
					if (_hashes[hash].listeners[i]==callback) {

						_hashes[hash].listeners.splice(i, 1);
						
						if (--l==0)
							delete _hashes[hash];
						
						if (--_num==0)
							_stopTimer();

						break;
					}
			}

			return this;
		},

		check: function() {

			var i, 
				hash,
				parts,
				fragment = this.fragment();


			for (hash in _hashes) {
				if (!Object.prototype.hasOwnProperty.call(_hashes, hash))
					continue;

				_hashes[hash].regexp = _hashes[hash].regexp || new RegExp(hash);

				if (parts = _hashes[hash].regexp.exec(fragment)) {
					if (_hashes[hash].title)
						document.title = _hashes[hash].title;

					for (i = 0; i<_hashes[hash].listeners.length; i++)
						_hashes[hash].listeners[i](fragment, parts);
				}

			}

			return this;
		}
});

})();
