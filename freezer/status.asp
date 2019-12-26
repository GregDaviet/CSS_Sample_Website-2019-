<div id='_pageData' style='display:none'>
{
  ctrl:'E2 Unit01',
  TimerId:null,
  callbackError: function(status) { },
  showHVAC:true,
  showRefrig:true,
  points:[  {prop:'E2 Unit01:.AI.01.01.01:2048', propCaption:'Unit 1A Temp', elemCaption:'captionTemp1A', elemData:'dataTemp1A', elemGraph:'graphTemp1A' },
                {prop:'E2 Unit01:.AI.01.01.02:2048', propCaption:'Unit 1B Temp', elemCaption:'captionTemp1B', elemData:'dataTemp1B', elemGraph:'graphTemp1B' },
                {prop:'E2 Unit01:UNIT 1A:2050', propCaption:'Compressor', elemCaption:'captionComp1A', elemData:'dataComp1A', elemGraph:'graphComp1A' },
                {prop:'E2 Unit01:UNIT 1B:2050', propCaption:'Compressor', elemCaption:'captionComp1B', elemData:'dataComp1B', elemGraph:'graphComp1B' },
                {prop:'E2 Unit01:.AI.01.02.02:2048', propCaption:'Unit 2A Temp', elemCaption:'captionTemp2A', elemData:'dataTemp2A', elemGraph:'graphTemp2A' },
                {prop:'E2 Unit01:.AI.01.02.01:2048', propCaption:'Unit 2B Temp', elemCaption:'captionTemp2B', elemData:'dataTemp2B', elemGraph:'graphTemp2B' },
                {prop:'E2 Unit01:UNIT 2A:2050', propCaption:'Compressor', elemCaption:'captionComp2A', elemData:'dataComp2A', elemGraph:'graphComp2A' },
                {prop:'E2 Unit01:UNIT 2B:2050', propCaption:'Compressor', elemCaption:'captionComp2B', elemData:'dataComp2B', elemGraph:'graphComp2B' },
                {prop:'E2 Unit01:ADVISORY SERV:2048', propCaption:'Unit Alarm', elemCaption:'captionUA', elemData:'dataUA', elemGraph:'graphUA' }
                ],

  contentWidth: function() {
    return document.getElementById('dataContentRowWidth').offsetWidth;
  },
  load: function() {
    var model='RX-400 ';

    if (model.indexOf('BX') >= 0) { this.showRefrig=false; }
    if (model.indexOf('RX') >= 0) { this.showHVAC=false; }

    if (this.showHVAC) {
    }
    if (this.showRefrig) {
    }

    var props = [];
    for (i in this.points) {
      props.push(this.points[i].prop);
    }
    getMultiPointInfo(_pageData.pointInfoSuccess, _pageData.callbackError, props);
  },
  unload:function() {
    clearInterval(this.TimerId);
  },

  onupdate:function() {
    var props = [];
    for (i in this.points) {
      props.push(this.points[i].prop);
    }
    getMultiExpandedStatus(_pageData.pointStatusSuccess, _pageData.callbackError, props);
  },

  getConfigValues:function() {
    getConfigValues(_pageData.configValuesSuccess, _pageData.callbackError, ['E2 Unit01:TIME SERVICES:7000', 'E2 Unit01:TIME SERVICES:7001']);
  },

  pointInfoSuccess:function(jsonData, obj) {
    function addGraphIcon(elem, arg) {
      if (elem) {
        var img=document.createElement('img');
        img.src='graph.gif';
        img.className='imageButton';
        img.title='Graph';
        img.onmousedown=makeEventHandlerWithArg(showGraph, arg);
        elem.appendChild(img);
      }
    }

    for (i in jsonData.result.data) {
      for (j in _pageData.points) {
        if (_pageData.points[j].prop == jsonData.result.data[i].prop) {
          document.getElementById(_pageData.points[j].elemCaption).innerHTML = _pageData.points[j].propCaption;
          if (jsonData.result.data[i].logAvailable) {
            addGraphIcon(document.getElementById(_pageData.points[j].elemGraph), _pageData.points[j]);
          }
        }
      }
    }

    setTimeout('_pageData.onupdate();',1);
    _pageData.TimerId = setInterval('_pageData.onupdate();',20000);
  },

  pointStatusSuccess:function(jsonData, obj) {
    for (i in jsonData.result.data) {
      var status=jsonData.result.data[i];
      for (j in _pageData.points) {
        if (_pageData.points[j].prop == status.prop) {
          var str=status.value.trim();
          if (status.dataType == 1) {
            str += '\u00A0' + convertEngUnit(status.engUnits);
          }
          var elem=document.getElementById(_pageData.points[j].elemData);
          if (elem) {
            setElementText(elem, str);
            if (status.alarm || status.fail) {
              elem.className='pointAlarm';
            } else if (status.override) {
              elem.className='pointOverride';
            } else {
              elem.className='';
            }
          }
        }
      }
    }

    _pageData.getConfigValues();
  },

  configValuesSuccess: function(jsonData, obj) {
    for (i in jsonData.result.list) {
      var status=jsonData.result.list[i];
      if (status.prop == 'E2 Unit01:TIME SERVICES:7000') {
        document.getElementById('siteTime').innerHTML = status.value;
      }
      if (status.prop == 'E2 Unit01:TIME SERVICES:7001') {
        document.getElementById('siteDate').innerHTML = status.value;
      }
    }
  }
}
</div>


