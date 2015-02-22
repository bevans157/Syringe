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
    var xmlhttp = {};


    //===========
    // Initialize
    //===========

    if (window.XMLHttpRequest) { // IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
    }
    else { // Legacy IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }


    //==========
    // Utilities
    //==========

    // Get URL path information
    function getFullURL(link) {
        var parser = document.createElement('a');
        parser.href = link;
        return parser.href;
    }

    // Get elements by tag and attributes
    function getSynjectors(root) {
        var divs = [];
        var synjectors = [];
        root = (root != null)?root:document;
        if( !root.querySelectorAll ) {
            divs = root.getElementsByTagName('div');
        }else{
            divs = root.querySelectorAll("div");
        }
        for (var i = 0; i < divs.length; i++) {
            if (divs[i].hasAttribute("synject") && !divs[i].hasAttribute("synjected")) {
                synjectors.push(divs[i])
            }
        }
        if (synjectors.length > 0) {
            return synjectors;
        }
        else {
            return null;
        }
    }

    // Generate xmlHttp
    function getXmlhttp() {
        if (typeof XMLHttpRequest !== 'undefined') {
            return new XMLHttpRequest();
        }
        var versions = [
            "MSXML2.XmlHttp.5.0",
            "MSXML2.XmlHttp.4.0",
            "MSXML2.XmlHttp.3.0",
            "MSXML2.XmlHttp.2.0",
            "Microsoft.XmlHttp"
        ];
        var xhr;
        for(var i = 0; i < versions.length; i++) {
            try {
                xhr = new ActiveXObject(versions[i]);
                break;
            } catch (e) {
            }
        }
        return xhr;
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
        callXmlhttp(url, function(url) {
            return function(content) {
                var targets = que[url]["targets"];
                delete que[url];
                for (var i = 0; i < targets.length; i++) {
                    targets[i].innerHTML = content;
                    executeJS(targets[i]);
                    targets[i].setAttribute("synjected", "true");
                    loadSynjectors(targets[i]);
                }
                cache[url] = content;
            }
        }(url));
    }

    // Append a acript to the head
    function appendScript(path, type) {
        type = (type)? type:"text/javascript";
        var head = document.getElementsByTagName("head")[0];
        var js = document.createElement("script");
        js.type = type;
        js.src = path;
        head.appendChild(js);
    }

    // Simulate the normal processing of Javascript
    function executeJS(target){
        var scriptreg = '(?:<script(.*)?>)((\n|.)*?)(?:</script>)'; //Regex <script> tags.
        var match = new RegExp(scriptreg, 'img');
        var scripts = target.innerHTML.match(match);
        var dwoutput = '';
        var doc = document.write; // Store document.write for overloading.
        document.write = function (content) {
            dwoutput += content;
        };
        if (scripts) {
            for (var s = 0; s < scripts.length; s++) {
                var js = '';
                var match = new RegExp(scriptreg, 'im');
                var src = null;
                var type = '';
                var tag = scripts[s].match(match)[1];
                if (tag) {
                    type = tag.match(/type=[\"\']([^\"\']*)[\"\']/);
                    if (type) {
                        type = type[1];
                    }
                    src = tag.match(/src=[\"\']([^\"\']*)[\"\']/);
                }
                if (src) {
                    src = src[1];
                    appendScript(src, type);
                    target.innerHTML = target.innerHTML.replace(scripts[s], '')
                }
                else {
                    js = scripts[s].match(match)[2];
                    window.eval('try{' + js + '}catch(e){}');
                    target.innerHTML = target.innerHTML.replace(scripts[s], dwoutput)
                    dwoutput = '';
                }
            }
        }
        document.write = doc; // Restore document.write
    }


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
                    que[url]["targets"].push(synjectors[i]);
                }
                else {
                    if (synjectors[i].getAttribute("cache") == "false" || !cache[url] ) {
                        // get file
                        que[url] = {};
                        que[url]["targets"] = [];
                        que[url]["targets"].push(synjectors[i])
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
    }


    //=========
    // Bindings
    //=========

    // Force an include to a target DOM element
    window.synject = function (target, path) {
        if (!target) {return;}
        if (typeof target == 'string' || target instanceof String) {
            target = document.getElementById(target);
        }
        var url = getFullURL(path);
        if (que[url]) {
            que[url]["targets"].push(target);
        }
        else {
            que[url] = {};
            que[url]["targets"] = [];
            que[url]["targets"].push(target)
            fetchContent(url);
        }
    }

    // Add an event document
    document.addEventListener('DOMContentLoaded', function () {
        loadSynjectors();
    });


})(this);