function findPosX(obj)
{
  var curleft = 0;
  if(obj.offsetParent)
    while(obj.offsetParent) {
      curleft += obj.offsetLeft;
      obj = obj.offsetParent;
    }
  else if(obj.x)
    curleft += obj.x;
  return curleft;
}

function findPosY(obj)
{
  var curtop = 0;
  if(obj.offsetParent)
    while(obj.offsetParent) {
      curtop += obj.offsetTop;
      obj = obj.offsetParent;
    }
  else if(obj.y)
    curtop += obj.y;
  return curtop;
}

function getEventTarget(e)
{
  var targ;
  if (e.target)
    targ = e.target;
  else if (e.srcElement) targ = e.srcElement;
  if (targ.nodeType == 3) // defeat Safari bug
    targ = targ.parentNode;
  return targ;
}

function getInnerText(ele) {
  if (typeof ele.textContent != 'undefined')
    return ele.textContent;
  else
    return ele.innerText;
}

function cancelBubble(e)
{
  if (e) {
  	e.cancelBubble = true;
  	if (e.stopPropagation) e.stopPropagation();
  }
}

function makeEventHandler(methodName)
{
  return (function(e)
  {
    e = e || window.event;
    return methodName(e);
  });
}

function makeEventHandlerWithArg(methodName, arg)
{
  return (function(e)
  {
    e = e || window.event;
    return methodName(e, arg);
  });
}

function makeObjectEventHandler(jsObj, methodName)
{
  return (function(e)
  {
    e = e || window.event;
    return jsObj[methodName](e, this);
  });
}

String.prototype.ltrim=new Function("return this.replace(/^\\s+/,'')")
String.prototype.rtrim=new Function("return this.replace(/\\s+$/,'')")
String.prototype.trim=new Function("return this.replace(/^\\s+|\\s+$/g,'')")

function setElementText(elem, str) {
  if (elem.nodeName == 'TEXTAREA' || elem.nodeName == 'INPUT') {
    elem.value = str;
  } else if (elem.nodeName == 'SELECT') {
    var i
    for (i = 0; i < elem.options.length; i++) {
      if (elem.options[i].value == str) { elem.selectedIndex = i; break; }
    }
  } else {
    elem.innerHTML = str;
  }
}

function getElementText(elem) {
  if (elem.nodeName == 'TEXTAREA' || elem.nodeName == 'INPUT') {
    return elem.value;
  } else if (elem.nodeName == 'SELECT') {
    return elem.options[elem.selectedIndex].value.toString();
  } else {
    return elem.innerHTML;
  }
}

function getDocumentHeight() {
  if (self.innerHeight) { return self.innerHeight; }
  else if (document.documentElement && document.documentElement.clientHeight) { return document.documentElement.clientHeight; }
  else if (document.body) { return document.body.clientHeight; }
}

function getDocumentWidth() {
  if (self.innerWidth) { return self.innerWidth; }
  else if (document.documentElement && document.documentElement.clientWidth) { return document.documentElement.clientWidth; }
  else if (document.body) { return document.body.clientWidth; }
}

function cloneObject(what) { for (i in what) { if (typeof what[i] == 'object') { this[i] = new cloneObject(what[i]);} else { this[i] = what[i]; } } }