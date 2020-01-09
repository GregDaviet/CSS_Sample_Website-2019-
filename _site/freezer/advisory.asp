
<div id='_pageData' style='display:none'>
{
  popupActiveCount:0,
  ctrl:'E2 Unit01',
  annunciator: false,
  filter: false,
  timerId:null,
  alarmCallbackSuccess: null,
  alarmMoreInfo: null,
  alarmList: [],
  callbackError: function(status) {
    var tablePlace=document.getElementById('alarmPlace');
    tablePlace.innerHTML='Error retrieving alarm information.';
    document.getElementById('advisoryActive').innerHTML = '';
    document.getElementById('advisoryTotal').innerHTML = '';
    _pageData.timerId = setTimeout('_pageData.onupdate();',300000);
  },

  contentWidth: function() {
    return document.getElementById('dataContentRowWidth').offsetWidth;
  },
  load: function() {
    setTimeout('_pageData.onupdate();',1);
    if (this.annunciator) {
      document.getElementById('annunciatorTitle').style.display='';
      document.getElementById('advisoryTitle').style.display='none';
    }
  },
  unload:function() {
    clearInterval(this.timerId);
    this.alarmCallbackSuccess=null;
    this.alarmMoreInfo=null;
  },
  onupdate:function() {
    if (isPopupOpen()) {
      this.popupActiveCount++;
      if (this.popupActiveCount<4) {
        this.timerId = setTimeout('_pageData.onupdate();',300000);
        return
      } else {
        closePopup();
      }
    }
    this.popupActiveCount=0;
    getAlarmList(this.alarmCallbackSuccess, this.callbackError, this.ctrl, this.filter);
  },

  alarmCallbackSuccess:function(jsonData, obj)
  {
    if (isPopupOpen()) {
      _pageData.timerId = setTimeout('_pageData.onupdate();',300000);
      return;
    }

    _pageData.alarmList=jsonData.result.data;
    var alarmList = _pageData.alarmList;

    var i;
    var table=document.getElementById('alarmTable');
    var selected=null;
    var cell;

    selected=new Hashtable();

    var table=document.createElement('table');
    table.id='alarmTable';
    table.setAttribute('cellpadding', '1px');
    table.setAttribute('cellspacing', '1px');
    table.className='alarmTables';

    var alarmBody=document.createElement('tbody');
    table.appendChild(alarmBody);

    var row=document.createElement('tr');
    cell=document.createElement('th');
    cell.style.display='none';
    cell.appendChild(document.createTextNode('\u00A0'));
    row.appendChild(cell);

    cell=document.createElement('th');
    cell.appendChild(document.createTextNode('Time'));
    row.appendChild(cell);

    cell=document.createElement('th');
    cell.appendChild(document.createTextNode('State'));
    row.appendChild(cell);

    cell=document.createElement('th');
    cell.appendChild(document.createTextNode('Application'));
    row.appendChild(cell);

    cell=document.createElement('th');
    cell.appendChild(document.createTextNode('Message'));
    row.appendChild(cell);

    alarmBody.appendChild(row);

    var bAltRow=false;
    var iActive=0;

    for (i in alarmList) {
      var adv=alarmList[i];
      var advid=adv.advid.toString();

      row=document.createElement('tr');

      if (bAltRow) { row.className='altRow'; } else { row.className='normalRow'; }
      bAltRow=!bAltRow;

      if (!(adv.acked || adv.reset || adv.rtn)) {
        if (adv.alarm) { row.style.backgroundColor='#ff8080';}
        if (adv.notice) { row.style.backgroundColor='#ffffa0';}
        if (adv.fail) { row.style.backgroundColor='#ff8080';}
        iActive++;
      }

      var strState='';
      if (adv.alarm) { strState='ALARM'; }
      if (adv.notice) { strState='NOTICE';}
      if (adv.fail) { strState='FAIL';}
      if (adv.acked) { strState += '-ACK'; }
      if (adv.rtn) { strState = 'RTN-' + strState; } else if (adv.reset) { strState = 'RST-' + strState; }

      cell=document.createElement('td');
      cell.appendChild(document.createTextNode(advid));
      cell.style.display='none';
      row.appendChild(cell);

      cell=document.createElement('td');
      cell.style.whiteSpace='nowrap';
      cell.appendChild(document.createTextNode('\u00A0'+adv.timestamp.toString()+'\u00A0'));
      row.appendChild(cell);

      cell=document.createElement('td');
      cell.style.whiteSpace='nowrap';
      cell.appendChild(document.createTextNode('\u00A0'+strState+'\u00A0'));
      row.appendChild(cell);

      cell=document.createElement('td');
      cell.style.whiteSpace='nowrap';
      cell.appendChild(document.createTextNode('\u00A0'+adv.source.toString()+'\u00A0'));
      row.appendChild(cell);

      cell=document.createElement('td');
      cell.style.whiteSpace='nowrap';
      row.appendChild(cell);
      var a=document.createElement('a');
      a.appendChild(document.createTextNode('\u00A0'+adv.text.toString()+'\u00A0'));
      a.href='#';
      a.onclick=makeEventHandlerWithArg(_pageData.alarmMoreInfo, i);
      a.title='Click to view more information.';
      cell.appendChild(a);

      alarmBody.appendChild(row);
    }

    var iAlarmLength = alarmList.length;
    document.getElementById('advisoryActive').innerHTML = iActive.toString() + ' active advisor' + (iActive==1?'y.':'ies.');
    document.getElementById('advisoryTotal').innerHTML = iAlarmLength.toString() + ' total advisor' + (iAlarmLength==1?'y.':'ies.');

    var tablePlace=document.getElementById('alarmPlace');
    tablePlace.innerHTML='';
    tablePlace.appendChild(table);

    sizeContent();
    _pageData.timerId = setTimeout('_pageData.onupdate();',300000);
  },

  alarmMoreInfo:function(e, arg) {
    function insertRow(tBody, caption, value) {
      var tableRow = document.createElement('tr');
      var cell = document.createElement('td');
      cell.appendChild(document.createTextNode(caption));
      tableRow.appendChild(cell);
      cell = document.createElement('td');
      cell.style.width='10px';
      cell.appendChild(document.createTextNode('\u00A0'));
      tableRow.appendChild(cell);
      cell = document.createElement('td');
      cell.innerHTML=value;
      /*cell.appendChild(document.createTextNode(value));*/
      tableRow.appendChild(cell);
      tBody.appendChild(tableRow);
    }

    function insertBlankRow(tBody) {
      var tableRow = document.createElement('tr');
      var cell = document.createElement('td');
      cell.appendChild(document.createTextNode('\u00A0'));
      tableRow.appendChild(cell);
      cell = document.createElement('td');
      cell.appendChild(document.createTextNode('\u00A0'));
      tableRow.appendChild(cell);
      cell = document.createElement('td');
      cell.appendChild(document.createTextNode('\u00A0'));
      tableRow.appendChild(cell);
      tBody.appendChild(tableRow);
    }

    cancelBubble(e);
    var adv=_pageData.alarmList[arg];

    var table = document.createElement('table');
    table.id = 'alarmMoreInfo';
    var tBody = document.createElement('tBody');
    table.appendChild(tBody);

    try {
      var s = adv.source.split(':');
      insertRow(tBody, 'Application and Property:', s[1].trim()+':'+s[2].trim());
    } catch(err) {
      insertRow(tBody, 'Application and Property:', adv.source);
    }


    insertBlankRow(tBody);
    /*
    insertRow(tBody, 'Advisory Message:', adv.state + '\u00A0\u00A0' + adv.text);
    */
    insertRow(tBody, 'Advisory Message:', adv.text);
    insertBlankRow(tBody);

    var state='-';
    if (adv.acked) { state='Acknowledged'; }
    else if (adv.reset) { state='Reset'; }
    else if (adv.rtn) { state='Return to Normal'; }
    else if (adv.fail) { state='Failure'; }
    else if (adv.alarm) { state='Alarm'; }
    else if (adv.notice) { state='Notice'; }

    insertRow(tBody, 'Status:', '\'' + state + '\'');

    insertRow(tBody, 'Report Time:', '\'' + adv.timestamp.toString() + '\'');
    insertBlankRow(tBody);

    if (adv.reportvalue.trim() != '') {
      insertRow(tBody, 'Report Value:', adv.reportvalue + '\u00A0' + convertEngUnit(adv.engUnits));
      insertRow(tBody, 'Limit Exceeded:', adv.limit + '\u00A0' + convertEngUnit(adv.engUnits));
      insertBlankRow(tBody);
    }

    if (adv.rtn) {
      insertRow(tBody, 'Return to Normal:', '\'' + adv.rtntimestamp.toString() + '\'');
      insertBlankRow(tBody);
    }

    if (adv.acked) {
      insertRow(tBody, 'Acknowledge Status:', adv.ackuser + ' on \'' + adv.acktimestamp.toString() + '\'');
      insertBlankRow(tBody);
    }

    var width = 400;

    var elem = getEventTarget(e);
    elem = elem.parentNode;
    var elemX = findPosX(elem);
    var elemY = findPosY(elem);

    var offset = document.getElementById('dataContainer').scrollTop;

    var top = elemY + elem.offsetHeight - offset;
    var left = elemX + elem.offsetWidth - width;
    var popup = getPopup();
    popup.appendChild(table);

    var captionDiv = setPopupTitle('Advisory Detail');
    setPopupHelp('advDetail');

    showPopup(left.toString()+'px', top.toString()+'px', width.toString()+'px');
    showPopup(left.toString()+'px', top.toString()+'px', width.toString()+'px', (captionDiv.offsetHeight + document.getElementById('alarmMoreInfo').offsetHeight).toString()+'px');

    var popupWindowHeight=document.getElementById('popupInfo').offsetHeight;
    if (top + popupWindowHeight > document.body.offsetHeight) {
      top = elemY - popupWindowHeight - offset;
      showPopup(left.toString()+'px', top.toString()+'px');
    }

    ensurePopupVisible();
  }


}
</div>

