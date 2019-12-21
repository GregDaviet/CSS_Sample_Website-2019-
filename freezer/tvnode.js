/* Single level tree view */

var _expandedImage;
var _collapsedImage;
var _expandCallback;
var _htTreeView = new Hashtable();

function setTreeViewNodeImages(collapsedImage, expandedImage, width, height, callback) {
  if (document.images) {
    var pic= new Image(width, height);
    pic.src=expandedImage;
    var pic= new Image(width, height);
    pic.src=collapsedImage;
  }
  _expandedImage = expandedImage;
  _collapsedImage = collapsedImage;
  _expandCallback = callback;
}

function addTreeView(tvName) {
  if (!_htTreeView.containsKey(tvName)) { _htTreeView.put(tvName, []); }
}

function addTreeViewNode(tvName, parent, arrChildren, imgId) {
  if (_htTreeView.containsKey(tvName)) {
    var arrNodes = _htTreeView.get(tvName);

    var newNode = {};
    newNode.parent = parent;
    newNode.arrChildren = arrChildren;
    newNode.imgId = imgId;
    newNode.bExpanded = false;

    arrNodes[arrNodes.length] = newNode;

    var elem = document.getElementById(imgId);
    if (elem) { elem.onclick = makeEventHandlerWithArg(_toggleExpandedOnClick, [tvName, parent]); }

    _expandTreeViewNode(newNode, newNode.bExpanded);
  }
}

function expandTreeViewNode(tvName, parent, bExpanded) {
  if (!_htTreeView.containsKey(tvName)) { return; }

  var arrNodes = _htTreeView.get(tvName);
  for (i in arrNodes) {
    if (arrNodes[i].parent == parent) {  _expandTreeViewNode(arrNodes[i], bExpanded); }
  }
}

function _expandTreeViewNode(node, bExpanded) {
  var i;
  for (i in node.arrChildren) {
    var elem = document.getElementById(node.arrChildren[i]);
    if (elem) { elem.style.display = (bExpanded ? '' : 'none'); }
  }
  var imgElem = document.getElementById(node.imgId);
  if (imgElem) { imgElem.src = (bExpanded ? _expandedImage : _collapsedImage); }
  node.bExpanded = bExpanded;
  if (_expandCallback) { _expandCallback(); }
}

function isExpanded(tvName, parent) {
  if (!_htTreeView.containsKey(tvName)) { return false; }

  var arrNodes = _htTreeView.get(tvName);
  for (i in arrNodes) {
    if (arrNodes[i].parent == parent) {  return arrNodes[i].bExpanded;  }
  }
  return false;
}

function _toggleExpandedOnClick(e, arr)
{
  cancelBubble(e);
  toggleExpanded(arr[0], arr[1]);
}

function toggleExpanded(tvName, parent) {
  if (!_htTreeView.containsKey(tvName)) { return false; }

  var arrNodes = _htTreeView.get(tvName);
  for (i in arrNodes) {
    if (arrNodes[i].parent == parent) {  _expandTreeViewNode(arrNodes[i], !arrNodes[i].bExpanded);  }
  }
  return false;
}