var _controllerName='';
var _ctrlList=new Hashtable();

var _dontClosePopup=false;
var _floorplanEnabled=false;

var _activeMenuItem=null;
var _activeMenuItemId='';
var _activeMenuId='';

var _popupObject=null;

var _pageData=null;


function convertEngUnit(eu) {
  if (eu == 'DF' || eu == 'DDF') { eu='&deg;F' }
  else if (eu == 'DC' || eu == 'DC') { eu='&deg;C' }
  return eu;
}

function newPageLoaded() {
  document.body.style.cursor='default';
  sizeContent();
}

function onPageError(status) {
  document.getElementById('dataContainerContent').innerHTML='Error accessing E2.';
  newPageLoaded();
}

function onNewPageReplaced(obj, objOldContent, objNewContent) {

  sizeContent();
//  try {
    _pageData=null;
    var elem=document.getElementById('_pageData');
    if (elem) { _pageData=eval('('+getInnerText(elem)+')'); }
    if (_pageData && _pageData.load) { _pageData.load(); }
//  } catch(err) { alert(err); }

  newPageLoaded();
}

function menuClicked(menuItem, menuItemId, menuId, href) {

//  try {
    if (_pageData && _pageData.unload) { _pageData.unload(); }
    _pageData=null;
//  } catch(err) { alert(err); }

  clearSelected('helpMenu');
  clearAllJsonCalls();
  closePopup();

  _activeMenuItem=menuItem;
  _activeMenuItemId=menuItemId;
  _activeMenuId=menuId;

  document.body.style.cursor='wait';
  try {
    var newPage=new DataRequestor();
    newPage.setObjToReplace('dataContainerContent');
    newPage.onreplace=onNewPageReplaced;
    newPage.onfail=onPageError;
    newPage.getURL(href);
  } catch(err) {}

  if ((menuId == 'ctrlList') && (menuItemId != 'alladvisories')) {
    //expandTreeViewNode
    var id = menuItemId.split('$')[0];
    expandTreeViewNode('ctrlList', id, true);
    document.title = id;
    document.getElementById('titleLowerMiddle').innerHTML = id;
  }

  return false;
}


function populateCtrlListError(status) {
  document.getElementById('ctrlList').innerHTML='Error!';
}

function populateCtrlListSuccess(jsonData, obj) {
  var data=jsonData.result;
  for (i in data) {
    var name = data[i].name;
    //{ "name": "ALPINE", "type": 102, "model": "CX-400 ", "rev": "2.61B03", "subnet": 1, "node": 1 }
    _ctrlList.put(name, {data:data[i], thisController:(_controllerName == name), annunciator:false, allowTM:false});
  }
  getMoreCtrlListData();
}

function populateCtrlList() { setTreeViewNodeImages('plus.gif', 'minus.gif', 9, 9, null); getControllerList(populateCtrlListSuccess, populateCtrlListError); }


function getMoreCtrlListData() {
  var props = [];
  var idKeys = _ctrlList.keys();
  for (i in idKeys) {
    var name = idKeys[i];
    props.push(name + ':GENERAL SERV:7336'); //terminal mode
    props.push(name + ':GENERAL SERV:7023'); //annucatiator
  }
  getConfigValues(getMoreCtrlListDataSuccess, populateCtrlListError, props);
}


