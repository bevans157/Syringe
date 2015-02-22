# Syringe
A client-side html injection utility

Currently this library does not support document.write functions within child scripts.

## Code examples

A simple attribute can be added to a div and it's contents will be replaced with the include content when document.load occurs (or on demand at any time by calling syringe.inject() )
```<div synject=“http://www.someplace.com/header.html”>
```

Syringe can be called in line at any time as follows )
```<script> synject("http://www.someplace.com/header.html"); </script>
<div synclude="/demos/header.html" cache="false" />
```

## Setup

In order to develop this and run the demo's I use :

```https://github.com/nodeapps/http-server
```

Installed using NPM as follows:

```npm install http-server -g
```

## Development

Run the http-server

```http-server ./ -p 9191
```

## Deployment


```npm install uglify-js -g
```

```uglifyjs ./syringe.js -o ./syringe.min.js --source-map ./syringe.min.js.map -c -m
```
