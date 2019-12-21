var _RETURN_AS_JSON_RPC = 3;
var _RETURN_AS_JSON = 2;
var _RETURN_AS_TEXT = 1;
var _RETURN_AS_DOM  = 0;

var _POST           = 0;
var _GET            = 1;

var _CACHE           = 0;
var _NO_CACHE        = 1;

function DataRequestor() {
    var self = this;  // workaround for scope errors: see http://www.crockford.com/javascript/private.html

    this.getXMLHTTP = function() {
        var xmlHTTP = null;

        try {
            xmlHTTP = new XMLHttpRequest();
        } catch (e) {
            try {
                xmlHTTP = new ActiveXObject("Msxml2.XMLHTTP")
            } catch(e) {
                var success = false;
                var MSXML_XMLHTTP_PROGIDS = new Array(
                    'Microsoft.XMLHTTP',
                    'MSXML2.XMLHTTP',
                    'MSXML2.XMLHTTP.5.0',
                    'MSXML2.XMLHTTP.4.0',
                    'MSXML2.XMLHTTP.3.0'
                );
                for (var i=0;i < MSXML_XMLHTTP_PROGIDS.length && !success; i++) {
                    try {
                        xmlHTTP = new ActiveXObject(MSXML_XMLHTTP_PROGIDS[i]);
                        success = true;
                    } catch (e) {
                        xmlHTTP = null;
                    }
                }
            }

        }
        self._XML_REQ = xmlHTTP;
        return self._XML_REQ;
    }

    this.getURL = function(url) {
        self.userModifiedData = "";  // clear user modified data;
        // DID THE USER WANT A DOM OBJECT, OR JUST THE TEXT OF THE REQUESTED DOCUMENT?
			switch (arguments[1]) {
				case _RETURN_AS_DOM:
				case _RETURN_AS_TEXT:
				case _RETURN_AS_JSON:
				case _RETURN_AS_JSON_RPC:
					self.returnType = arguments[1];
					break;

				default:
					self.returnType = _RETURN_AS_TEXT;
			}

		// CLEAR OUT ANY CURRENTLY ACTIVE REQUESTS
            if ((typeof self._XML_REQ.abort) != "undefined" && self._XML_REQ.readyState!=0) { // Opera can't abort().
                self._XML_REQ.abort();
            }

        // SET THE STATE CHANGE FUNCTION
            self._XML_REQ.onreadystatechange = self.callback;

        // GENERATE THE POST AND GET STRINGS
            var requestType = "GET";
            var getUrlString = (url.indexOf("?") != -1)?"&":"?";
            for (var i in self.argArray[_GET]) {
                getUrlString += i + "=" + self.argArray[_GET][i] + "&";
            }

            var postUrlString = "";

            if (self.returnType !=_RETURN_AS_JSON_RPC) {
              for (i in self.argArray[_POST]) {
                  postUrlString += i + "=" + self.argArray[_POST][i] + "&";
              }
            } else {
              for (i in self.argArray[_POST]) {
                  postUrlString += self.argArray[_POST][i];
              }
            }

            if (postUrlString != "") {
                requestType = "POST";  // Only POST if we have post variables
            }

        // MAKE THE REQUEST

            self._XML_REQ.open(requestType, url + getUrlString, true);
	          if ((typeof self._XML_REQ.setRequestHeader) != "undefined") { // Opera can't setRequestHeader()
                if (self.returnType == _RETURN_AS_DOM && typeof self._XML_REQ.overrideMimeType == "function") {
                    self._XML_REQ.overrideMimeType('text/xml');  // Make sure we get XML if we're trying to process as DOM
                }
                if (self.returnType == _RETURN_AS_JSON_RPC) {
                    self._XML_REQ.setRequestHeader('Content-Type','text/plain');
                } else {
                    self._XML_REQ.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
                }
            }
            self._XML_REQ.send(postUrlString);

       return true;
    }



    this.callback = function() {
        if (self.onLoad) {
            self.onload     = self.onLoad;
        }
        if (self.onReplace) {
            self.onreplace  = self.onReplace;
        }
        if (self.onProgress) {
            self.onprogress = self.onProgress;
        }
        if (self.onFail) {
            self.onfail     = self.onFail;
        }

        if (
            (self._XML_REQ.readyState == 4 && self._XML_REQ.status == 200)
            ||
            (self._XML_REQ.readyState == 4 && self._XML_REQ.status == 0) // Uncomment for local (non-hosted files)


/*            ||
            (self._XML_REQ.readyState == 4 && (typeof self._XML_REQ.status) == 'undefined') /* Safari 2.0/1.3 has a strange bug related to not returning the correct status */
           ) {
            var obj = self.getObjToReplace();
            if (self.onload) {
            	switch (self.returnType) {
            		case _RETURN_AS_TEXT:
            			// We want text back, so send responseText
	                    self.onload(self._XML_REQ.responseText, obj);
	                    break;

	                case _RETURN_AS_DOM:
	                	// We want a DOM object back, so send a normalized responseXML
                      self.onload(self.normalizeWhitespace(self._XML_REQ.responseXML), obj);
	                    break;

	                case _RETURN_AS_JSON:
                  case _RETURN_AS_JSON_RPC:
	                	// We want a javascript object back, so give it:
                    try {
                      self.onload(eval('(' + self._XML_REQ.responseText + ')'), obj);
                    } catch(err) {}
	                	break;
            	}
            }
            if (obj) {
                // We're going to replace obj's content with the text returned from the XML_REQ.
                // The old content will be stored in self.objOldContent, the new content in
                // self.objNewContent

				// We treat TEXTAREA and INPUT nodes differently (because IE crashes if you
				// try to adjust a TEXTAREA's innerHTML).
				if (obj.nodeName == "TEXTAREA" || obj.nodeName == "INPUT") {
				    self.objOldContent = obj.value;
					obj.value          = (self.userModifiedData)?self.userModifiedData:self._XML_REQ.responseText;
					self.objNewContent = obj.value;
				} else {
				    self.objOldContent = obj.innerHTML;
					obj.innerHTML      = (self.userModifiedData)?self.userModifiedData:self._XML_REQ.responseText;
					self.objNewContent = obj.innerHTML;
				}
                if (self.onreplace) {
                    self.onreplace(obj, self.objOldContent, self.objNewContent);
                }
            }
        } else if (self._XML_REQ.readyState == 3) {
            if (self.onprogress && !document.all) { // This would throw an error in IE.
                var contentLength = 0;
                // Depends on server.  If content-length isn't set, catch the error
                try {
                    contentLength = self._XML_REQ.getResponseHeader("Content-Length");
                } catch (e) {
                    contentLength = -1;
                }
                self.onprogress(self._XML_REQ.responseText.length, contentLength);
            }

        } else if (self._XML_REQ.readyState == 4) {
            if (self.onfail) {
                self.onfail(self._XML_REQ.status);
            } else {
                throw new Error("Data Request failed with an HTTP status of " + self._XML_REQ.status + "\nresponseText = " + self._XML_REQ.responseText);
            }
        }
    }


    this.normalizeWhitespace = function (domObj) {
        // with thanks to the kind folks in this thread:
        //    http://www.codingforums.com/archive/index.php/t-7028
        if (document.createTreeWalker) {
            var filter = {
                acceptNode: function(node) {
                    if (/\S/.test(node.nodeValue)) {
                        return NodeFilter.FILTER_SKIP;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
            var treeWalker = document.createTreeWalker(domObj, NodeFilter.SHOW_TEXT, filter, true);
            while (treeWalker.nextNode()) {
                treeWalker.currentNode.parentNode.removeChild(treeWalker.currentNode);
                treeWalker.currentNode = domObj;
            }
            return domObj;
        } else {
            return domObj;
        }
    }

    this.commitData = function (newData) {
        self.userModifiedData = newData;
    }

    this.setObjToReplace = function(obj) {
        if (typeof obj == "object") {
            self.objToReplace = obj;
        } else if (typeof obj == "string") {
            self.objToReplaceID = obj;

        }
    }

    this.getObjToReplace = function() {
        if (self.objToReplaceID != "") {
            self.objToReplace = document.getElementById(self.objToReplaceID);
            self.objToReplaceID = "";
        }
        return self.objToReplace;
    }

    this.addArg = function(type, name, value) {
        self.argArray[type][name] = escape(value);
    }

    this.addArgWithoutEscape = function(type, name, value) {
        self.argArray[type][name] = value;
    }

    this.clearArgs = function() {
        self.argArray[_POST] = new Array();
        self.argArray[_GET]  = new Array();
    }

    this.addArgsFromForm = function(formID) {
        var theForm = document.getElementById(formID);

        // Get form method, default to GET
        var submitMethod = (theForm.getAttribute('method').toLowerCase() == 'post')?_POST:_GET;

        // Get all form elements and use `addArg` to add them to the GET/POST string
        for (var i=0; i < theForm.childNodes.length; i++) {
            theNode = theForm.childNodes[i];
            switch(theNode.nodeName.toLowerCase()) {
                case "input":
                case "select":
                case "textarea":
                    this.addArg(submitMethod, theNode.id, theNode.value);
                    break;
            }
        }
    }

    this.clear = function() {
        self.returnType      = _RETURN_AS_TEXT;
        self.argArray        = new Array();

        self.objToReplace    = null;
        self.objToReplaceID  = "";

        self.onload          = null;
        self.onfail          = null;
        self.onprogress      = null;
        self.cache           = new Array();
        this.clearArgs();
    }

    if (!this.getXMLHTTP()) {
        throw new Error("Could not load XMLHttpRequest object");
    }

    this.clear();
}