function getMoreCtrlListDataSuccess(jsonData, obj) {

  var data=jsonData.result.data;

  for (i in data) {
    var propFullName = data[i].prop;
    var propSplit = propFullName.split(':');
    var name = propSplit[0];
    var propNum = propSplit[2];
    var controller = _ctrlList.get(name);
    if (propNum == '7336' && data[i].value=='Yes') { controller.allowTM = true; }
    if (propNum == '7023' && data[i].value=='Yes') { controller.annunciator = true; }
  }

  var html = '<div class="ctrlItemSpacer">&nbsp;</div>';
  var thisControllerId = '';
  var controllers = _ctrlList.values();
  for (i in controllers) {
    var id=controllers[i].data.name;

    html += '<div id="'+id+'" href="status.asp?ctrl='+id+'&model='+controllers[i].data.model+'&rev='+controllers[i].data.revision+'&subnet='+controllers[i].data.subnet.toString()+'" class="ctrlItem"><img src="" alt="" id = "' + id+ '$expandImg" />&nbsp;'+id+'</div>';

    if (controllers[i].annunciator) {
      html += '<div id="'+id+'$annunciator" href="advisory.asp?ctrl='+id+'&filter=0&annunciator=1" class="ctrlItem">&nbsp;&nbsp;&nbsp;Annunciator</div>'
      html += '<div id="'+id+'$advisory" href="advisory.asp?ctrl='+id+'&filter=1&annunciator=0" class="ctrlItem">&nbsp;&nbsp;&nbsp;Advisories</div>'
    } else {
      html += '<div id="'+id+'$advisory" href="advisory.asp?ctrl='+id+'&filter=0&annunciator=0" class="ctrlItem">&nbsp;&nbsp;&nbsp;Advisories</div>'
    }


    if (controllers[i].allowTM) {
      html += '<div id="'+id+'$tm" href="termmode.asp?subnet='+controllers[i].data.subnet.toString()+'" class="ctrlItem">&nbsp;&nbsp;&nbsp;Terminal Mode</div>'
    }

    if (controllers[i].thisController) {
      thisControllerId = id;
      if (_floorplanEnabled) {
        html += '<div id="'+id+'$fp" href="floorpl.asp?ctrl='+id+'" class="ctrlItem">&nbsp;&nbsp;&nbsp;Floor Plan</div>'
      }
    }
    html += '<div class="ctrlItemSpacer">&nbsp;</div>';
  }

  document.getElementById('ctrlList').innerHTML+=html;

  addTreeView('ctrlList');
  var idKeys = _ctrlList.keys();
  for (i in idKeys) {
    id = idKeys[i];
    addTreeViewNode('ctrlList', id, [id + '$annunciator', id + '$advisory', id + '$tm', id + '$fp'], id+ '$expandImg');
  }

  addMenu('ctrlList', 'div', 'ctrlItem', 'ctrlItemSelected', 'ctrlItemHover', true, menuClicked);
  if (thisControllerId != '') {
    menuClick(document.getElementById(thisControllerId), 'ctrlList');
  }
}

function setFloorplanEnabled(enabled) { _floorplanEnabled = enabled; }
function setControllerName(controllerName) { _controllerName=controllerName; }

function setNavigation(activeMenuItemId, activeMenuId) {
  _activeMenuItemId=activeMenuItemId;
  _activeMenuId=activeMenuId;
}



/* Resizing the content of the page */
function sizeContent() {

  var docHeight = getDocumentHeight();
  var docWidth = getDocumentWidth();
  var ctrlList=document.getElementById('ctrlList');
  var height=docHeight - findPosY(ctrlList);

  ctrlList.style.height=height.toString()+'px';
  var dataLeft=findPosX(ctrlList)+ctrlList.offsetWidth;

  var dataContainer=document.getElementById('dataContainer');
  dataContainer.style.height=height.toString()+'px';
  dataContainer.style.left=dataLeft.toString()+'px';
  dataContainer.style.width=(docWidth- dataLeft).toString()+'px';

  var dataContainerContent=document.getElementById('dataContainerContent');
  dataContainerContent.style.width=(dataContainer.offsetWidth - 20).toString()+'px';

  var dataContainerFiller=document.getElementById('dataContainerFiller');

  if (_pageData && _pageData.setContentDimensions) {
    dataContainerFiller.style.display='none';
    dataContainer.style.overflowY='auto';
    _pageData.setContentDimensions(dataContainer.style.height, dataContainer.offsetWidth + 'px');
  } else {
    if (height < dataContainerContent.scrollHeight) {
      dataContainerFiller.style.display='none';
      dataContainer.style.overflowY='auto';
    } else {
      dataContainerFiller.style.display='';
      dataContainerFiller.style.height=height.toString()+'px';
      dataContainerFiller.style.width=(dataContainer.offsetWidth - 20).toString()+'px';
      var dataContainerFillerContent = document.getElementById('dataContainerFillerContent');
      if (_pageData && _pageData.contentWidth) {
        dataContainerFillerContent.style.width=_pageData.contentWidth().toString() + 'px';
        dataContainerFillerContent.style.display='';
      } else {
        dataContainerFillerContent.style.display='none';
      }
      dataContainer.style.overflowY='hidden';
    }
  }
}



/* Popup stuff here */

function closePopup() {
  document.getElementById('popupInfo').style.display='none';
  document.getElementById('popupInfoShim').style.display='none';
  document.getElementById('popupHelp').style.display='none';
  _dontClosePopop=false;
  if (_popupObject) { if (_popupObject.destroy) { _popupObject.destroy(); } _popupObject=null;}
}

function getPopup(dontClosePopup) {
  if (_popupObject) { if (_popupObject.destroy) { _popupObject.destroy(); } _popupObject=null;}
  var popupContent=document.getElementById('popupContent');
  while (popupContent.firstChild) { popupContent.removeChild(popupContent.firstChild); }
  if (dontClosePopup == null) { _dontClosePopup = false; } else { _dontClosePopup=dontClosePopup; }
  return popupContent;
}

