<div id='_pageData' style='display:none'>
{
  ctrl:'E2 Unit01',
  TimerId:null,
  callbackError: function(status) { },
  showHVAC:true,
  showRefrig:true,
  points:[  {prop:'E2 Unit01:CTRL-TEMP:2048', propCaption:'Control Temp', elemCaption:'captionCTRL-TEMP', elemData:'dataCTRL-TEMP', elemGraph:'graphCTRL-TEMP' },
                {prop:'E2 Unit01:1A-FAN:COMMAND OUT', propCaption:'Fan', elemCaption:'captionFan1A', elemData:'dataFan1A', elemGraph:'graphFan1A' },
                {prop:'E2 Unit01:1B-FAN:COMMAND OUT', propCaption:'Fan', elemCaption:'captionFan1B', elemData:'dataFan1B', elemGraph:'graphFan1B' },
                {prop:'E2 Unit01:2A-FAN:COMMAND OUT', propCaption:'Fan', elemCaption:'captionFan2A', elemData:'dataFan2A', elemGraph:'graphFan2A' },
                {prop:'E2 Unit01:2B-FAN:COMMAND OUT', propCaption:'Fan', elemCaption:'captionFan2B', elemData:'dataFan2B', elemGraph:'graphFan2B' },
                {prop:'E2 Unit01:1A-LLS:COMMAND OUT', propCaption:'Refrig', elemCaption:'captionRefrig1A', elemData:'dataRefrig1A', elemGraph:'graphRefrig1A' },
                {prop:'E2 Unit01:1B-LLS:COMMAND OUT', propCaption:'Refrig', elemCaption:'captionRefrig1B', elemData:'dataRefrig1B', elemGraph:'graphRefrig1B' },
                {prop:'E2 Unit01:2A-LLS:COMMAND OUT', propCaption:'Refrig', elemCaption:'captionRefrig2A', elemData:'dataRefrig2A', elemGraph:'graphRefrig2A' },
                {prop:'E2 Unit01:2B-LLS:COMMAND OUT', propCaption:'Refrig', elemCaption:'captionRefrig2B', elemData:'dataRefrig2B', elemGraph:'graphRefrig2B' },
                {prop:'E2 Unit01:DEFROST-1A:COMMAND OUT', propCaption:'Defrost', elemCaption:'captionDefrost1A', elemData:'dataDefrost1A', elemGraph:'graphDefrost1A' },
                {prop:'E2 Unit01:DEFROST-1B:COMMAND OUT', propCaption:'Defrost', elemCaption:'captionDefrost1B', elemData:'dataDefrost1B', elemGraph:'graphDefrost1B' },
                {prop:'E2 Unit01:DEFROST-2A:COMMAND OUT', propCaption:'Defrost', elemCaption:'captionDefrost2A', elemData:'dataDefrost2A', elemGraph:'graphDefrost2A' },
                {prop:'E2 Unit01:DEFROST-2B:COMMAND OUT', propCaption:'Defrost', elemCaption:'captionDefrost2B', elemData:'dataDefrost2B', elemGraph:'graphDefrost2B' },
                {prop:'E2 Unit01:ADVISORY SERV:2048', propCaption:'Unit Alarm', elemCaption:'captionUA', elemData:'dataUA' },
                {prop:'E2 Unit01:TIME SERVICES:7000', propCaption:'Time:', elemCaption:'captionSiteTime', elemData:'dataSiteTime' },
                {prop:'E2 Unit01:TIME SERVICES:7001', propCaption:'Date:', elemCaption:'captionSiteDate', elemData:'dataSiteDate' }
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
      <div class='dataTitle' id='captionCTRL-TEMP'></div>
      <br>
      <div style="font-size:large; text-align:center;" id='dataCTRL-TEMP'></div>
      <br>
      <div style="text-align:center;" id='graphCTRL-TEMP'></div>
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
                      <td style='width:110px'>Unit 1A</td>
                      <td style='width:70px'>&nbsp;</td>
                      <td style='width:20px'>&nbsp;</td>
                      <td style='width:110px'>Unit 1B</td>
                      <td style='width:70px'>&nbsp;</td>
                      <td style='width:20px'>&nbsp;</td>
                    </tr>

                    <tr>
                      <td style='text-align:right' id='captionFan1A'></td>
                      <td id='dataFan1A'></td>
                      <td id='graphFan1A'></td>
                      <td style='text-align:right' id='captionFan1B'></td>
                      <td id='dataFan1B'></td>
                      <td id='graphFan1B'></td>
                    </tr>

                    <tr>
                      <td style='text-align:right' id='captionRefrig1A'></td>
                      <td id='dataRefrig1A'></td>
                      <td id='graphRefrig1A'></td>
                      <td style='text-align:right' id='captionRefrig1B'></td>
                      <td id='dataRefrig1B'></td>
                      <td id='graphRefrig1B'></td>
                    </tr>

                    <tr>
                      <td style='text-align:right' id='captionDefrost1A'></td>
                      <td id='dataDefrost1A'></td>
                      <td id='graphDefrost1A'></td>
                      <td style='text-align:right' id='captionDefrost1B'></td>
                      <td id='dataDefrost1B'></td>
                      <td id='graphDefrost1B'></td>
                    </tr>

                    <tr>
                      <td style='width:110px'>Unit 2A</td>
                      <td style='width:70px'>&nbsp;</td>
                      <td style='width:20px'>&nbsp;</td>
                      <td style='width:110px'>Unit 2B</td>
                      <td style='width:70px'>&nbsp;</td>
                      <td style='width:20px'>&nbsp;</td>
                    </tr>

                    <tr>
                      <td style='text-align:right' id='captionFan2A'></td>
                      <td id='dataFan2A'></td>
                      <td id='graphFan2A'></td>
                      <td style='text-align:right' id='captionFan2B'></td>
                      <td id='dataFan2B'></td>
                      <td id='graphFan2B'></td>
                    </tr>

                    <tr>
                      <td style='text-align:right' id='captionRefrig2A'></td>
                      <td id='dataRefrig2A'></td>
                      <td id='graphRefrig2A'></td>
                      <td style='text-align:right' id='captionRefrig2B'></td>
                      <td id='dataRefrig2B'></td>
                      <td id='graphRefrig2B'></td>
                    </tr>

                    <tr>
                      <td style='text-align:right' id='captionDefrost2A'></td>
                      <td id='dataDefrost2A'></td>
                      <td id='graphDefrost2A'></td>
                      <td style='text-align:right' id='captionDefrost2B'></td>
                      <td id='dataDefrost2B'></td>
                      <td id='graphDefrost2B'></td>
                    </tr>

                    <tr>
                      <td id='captionUA'></td>
                    </tr>

                    <tr>
                      <td id='dataUA'></td>
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
                      <td style='width:30%;white-space:nowrap'>Dixe Ranch Inc </td>
                    </tr>

                    <tr>
                      <td>IP Address:</td>
                      <td>192.168.20.151 </td>
                      <td>Phone Number:</td>
                      <td>575-201-3069</td>
                    </tr>

                    <tr>
                      <td>Revision:</td>
                      <td> 4.09F04 </td>
                      <td id='captionSiteDate'></td>
                      <td id='dataSiteDate'></td>
                    </tr>

                    <tr>
                      <td>Client Port:</td>
                      <td>1025</td>
                      <td id='captionSiteTime'></td>
                      <td id='dataSiteTime'></td>
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

