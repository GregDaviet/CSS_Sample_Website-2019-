var _E2jsonId = 0;
var _E2jsonUrl = 'https://dixieranch-cors-anywhere.herokuapp.com/http://server.dixieranch.com:8151/JSON-RPC';

var _E2json = new DataRequestor();
var _E2jsonAction = new DataRequestor();
var _E2jsonUpdate = new DataRequestor();

function clearAllJsonCalls() {
  _E2json.clear();
  _E2jsonAction.clear();
  _E2jsonUpdate.clear();
}

function getNextId() { return _E2jsonId; }

function getCellList(successResult, failResult, controllerName) {
  _E2json.clear(); _E2json.onload = successResult; _E2json.onfail = failResult;
  _E2json.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.GetCellList","params":["' + controllerName + '"]}');
  return _E2json.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function setOverride(successResult, failResult, point, override, overrideType, overrideTime, overrideValue) {
  _E2jsonAction.clear(); _E2jsonAction.onload = successResult; _E2jsonAction.onfail = failResult;
  _E2jsonAction.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.Override","params":["' + point + '",' + override + ',' + overrideType + ',"' + overrideTime + '","' + overrideValue + '"]}');
  return _E2jsonAction.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function setMultiOverride(successResult, failResult, override) {
  _E2jsonAction.clear(); _E2jsonAction.onload = successResult; _E2jsonAction.onfail = failResult;
  var str = ''; var b=false;
  for (var i in override) { if (b) { str += ',';}else{ b=true;} str += '["' + override[i][0] + '",' + override[i][1] + ',' + override[i][2] + ',"' + override[i][3] + '","' + override[i][4] + '"]';  }
  _E2jsonAction.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.MultiOverride","params":[[' + str + ']]}');
  return _E2jsonAction.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function getPointInfo(successResult, failResult, point) {
  _E2json.clear(); _E2json.onload = successResult; _E2json.onfail = failResult;
  _E2json.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.GetPointInfo","params":["' + point + '"]}');
  return _E2json.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function getMultiPointInfo(successResult, failResult, points) {
  _E2json.clear(); _E2json.onload = successResult; _E2json.onfail = failResult;
  var str = ''; var b=false;
  for (var i in points) { if (b) { str += ',';}else{ b=true;} str += '"' + points[i] + '"';  }
  _E2json.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.GetMultiPointInfo","params":[[' + str + ']]}');
  return _E2json.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function getExpandedStatus(successResult, failResult, point) {
  _E2jsonUpdate.clear(); _E2jsonUpdate.onload = successResult; _E2jsonUpdate.onfail = failResult;
  _E2jsonUpdate.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.GetExpandedStatus","params":["' + point + '"]}');
  return _E2jsonUpdate.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function getMultiExpandedStatus(successResult, failResult, points) {
  _E2jsonUpdate.clear(); _E2jsonUpdate.onload = successResult; _E2jsonUpdate.onfail = failResult;
  var str = ''; var b=false;
  for (var i in points) { if (b) { str += ',';}else{ b=true;} str += '"' + points[i] + '"';  }
  _E2jsonUpdate.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.GetMultiExpandedStatus","params":[[' + str + ']]}');
  return _E2jsonUpdate.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function getExpandedInfo(successResult, failResult, point) {
  _E2json.clear(); _E2json.onload = successResult; _E2json.onfail = failResult;
  _E2json.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.GetExpandedInfo","params":["' + point + '"]}');
  return _E2json.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function getLogData(successResult, failResult, point) {
  _E2jsonAction.clear(); _E2jsonAction.onload = successResult; _E2jsonAction.onfail = failResult;
  _E2jsonAction.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.GetLogDataRaw","params":["' + point + '"]}');
  return _E2jsonAction.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function getAlarmList(successResult, failResult, controller, filter) {
  _E2jsonUpdate.clear(); _E2jsonUpdate.onload = successResult; _E2jsonUpdate.onfail = failResult;
  _E2jsonUpdate.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.GetAlarmList","params":["' + controller + '", ' + (filter?true:false) + ']}');
  return _E2jsonUpdate.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function doAlarmAction(successResult, failResult, action, selectedList) {
  _E2jsonAction.clear(); _E2jsonAction.onload = successResult; _E2jsonAction.onfail = failResult;
  var str = ''; var b=false;
  for (var i in selectedList) { if (b) { str += ',';}else{ b=true;} str += '"' + selectedList[i] + '"';  }
  _E2jsonAction.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.AlarmAction","params":[' + action + ',[' + str + ']]}');
  return _E2jsonAction.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function getDeviceInfoFromRoute(successResult, failResult, route) {
  _E2json.clear(); _E2json.onload = successResult; _E2json.onfail = failResult;
  _E2json.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.GetDeviceInfoForRoute","params":["' + route + '"]}');
  return _E2json.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function getConfigValues(successResult, failResult, points) {
  _E2json.clear(); _E2json.onload = successResult; _E2json.onfail = failResult;
  var str = ''; var b=false;
  for (var i in points) { if (b) { str += ',';}else{ b=true;} str += '"' + points[i] + '"';  }
  _E2json.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.GetConfigValues","params":[[' + str + ']]}');
  return _E2json.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function setConfigValues(successResult, failResult, propValue) {
  _E2jsonAction.clear(); _E2jsonAction.onload = successResult; _E2jsonAction.onfail = failResult;
  var str = ''; var b=false;
  for (var i in propValue) { if (b) { str += ',';}else{ b=true;} str += '{"prop":"' + propValue[i].prop + '","value":"' + propValue[i].value + '"}';  }
  _E2jsonAction.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.SetConfigValues","params":[[' + str + ']]}');
  return _E2jsonAction.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function getAuxValue(successResult, failResult, point, props) {
  _E2json.clear(); _E2json.onload = successResult; _E2json.onfail = failResult;
  var str = ''; var b=false;
  for (var i in props) { if (b) { str += ',';}else{ b=true;} str += '"' + props[i] + '"'; }
  _E2json.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.GetAuxProps","params":["' +point+'",[' + str + ']]}');
  return _E2json.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function setAuxValue(successResult, failResult, point, props) {
  _E2json.clear(); _E2json.onload = successResult; _E2json.onfail = failResult;
  var str = ''; var b=false;
  for (var i in props) { if (b) { str += ',';}else{ b=true;} str += '{"prop":"' + props[i].prop + '","value":"' + props[i].value + '"}'; }
  _E2json.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.SetAuxProps","params":["' +point+'",[' + str + ']]}');
  return _E2json.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function getMultiAuxValues(successResult, failResult, points) {
  _E2json.clear(); _E2json.onload = successResult; _E2json.onfail = failResult;
  var str = ''; var b=false;
  for (var i in points) {
    if (b) { str += ',';}else{ b=true;}
    str += '{"prop":"' + points[i].prop + '","auxProps":[';

    var auxProps = points[i].auxProps;
    var b2=false;
    for (var j in auxProps) { if (b2) { str += ',';}else{b2=true;} str += '"' + auxProps[j].prop + '"'; }

    str+="]}";
  }
  _E2json.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.GetMultiAuxProps","params":[[' + str + ']]}');
  return _E2json.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function setMultiAuxValues(successResult, failResult, points) {
  _E2json.clear(); _E2json.onload = successResult; _E2json.onfail = failResult;
  var str = ''; var b=false;
  for (var i in points) {
    if (b) { str += ',';}else{ b=true;}
    str += '{"prop":"' + points[i].prop + '","auxProps":[';

    var auxProps = points[i].auxProps;
    var b2=false;
    for (var j in auxProps) { if (b2) { str += ',';}else{b2=true;} str += '{"prop":"' + auxProps[j].prop + '","value":"' + auxProps[j].value + '"}'; }

    str+="]}";
  }
  _E2json.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.SetMultiAuxProps","params":[['+str+']]}');
  return _E2json.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function getLoginInfo(successResult, failResult) {
  var dr = new DataRequestor();
  dr.clear(); dr.onload = successResult; dr.onfail = failResult;
  dr.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.GetLoginInfo","params":[]} ');
  return dr.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function GetAppConfig(successResult, failResult, app) {
  _E2json.clear(); _E2json.onload = successResult; _E2json.onfail = failResult;
  _E2json.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.GetAppConfig","params":["'+app+'"]} ');
  return _E2json.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function SetAppConfig(successResult, failResult, app, cfg) {
  _E2json.clear(); _E2json.onload = successResult; _E2json.onfail = failResult;
  _E2json.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.SetAppConfig","params":["'+app+'","'+cfg+'"]} ');
  return _E2json.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function GetAlarmStatus(successResult, failResult) {
  var dr = new DataRequestor();
  dr.clear(); dr.onload = successResult; dr.onfail = failResult;
  dr.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.GetMultiExpandedStatus","params":[["' + _controllerName + ':ADVISORY SERV:ALARM OUTPUT"]]} ');
  return dr.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function getBatteryStatus(successResult, failResult) {
  var dr = new DataRequestor();
  dr.clear(); dr.onload = successResult; dr.onfail = failResult;
  dr.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.GetBatteryStatus","params":[]}');
  return dr.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function batteryReplaced(successResult, failResult) {
  _E2jsonAction.clear(); _E2jsonAction.onload = successResult; _E2jsonAction.onfail = failResult;
  _E2jsonAction.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.BatteryReplaced","params":[]}');
  return _E2jsonAction.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function getOutputPointers(successResult, failResult, points) {
  _E2json.clear(); _E2json.onload = successResult; _E2json.onfail = failResult;
  var str = ''; var b=false;
  for (var i in points) { if (b) { str += ',';}else{ b=true;} str += '"' + points[i] + '"';  }
  _E2json.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.GetOutputPointers","params":[[' + str + ']]}');
  return _E2json.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function getControllerList(successResult, failResult) {
  _E2json.clear(); _E2json.onload = successResult; _E2json.onfail = failResult;
  _E2json.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.GetControllerList","params":[1]}');
  return _E2json.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

/*
function startBackup(successResult, failResult) {
  _E2jsonAction.clear(); _E2jsonAction.onload = successResult; _E2jsonAction.onfail = failResult;
  _E2jsonAction.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.Backup.Start","params":[]} ');
  return _E2jsonAction.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function getBackupStatus(successResult, failResult) {
  _E2json.clear(); _E2json.onload = successResult; _E2json.onfail = failResult;
  _E2json.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.Backup.Status","params":[]} ');
  return _E2json.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function terminateBackup(successResult, failResult) {
  _E2jsonAction.clear(); _E2jsonAction.onload = successResult; _E2jsonAction.onfail = failResult;
  _E2jsonAction.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.Backup.Terminate","params":[]} ');
  return _E2jsonAction.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function startRestoreSession(successResult, failResult) {
  _E2jsonAction.clear(); _E2jsonAction.onload = successResult; _E2jsonAction.onfail = failResult;
  _E2jsonAction.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.Restore.StartSession","params":[]} ');
  return _E2jsonAction.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function startRestore(successResult, failResult, file) {
  _E2jsonAction.clear(); _E2jsonAction.onload = successResult; _E2jsonAction.onfail = failResult;
  _E2jsonAction.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.Restore.Start","params":["' + file + '"]} ');
  return _E2jsonAction.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function applyRestore(successResult, failResult) {
  _E2jsonAction.clear(); _E2jsonAction.onload = successResult; _E2jsonAction.onfail = failResult;
  _E2jsonAction.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.Restore.Apply","params":[]} ');
  return _E2jsonAction.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function getRestoreStatus(successResult, failResult) {
  _E2json.clear(); _E2json.onload = successResult; _E2json.onfail = failResult;
  _E2json.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.Restore.Status","params":[]} ');
  return _E2json.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}

function terminateRestore(successResult, failResult) {
  _E2jsonAction.clear(); _E2jsonAction.onload = successResult; _E2jsonAction.onfail = failResult;
  _E2jsonAction.addArgWithoutEscape(_POST, '0', '{"id":' + (_E2jsonId++).toString() + ',"method":"E2.Restore.Terminate","params":[]} ');
  return _E2jsonAction.getURL(_E2jsonUrl, _RETURN_AS_JSON_RPC);
}
*/