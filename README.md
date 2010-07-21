# haven
Javascript dependency management

## haven in a nutshell

haven effectively wrangles your web application javascript dependencies.

Uses:

1. **haven("script.js");** will load jquery.js into your document's html head
inside a script tag.
2. **haven("style.css");** will load style.css into your document's html head
inside a link tag.
3. **haven(["script1.js", "script2.js", "script3.js"]);** will load each of the
scripts asynchronously (E.g. *&lt;script async="async" ...&gt;&lt;/script&gt;* )
into your document's html head.
4. **haven({ "script4.js": "script5.js" });** will load "script5.js" into your
document and then, after "script5.js" has loaded, load "script4.js".  I.e.
"script4.js" depends on "script5.js" or "script5.js" is a root of "script4.js".
5. **haven([{"script4.js": "script5.js"}, "script1.js", "script2.js", "script3.js"]);**.
haven works recursively.
6. **haven({"script4.js": ["script1.js", "script2.js", "script3.js"]});**.
haven works recursively this way, too.
7. **haven("scripts.json");** haven can load json files formatted like haven arguments:

        scripts.json:
        {
            "script4.js": [
                "style.css",
                "script5.js"
            ],
            "script5.js": [
                "script1.js",
                "script2.js",
                "script3.js
            ]
        }

8. **haven("component.json");** haven can load json files specifying a forest (package).
In this example, the "component" forest depends on "script1.js":

        component.json:
        {
            "purpose": "forest",
            "name": "component",
            "ents": {
                "script4.js": [
                    "style.css",
                    "script5.js"
                ],
                "script5.js": [
                    "script2.js",
                    "script3.js
                ]
            },
            "roots": "script1.js"
        }

Forests can also be loaded directly by calling haven with a forest object.

### Complex Example
Go from this:

    ...
    <script src="/shared/third-party/log4js/1.0-local/log4js.js"></script>
    <script src="/shared/local/core/3.0.0/gup.js"></script>
    <script src="/shared/third-party/jquery/1.4.2/jquery-1.4.2.min.js"></script>
    <link href="/shared/third-party/jquery-ui/1.8.2/css/local/jquery-ui-1.8.2.custom.css" rel="stylesheet" type="text/css">
    <script src="/shared/third-party/jquery-ui/1.8.2/jquery-ui-1.8.2.min.js"></script>
    <script src="/shared/local/core/3.0.0/core.js"></script>
    <script src="/shared/third-party/jquery/plugins/jquery.cookie.js"></script>
    <script src="/shared/local/jquery.ui.tile/0.0.5/jquery.ui.tile.js"></script>
    <link href="/shared/local/core/3.0.0/core.css" rel="stylesheet" type="text/css">
    <script src="/shared/local/jquery.jpop/1.0.0/jquery.jpop.js"></script>
    <script src="./js/ui.router_device_info.js"></script>
    <script src="./js/ui.router_device_graphs.js"></script>
    <script src="./js/ui.contacts.js"></script>
    <script src="./js/ui.router_inventory.js"></script>
    <script src="./js/ui.router_site_info.js"></script>
    <script src="./js/ui.router_vrf_info.js"></script>
    <script src="./js/ui.router_interfaces.js"></script>
    <script src="./js/ui.switch_device_info.js"></script>
    <script src="./js/ui.switch_interfaces.js"></script>
    <link href="css/router_device_info.css" rel="stylesheet" type="text/css">
    <link href="css/contacts.css" rel="stylesheet" type="text/css">
    <script src="./js/puma_core.js"></script>
    <script src="./js/devicepage_graphs.js"></script>
    <script src="./js/puma-autocomplete.js"></script>
    <script src="./js/device_status.js"></script>
    <link href="css/puma.css" rel="stylesheet" type="text/css">
    ...

to this:

    ...
    <script src="./js/haven.js"></script>
    <script>
    haven("./js/puma.json");
    </script>
    ...
    
    ./js/puma.json:
    {
        "purpose": "forest",
        "name": “puma forest”,
        "ents": {
            "./js/puma_core.js": [
                "./css/puma.css",
                "./js/devicepage_graphs.js",
                "./js/puma-autocomplete.js",
                "./js/device_status.js",
                {
                    "./js/ui.router_device_info.js": 
                        "./css/router_device_info.css"
                },
                "./js/ui.router_device_graphs.js",
                {
                    "./js/ui.contacts.js": "./css/contacts.css"
                }
                "./js/ui.router_inventory.js",
                "./js/ui.router_site_info.js",
                "./js/ui.router_vrf_info.js",
                "./js/ui.router_interfaces.js",
                "./js/ui.switch_device_info.js",
                "./js/ui.switch_interfaces.js"
            ]
        },
        "roots": "/shared/local/core/3.0.0/core.json"
    }
    
    /shared/local/core/3.0.0/core.json:
    {
        "purpose": "forest",
        "name": "core forest",
        "ents": {
            "/shared/local/core/3.0.0/core.js": [
                "/shared/local/core/3.0.0/core.css",
                "/shared/third-party/log4js/1.0-local/log4js.js",
                "/shared/local/core/3.0.0/gup.js",
                "/shared/third-party/jquery/1.4.2/jquery-1.4.2.min.js",
                "/shared/third-party/jquery-ui/1.8.2/jquery-ui-1.8.2.min.js",
                "/shared/local/jquery.ui.tile/0.0.5/jquery.ui.tile.js",
                "/shared/local/jquery.jpop/1.0.0/jquery.jpop.js"
            ],
            "/shared/third-party/jquery-ui/1.8.2/jquery-ui-1.8.2.min.js": [
                "/shared/third-party/jquery/1.4.2/jquery-1.4.2.min.js",
                "/shared/third-party/jquery-ui/1.8.2/css/local/jquery-ui-1.8.2.custom.css"
            ],
            "/shared/third-party/jquery/plugins/jquery.cookie.js":
                "/shared/third-party/jquery/1.4.2/jquery-1.4.2.min.js",
            "/shared/local/jquery.ui.tile/0.0.5/jquery.ui.tile.js": [
                "/shared/third-party/jquery/plugins/jquery.cookie.js",
                "/shared/third-party/jquery-ui/1.8.2/jquery-ui-1.8.2.min.js"
            ],
            "/shared/local/jquery.jpop/1.0.0/jquery.jpop.js":
                "/shared/third-party/jquery/1.4.2/jquery-1.4.2.min.js"
        }    
    }
