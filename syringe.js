/*! Syringe v0.1.0-alpha: https://github.com/bevans157/Syringe */
/*
 * Copyright 2015, Ben Evans
 * Released under the MIT License.
 */

(function(global) {
    // global is window when running in the usual browser environment.

    "use strict";

    if (global.synject) { return; } // Syringe already loaded


    //===============
    // Top-level vars
    //===============
    var cache = {};
    var que = {};


    //==========
    // Utilities
    //==========

    // Get URL path information
    function getFullURL(link) {
        var parser = document.createElement('a');
        parser.href = link;
        return parser.href;
    };

    // Get elements
    function getElements(root, type) {
        if( !root.querySelectorAll ) {
            return root.getElementsByTagName(type);
        }else{
            return root.querySelectorAll(type);
        }
    };

    // Get elements by tag and attributes
    function getSynjectors(root) {
        var tags = [];
        var elements = [];
        var synjectors = [];
        root = (root != null)?root:document;
        tags = ['div', 'span'];
        for (var t = 0; t < tags.length; t++) {
            elements = getElements(root, tags[t]);
            for (var i = 0; i < elements.length; i++) {
                if (elements[i].hasAttribute("synject") && !elements[i].hasAttribute("synjected")) {
                    synjectors.push(elements[i])
                }
            }
        }
        return synjectors;
    };

    // Generate xmlHttp
    function getXmlhttp() {
        if (typeof XMLHttpRequest !== 'undefined') {
            return new XMLHttpRequest();
        }
        var xobjects = [
            "MSXML2.XmlHttp.5.0",
            "MSXML2.XmlHttp.4.0",
            "MSXML2.XmlHttp.3.0",
            "Microsoft.XmlHttp"
        ];
        var xmlhttp;
        for(var i = 0; i < xobjects.length; i++) {
            try {
                xmlhttp = new ActiveXObject(xobjects[i]);
                break;
            } catch (e) {
            }
        }
        return xmlhttp;
    };

    // Get include content via ajax
    function callXmlhttp(url, callback) {
        var x = getXmlhttp();
        x.open("get", url);
        x.onreadystatechange = function() {
            if (x.readyState == 4) {
                callback(x.responseText)
            }
        };
        x.send()
    };

    // Build call to fetch and handle content
    function fetchContent(url) {
        callXmlhttp(url, function() {
            return function(content) {
                var targets = que[url]["t"];
                delete que[url];
                for (var i = 0; i < targets.length; i++) {
                    targets[i].innerHTML = content;
                    executeJS(targets[i]);
                    targets[i].setAttribute("synjected", "true");
                    loadSynjectors(targets[i]);
                }
                cache[url] = content;
            }
        }());
    };

    // Append a acript to the head
    function appendScript(target, path, type) {
        // Function does not support document.write inside included scripts
        // In order to support scripts must be loaded via ajax and eval.
        var js = document.createElement("script");
        js.type = (type)? type:"text/javascript";
        js.src = path;
        target.appendChild(js);
    };

    // Simulate the normal processing of Javascript
    function executeJS(target){
        var match = /<script(?:(([^>]*))\/>|((?:(?!\/>)[^>])*)>((?:(?!<\/script>)[\s\S])*)<\/script>)/im; //Regex <script> tags.
        var doc = document.write; // Store document.write for overloading.
        var dwoutput = '';
        document.write = function (content) { // Monkey patch
            dwoutput += content;
        };
        var stag;
        var newscripts = [];
        function executeJStext(content){
            while (stag = content.match(match)) {
                var js;
                var src;
                var type;
                var tag = stag[2]+stag[3];
                if (tag) {
                    type = tag.match(/type=[\"\']([^\"\']*)[\"\']/);
                    if (type) {
                        type = type[1];
                    }
                    src = tag.match(/src=[\"\']([^\"\']*)[\"\']/);
                }
                if (src) {
                    newscripts.push({"src":src[1], "type":type});
                    content = content.replace(stag[0], '')
                }
                else {
                    js = stag[4];
                    window.eval('try{' + js + '}catch(e){}');
                    content = content.replace(stag[0], executeJStext(dwoutput))
                    dwoutput = '';
                }
            }
            return content;
        }
        target.innerHTML = executeJStext(target.innerHTML);
        for (var i = 0; i < newscripts.length; i++) {
            appendScript(target, newscripts[i]["src"], newscripts[i]["type"]);
        }
        target.innerHTML = target.innerHTML+dwoutput;
        document.write = doc; // Restore document.write
    };


    //=====
    // Main
    //=====

    // Search root for divs with sybject tagging
    function loadSynjectors(root) {
        var synjectors = getSynjectors(root)
        if (synjectors != null) {
            for (var i = 0; i < synjectors.length; i++) {
                var url = getFullURL(synjectors[i].getAttribute("synject"));
                if (que[url]) {
                    que[url]["t"].push(synjectors[i]);
                }
                else {
                    if (synjectors[i].getAttribute("cache") == "false" || !cache[url] ) {
                        // get file
                        que[url] = {t:[synjectors[i]]};
                        fetchContent(url);
                    }
                    else {
                        // use cache
                        synjectors[i].innerHTML = cache[url];
                        synjectors[i].setAttribute("synjected", "true");
                        executeJS(synjectors[i]);
                        loadSynjectors(synjectors[i]);
                    }
                }
            }
        }
    };


    //=========
    // Bindings
    //=========

    // Force an include to a target DOM element
    global.synject = function (target, path) {
        if (!target) {return;}
        if (typeof target == 'string' || target instanceof String) {
            target = document.getElementById(target);
        }
        var url = getFullURL(path);
        if (que[url]) {
            que[url]["t"].push(target);
        }
        else {
            que[url] = {t:[target]};
            fetchContent(url);
        }
    };

    // Add an event document
    document.addEventListener('DOMContentLoaded', function () {
        loadSynjectors();
    });


})(this);