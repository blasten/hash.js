Hash.js
=========

Handles URIs changes dynamically.

**Features**

* Uses pushState
* Uses the classic URI hash


#### Example

<pre>
Hash.pushState(true);

Hash.on('/page/([0-9]+)$', function(path, parts) {
	alert('You are on page '+ parts[1]);
});

Hash.go('/page/1');
</pre>