<table cellpadding='0px' cellspacing='0px' style='width:100%'>
  <tr>
    <td  id='dataContentRowWidth' class='dataContent'>
      <br>
      <div class='dataTitle'>Controller Summary</div>
      <br>
    </td>
    <td class='dataHelp'>&nbsp;
    </td>
  </tr>

  <tr>
    <td class='dataContent'>
            <table class='statusTables' border='0' cellspacing='' cellpadding='0'>

      <!--
      ********* general status ****************************************************
      -->
              <tr>
                <th>
                  General Status
                </th>
              </tr>

              <tr>
                <td>
                  <table cellpadding='2px' cellspacing='0px' style='width:100%'>

                    <tr>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                    </tr>

                    <tr>
                      <td style='width:110px' id='captionTemp1A'></td>
                      <td style='width:70px' id='dataTemp1A'></td>
                      <td style='width:20px' id='graphTemp1A'></td>
                      <td style='width:110px' id='captionTemp1B'></td>
                      <td style='width:70px' id='dataTemp1B'></td>
                      <td style='width:20px' id='graphTemp1B'></td>
                    </tr>

                    <tr>
                      <td id='captionComp1A'></td>
                      <td id='dataComp1A'></td>
                      <td id='graphComp1A'></td>
                      <td id='captionComp1B'></td>
                      <td id='dataComp1B'></td>
                      <td id='graphComp1B'></td>
                    </tr>

                    <tr>
                      <td id='captionTemp2A'></td>
                      <td id='dataTemp2A'></td>
                      <td id='graphTemp2A'></td>
                      <td id='captionTemp2B'></td>
                      <td id='dataTemp2B'></td>
                      <td id='graphTemp2B'></td>
                    </tr>

                    <tr>
                      <td id='captionComp2A'></td>
                      <td id='dataComp2A'></td>
                      <td id='graphComp2A'></td>
                      <td id='captionComp2B'></td>
                      <td id='dataComp2B'></td>
                      <td id='graphComp2B'></td>
                    </tr>

                    <tr>
                      <td id='captionUA'></td>
                      <td id='dataUA'></td>
                      <td id='graphUA'></td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>

    </td>
    <td class='dataHelp'>
    <br>
      This is the status summary of information for this E2 controller.<br><br>
      Click on the graph icon to view a pop-up graph of the data points.
    </td>
  </tr>
  <tr><td class='dataContent'>&nbsp;</td></tr>
  <tr>
    <td class='dataContent'>
            <table class='statusTables' border='0' cellspacing='0' cellpadding='0'>
              <tr>
                <th>
                  System Information
                </th>
              </tr>

              <tr>
                <td>
                  <table cellpadding='2px' cellspacing='0px' style='width:100%'>

                    <tr>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                    </tr>

                    <tr>
                      <td style='width:20%;white-space:nowrap'>Model/Series:</td>
                      <td style='width:30%;white-space:nowrap'>RX-400  </td>
                      <td style='width:20%;white-space:nowrap'>Site Name:</td>
                      <td style='width:30%;white-space:nowrap'>DIXIE FARMS </td>
                    </tr>

                    <tr>
                      <td>IP Address:</td>
                      <td>192.168.20.151 </td>
                      <td>Phone Number:</td>
                      <td> </td>
                    </tr>

                    <tr>
                      <td>Revision:</td>
                      <td> 4.09F04 </td>
                      <td>Date:</td>
                      <td id='siteDate'>12-21-19</td>
                    </tr>

                    <tr>
                      <td>Client Port:</td>
                      <td>1025</td>
                      <td>Time:</td>
                      <td id='siteTime'>6:43:33</td>
                    </tr>

                    <tr>
                      <td>Unit Subnet:</td>
                      <td>1</td>
                      <td> &nbsp; </td>
                      <td> &nbsp; </td>
                    </tr>

                  </table>
                </td>
              </tr>

            </table>
    </td>
    <td class='dataHelp'>
    <br>
      This is general system information for this E2 controller.
    </td>
  </tr>

  <tr><td class='dataContent'>&nbsp;</td><td class='dataHelp'>&nbsp;</td></tr>
  <tr><td class='dataContent'>&nbsp;</td><td class='dataHelp'>&nbsp;</td></tr>
  <tr><td class='dataContent'>&nbsp;</td><td class='dataHelp' align='right'><img src='gawslogo.gif'></td></tr>
</table>