<table cellpadding='0px' cellspacing='0px' style='width:100%;'>
  <tr >
    <td  id='dataContentRowWidth' class='dataContent'>
      <br>
      <div class='dataTitle'><span id='annunciatorTitle' style='display:none'>Annunciator&nbsp;</span><span id='advisoryTitle'>Advisories</span></div>
      <br>
    </td>
    <td class='dataHelp'>&nbsp;
    </td>
  </tr>

  <tr >
    <td  id='dataContentRowWidth' class='dataContent' align='center'>
      <span id='advisoryActive' ></span>&nbsp;&nbsp;<span id='advisoryTotal'></span>
    </td>
    <td class='dataHelp' rowspan='4'>
<br><span style='background-color:#ff8080;padding:0px 2px 0px 2px'>Alarms are highlighted in red.</span><br><br>
<span style='background-color:#ffffa0;padding:0px 2px 0px 2px'>Notices are highlighted yellow.</span><br><br>
When the color disappears, the Alarm or Notice has either been acknowledged by a user or has returned-to-normal on its own.<br><br>
The State column describes the advisory type, the current advisory state, and whether the advisory has been acknowledged. <a href='javascript:openMoreInfo("advState");'>More...</a><br><br>
Click on the message to open a pop-up window that contains advisory details.
    </td>
  </tr>

  <tr><td class='dataContent'>&nbsp;</td></tr>

  <tr id='advLog'>
    <td class='dataContent' id='alarmPlace' align='center'>
      <div><i>Loading Advisory Data...</i></div>
    </td>
  </tr>

  <tr><td class='dataContent'>&nbsp;</td></tr>

</table>
