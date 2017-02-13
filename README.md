# Syringe
A stand alone (no jQuery) html client-side code injection utility. Syringe allows you to include files client-side with all the same functions and support as if they were included on the server-side. 

The use case for this project was to give a website with no serverside processing the ability to strucutre HTML code into multiple files, for example includes of common code (headers/footers, etc) 

It was intended more as a thought experiment than a "product", however I have used it in several cases where pages/content needed to be searved as static files (e.g. from micro devices)

Syringe supports:

* Including HTML files that may have CSS or JS embedded.
* Includes within includes
* Embeded scripts
* Handling inline document.write() calls 
* Remote script calls
* Include by attribute (Divs and Spans only)
* include by program call (any element with an ID)
* Full, partial and relative asset paths
* Full caching/memoization of calls

## Support

Syringe is designed to work on legacy browsers going back as far as possble (including IE6).

The decision be stand alone and no require jQuery was taken assuming that the use case for this library was primarily implementation by non programmers in sites with little or no dynamic behaviour or frameworks. For more experienced developers and advanced sites there are other technical solutions available. 

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