function showPopup(left, top, width, height) {
  var popupInfo=document.getElementById('popupInfo');
  var popupInfoShim=document.getElementById('popupInfoShim');

  popupInfo.style.display='block';
  popupInfoShim.style.display='block';

  var popupTerm=document.getElementById('popupTerm');
  popupTerm.style.display=(_dontClosePopup ? 'none' : '');

  popupInfo.style.left=left;
  popupInfo.style.top=top;
  if (width) { popupInfo.style.width=width; }
  if (height) { popupInfo.style.height=height; }

  alignPopupInfoShim(popupInfo, popupInfoShim);
}

function alignPopupInfoShim(popupInfo, popupInfoShim) {
  if (!popupInfo) {document.getElementById('popupInfo'); }
  if (!popupInfoShim) {document.getElementById('popupInfoShim'); }

  popupInfoShim.style.left=popupInfo.style.left;
  popupInfoShim.style.top=popupInfo.style.top;
  popupInfoShim.style.width=popupInfo.offsetWidth;
  popupInfoShim.style.height=popupInfo.offsetHeight;
}

function ensurePopupVisible() {
  var docHeight = getDocumentHeight();
  var docWidth = getDocumentWidth();

  var popupInfo=document.getElementById('popupInfo');
  var popupInfoShim=document.getElementById('popupInfoShim');
  var dataContainer=document.getElementById('dataContainer');

  var left=findPosX(popupInfo);
  var top=findPosY(popupInfo);
  if ((left+popupInfo.offsetWidth) > (docWidth - 20)) { left=docWidth - popupInfo.offsetWidth - 20; }
  if ((top+popupInfo.offsetHeight) > docHeight) { top=docHeight - popupInfo.offsetHeight; }

  var dcLeft=findPosX(dataContainer);
  var dcTop=findPosY(dataContainer);
  if (left < dcLeft) { left=dcLeft; }
  if (top < dcTop) { top=dcTop; }

  showPopup(left.toString()+'px', top.toString()+'px');
}

function isPopupOpen() {
  if (document.getElementById('popupInfo').style.display!='block') { return false; }
  return true;
}

function setPopupTitle(caption) {
  var captionDiv=document.getElementById('popupCaption');
  captionDiv.innerHTML=caption;
  return document.getElementById('popupTitle');
}

function setPopupHelp(item) {
  var help=document.getElementById('popupHelp');
  help.style.display='';
  help.onclick=function() {openMoreInfo(item);};
}

function onPopupError(status) { closePopup(); document.body.style.cursor='default'; alert('Could not peform operation.');}


/* Graphing stuff here */
function onShowGraphSuccess(jsonData, obj) {
  result=jsonData.result;
  document.body.style.cursor='default';
  var graphElem=document.getElementById('graphPopup')
  if (graphElem && result) {
    graphElem.innerHTML='';
    var graph=new LogGraph(graphElem);
    _popupObject = graph;
    graph.engUnits=convertEngUnit(result.engUnits);
    graph.sampleInterval=result.sample_interval;
    graph.digital=result.digital;
    graph.dataArray(result.data);
    graph.draw();
  } else {
	graphElem.innerHTML='<br>&nbsp;&nbsp;&nbsp;&nbsp;<b>Graph data is not available!</b>';
  }
}

function showGraph(e, arg) {
  cancelBubble(e);
  document.body.style.cursor='wait';
  var elem=getEventTarget(e);
  var offset=document.getElementById('dataContainer').scrollTop;
  var height=370;
  var width=500;
  var top=findPosY(elem)+elem.offsetHeight - offset;
  var left=findPosX(elem);
  if (!arg.propCaption)
    arg.propCaption=arg.prop;

  var popup=getPopup();

  showPopup(left.toString()+'px', top.toString()+'px', width.toString()+'px', height.toString()+'px');

  var captionDiv = setPopupTitle('Graph: ' + arg.propCaption);
  setPopupHelp('graph');

  var graphDiv=document.createElement('div');
  popup.appendChild(graphDiv);
  graphDiv.style.width=(width - 2).toString()+'px';
  graphDiv.style.height=(height - captionDiv.offsetHeight - 4).toString()+'px';
  graphDiv.style.border='1px solid #ffffff';
  graphDiv.innerHTML='Loading...';
  graphDiv.id='graphPopup';

  ensurePopupVisible();
  getLogData(onShowGraphSuccess, onPopupError, arg.prop);
}

/* More help here */
function openMoreInfo(helpItem) {
  var w = window.open('morehelp.asp?item=' + helpItem.toString(), 'e2morehelp', 'height=400,width=600,resizable=yes,scrollbars=yes');
  if (w) { w.focus(); }
}
