# Syringe
A stand alone (no jQuery) html client-side code injection utility

Syringe supports:

* Includes within includes
* Embeded scripts
* Document.write()
* Remote script calls
* Include by attribute (Divs and Spans only)
* include by program call (any element with an ID)
* Full, partial and relative asset paths

## Code examples

A simple attribute can be added to a div and it's contents will be replaced with the include content when document.load occurs (or on demand at any time by calling syringe.inject() )

```
<div synject=“http://www.someplace.com/demo/header.html”></div>
<div synject=“//www.someplace.com/demo/header.html”></div>
<span synject=“/demo/header.html”></span>
<span synject=“../header.html”></span>
```

Syringe can be called in line at any time by passing the ID of the element to inject the html into and the path to the file:

```
<script>
synject('mydiv', 'http://www.someplace.com/header.html');
</script>
<div id="mydiv"></div>
```

NOTE:

Include files are included in their entirety, there is no need for HTML, HEAD or BODY tags.


## Setup

In order to develop this and run the demo's I use :

```
https://github.com/nodeapps/http-server
```

Installed using NPM as follows:

```
npm install http-server -g
```

## Development

Run the http-server

```
http-server ./ -p 9191
```

## Deployment

Using https://github.com/mishoo/UglifyJS2

```
npm install uglify-js -g
```

```
uglifyjs ./syringe.js -o ./syringe.min.js -c -m
```
