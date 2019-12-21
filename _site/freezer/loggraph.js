function findElementPosition(param) {
    var x = 0, y = 0;
    var obj = (typeof param == "string") ? document.getElementById(param) : param;
    if (obj) {
        x = obj.offsetLeft;
        y = obj.offsetTop;
        var body = document.getElementsByTagName('body')[0];
        while (obj.offsetParent && obj!=body) {
            x += obj.offsetParent.offsetLeft;
            y += obj.offsetParent.offsetTop;
            obj = obj.offsetParent;
        }
    }
    this.x = x;
    this.y = y;
}

/*
TODO:
3.  Handle situation where sample sizes are much greater than time increments on the x axis.
5.  Handle nones better in digitals
8.  Handle point crossover from clipped to unclipped.
9.  Optimize x calculations by creating incremental floats
*/


function LogGraph(param) {

    this._mainElement = (typeof param == "string") ? document.getElementById(param) : param;

    // The eu and position div
    var table=document.createElement('table');
    this._mainElement.appendChild(table);
    var tbody=document.createElement('tbody');
    table.appendChild(tbody);
    var tr=document.createElement('tr');
    tbody.appendChild(tr);

    this._euAndPosElement = document.createElement("td");
    tr.appendChild(this._euAndPosElement);
    this._euAndPosElement.style.width='99%';
    this._euAndPosElement.style.whiteSpace = "nowrap";

    // Create button bar
    var buttonBar = document.createElement("td");
    tr.appendChild(buttonBar);
    buttonBar.style.width='1%';
    buttonBar.style.whiteSpace = "nowrap";
    this._zoomPreviousElement = document.createElement("input");
    this._zoomPreviousElement.setAttribute("type", "button");
    this._zoomPreviousElement.className = "graphButton";
    this._zoomPreviousElement.value = "Previous";
    buttonBar.appendChild(this._zoomPreviousElement);
    this._zoomPreviousElement.onclick = makeObjectEventHandler(this, '_onZoomPreviousClick');

    // Spacer
    buttonBar.appendChild(document.createTextNode(" "));

    this._zoomFullElement = document.createElement("input");
    this._zoomFullElement.setAttribute("type", "button");
    this._zoomFullElement.className = "graphButton";
    this._zoomFullElement.value = "Full";
    buttonBar.appendChild(this._zoomFullElement);
    this._zoomFullElement.onclick = makeObjectEventHandler(this, '_onZoomFullClick');

    // The graph div
    this._graphElement = document.createElement("div");
    this._graphElement.id = this._mainElement.id + "_graph";
    this._graphElement.style.position = "relative";
    this._graphElement.style.margin = "0px";
    this._graphElement.style.border = "0px";
    this._graphElement.style.width = this._mainElement.offsetWidth.toString() + "px";
    this._graphElement.style.height = (this._mainElement.offsetHeight - table.offsetHeight).toString() + "px";
    this._mainElement.appendChild(this._graphElement);

    this._graphElement.onmousedown = makeObjectEventHandler(this, '_onGraphMouseDown');
    this._graphElement.onmouseup = makeObjectEventHandler(this, '_onGraphMouseUp');

    this._jg = new jsGraphics(this._graphElement.id);

    // Graph mouse handling
    this._xGraphMouseElement = 0;
    this._yGraphMouseElement = 0;
    this._xGraphMouseDown = 0;
    this._yGraphMouseDown = 0;
    this._bGraphMouseDragging = false;

    // Full scale X lower and upper are samples 0 to arrayData.length
    this._yFullUpper = 100;
    this._yFullLower = 0;

    // This is the current zoom in terms of the data
    this._zoomHistory = new Array;

    // This is that data view port in terms of pixels
    this._xViewUpper = 0;
    this._xViewLower = 0;
    this._yViewUpper = 0;
    this._yViewLower = 0;

    this._sampleIndex = 0;

    this.graphMouseSensitivity = 3;

    this.fontFamily = "arial";
    this.axisColor = "black";
    this.gridColor = "#E0E0E0";
    this.textColor = "black";
    this.dataColor = "#00A000";
    this.dragColor = "blue";
    this.sampleColor = "orange";
    this.errorColor = "red";

    this.engUnits = "";
    this.digital = false;
    this.sampleInterval = 15;

    if (typeof LogGraph._initialized == "undefined") {
        LogGraph.prototype.destroy = function() {
            this._zoomPreviousElement.onclick=null;
            this._zoomFullElement.onclick=null;
            this._graphElement.onmousedown=null;
            this._graphElement.onmouseup=null;
            this._graphElement.onmousemove=null;
        }

        LogGraph.prototype._getDateString = function(date, bIncludeYear) {
            return (date.getUTCMonth() + 1).toString() + "-" + date.getUTCDate().toString()
                + ((bIncludeYear) ? "-" + date.getUTCFullYear().toString() : "");
        }

        LogGraph.prototype._getTimeString = function(date, bIncludeSec) {
            var min = date.getUTCMinutes();
            if (min < 10)
                min = "0" + min.toString();
            else
                min=min.toString();

            if (bIncludeSec) {
                var sec = date.getUTCSeconds();
                if (sec < 10)
                    sec = "0" + sec.toString();
                else
                    sec=sec.toString();
                return date.getUTCHours() .toString() + ":" + min + ":" + sec;
            }
            return date.getUTCHours() .toString() + ":" + min;
        }

        LogGraph.prototype._getDateTimeString = function(date) {
            return this._getDateString(date, true) + " " + this._getTimeString(date, true);
            data.timestamp.toUTCString();
        }

        LogGraph.prototype._updateDragElement = function(x1, y1, x2, y2) {
            var xUpper;
            var xLower;
            var yUpper;
            var yLower;

            // Reorder the input range
            if (x1 > x2) {
                xUpper = x1;
                xLower = x2;
            } else {
                xUpper = x2;
                xLower = x1;
            }

            if (y1 > y2) {
                yUpper = y2;
                yLower = y1;
            } else {
                yUpper = y1;
                yLower = y2;
            }

            // Validate the mouse input
            if (xLower < this._xViewLower)
                xLower = this._xViewLower;
            if (xUpper > this._xViewUpper)
                xUpper = this._xViewUpper;

            if (yLower > this._yViewLower)
                yLower = this._yViewLower;
            if (yUpper < this._yViewUpper)
                yUpper = this._yViewUpper;

            var strId = this._graphElement.id + "_drag";
            var oD = document.getElementById(strId);
            if (oD == null) {
                oD = document.createElement("div");
                oD.id = strId;
                this._graphElement.appendChild(oD);
                oD.style.position = "absolute";
                oD.style.border = "1px solid " + this.dragColor;
            }

            oD.style.left = xLower.toString() + "px";
            oD.style.top = yUpper.toString() + "px";
            oD.style.width = (xUpper - xLower).toString() + "px";
            oD.style.height = (yLower - yUpper).toString() + "px";
        }

        LogGraph.prototype._removeDragElement = function() {
            var strId = this._graphElement.id + "_drag";
            var oD = document.getElementById(strId);
            if (oD != null)
                this._graphElement.removeChild(oD);
        }

        LogGraph.prototype._updateSampleElement = function(x, y1, y2) {
            var strId = this._graphElement.id + "_sample";
            var oS = document.getElementById(strId);
            if (oS == null) {
                oS = document.createElement("div");
                oS.id = strId;
                this._graphElement.appendChild(oS);
                oS.style.position = "absolute";
                oS.style.backgroundColor = this.sampleColor;
                oS.style.width = "1px";
            }
            if (isNaN(x)) x=this._xViewLower;
            oS.style.left = x + "px";
            oS.style.top = y1.toString() + "px";
            oS.style.height = (y2 - y1).toString() + "px";
        }

        LogGraph.prototype._displaySampleData = function(index) {
          if (typeof this._arrData != "undefined") {
            var data = this._arrData[index];
            if (this.digital) {
                var strDigitalEu = this.engUnits.split("\u002f");
                this._euAndPosElement.innerHTML =  (data.value > 0 ? strDigitalEu[0] : strDigitalEu[1]) + ",  " + this._getDateTimeString(data.timestamp);
            } else{
                var value = "Invalid"
                if (!isNaN(data.value)) {
                    var scaleFixed;
                    if (data.value > 10)
                        scaleFixed = 1;
                    else if (data.value > 1)
                        scaleFixed = 2;
                    else if (data.value > 0.1)
                        scaleFixed = 3;
                    else
                        scaleFixed = 4;
                    value = data.value.toFixed(scaleFixed);
                }
                this._euAndPosElement.innerHTML = value + " " + this.engUnits + ",  " + this._getDateTimeString(data.timestamp);
            }
          }
        }

        LogGraph.prototype._moveSample = function (index) {
            if (typeof this._arrData != "undefined") {

                if (index >= this._arrData.length)
                    index = this._arrData.length - 1;

                if (index < 0)
                    index = 0;

                this._sampleIndex = index;

                var iZoomLast = this._zoomHistory.length - 1;
                var xZoomRange = this._zoomHistory[iZoomLast]._xZoomUpper - this._zoomHistory[iZoomLast]._xZoomLower;
                var xHalfZoomRange = Math.round(xZoomRange / 2);

                if (index < this._zoomHistory[iZoomLast]._xZoomLower) {
                    var zoom = new Object();
                    zoom._xZoomLower = index - xHalfZoomRange;
                    zoom._xZoomUpper = index + xHalfZoomRange;
                    zoom._yZoomLower = this._zoomHistory[iZoomLast]._yZoomLower;
                    zoom._yZoomUpper = this._zoomHistory[iZoomLast]._yZoomUpper;

                    if (zoom._xZoomLower < 0) {
                        zoom._xZoomLower = 0;
                        zoom._xZoomUpper = xZoomRange;
                    }
                    this._zoomHistory.push(zoom);

                    this.draw();
                } else if (index > this._zoomHistory[iZoomLast]._xZoomUpper) {
                    var zoom = new Object();
                    zoom._xZoomLower = index - xHalfZoomRange;
                    zoom._xZoomUpper = index + xHalfZoomRange;
                    zoom._yZoomLower = this._zoomHistory[iZoomLast]._yZoomLower;
                    zoom._yZoomUpper = this._zoomHistory[iZoomLast]._yZoomUpper;

                    if (zoom._xZoomUpper >= this._arrData.length) {
                        zoom._xZoomUpper = this._arrData.length - 1;
                        zoom._xZoomLower = zoom._xZoomUpper - xZoomRange;
                    }
                    this._zoomHistory.push(zoom);

                    this.draw();
                } else {
                    var xViewRange = this._xViewUpper - this._xViewLower;
                    x = Math.floor(this._xViewLower + (xViewRange * (index - this._zoomHistory[iZoomLast]._xZoomLower) / xZoomRange));
                    this._displaySampleData(index);
                    this._updateSampleElement(x, this._yViewUpper,  this._yViewLower);
                }
            }
        }

        LogGraph.prototype.moveSampleHome = function() {
            this._moveSample(0);
        }

        LogGraph.prototype.moveSampleEnd = function() {
            this._moveSample(this._arrData.length - 1);
        }

        LogGraph.prototype.moveZoomSampleHome = function() {
            this._moveSample(this._zoomHistory[this._zoomHistory.length - 1]._xZoomLower);
        }

        LogGraph.prototype.moveZoomSampleEnd = function() {
            this._moveSample(this._zoomHistory[this._zoomHistory.length - 1]._xZoomUpper);
        }

        LogGraph.prototype.moveSampleLeft = function() {
            this._moveSample(this._sampleIndex - 1);
        }

        LogGraph.prototype.moveSampleRight = function() {
            this._moveSample(this._sampleIndex + 1);
        }

        LogGraph.prototype.moveSamplePageLeft = function() {
            var iZoomLast = this._zoomHistory.length - 1;
            var xZoomRange = this._zoomHistory[iZoomLast]._xZoomUpper - this._zoomHistory[iZoomLast]._xZoomLower;
            this._moveSample(this._sampleIndex - xZoomRange);
        }

        LogGraph.prototype.moveSamplePageRight = function() {
            var iZoomLast = this._zoomHistory.length - 1;
            var xZoomRange = this._zoomHistory[iZoomLast]._xZoomUpper - this._zoomHistory[iZoomLast]._xZoomLower;
            this._moveSample(this._sampleIndex + xZoomRange);
        }

        LogGraph.prototype._onGraphMouseDown = function(oEvent) {
            cancelBubble(oEvent);
            if (this._bGraphMouseDragging) {
                this._bGraphMouseDragging = false;
                this._graphElement.onmousemove = null;
                this._removeDragElement();
            }

            var pos = new findElementPosition(this._graphElement);
            this._xGraphMouseElement = pos.x - 1;
            this._yGraphMouseElement = pos.y - 1;

            if (oEvent.pageX) {
                this._xGraphMouseDown = oEvent.pageX - pos.x - 1;
                this._yGraphMouseDown = oEvent.pageY - pos.y - 1;
            } else if (oEvent.clientX) {
                this._xGraphMouseDown = oEvent.clientX + document.body.scrollLeft - pos.x - 3;
                this._yGraphMouseDown = oEvent.clientY + document.body.scrollTop - pos.y - 3;
            }

            if ((this._xGraphMouseDown < this._xViewLower) || (this._xGraphMouseDown > this._xViewUpper))
                return false;
            if ((this._yGraphMouseDown > this._yViewLower) || (this._yGraphMouseDown < this._yViewUpper))
                return false;

            if (typeof this._arrData != "undefined") {
                var iZoomLast = this._zoomHistory.length - 1;
                var xViewRange = this._xViewUpper - this._xViewLower;
                var xZoomRange = this._zoomHistory[iZoomLast]._xZoomUpper - this._zoomHistory[iZoomLast]._xZoomLower;

                var index = Math.round((((this._xGraphMouseDown - this._xViewLower) / xViewRange) * xZoomRange) + this._zoomHistory[iZoomLast]._xZoomLower);
                if ((index < this._arrData.length) && (index >= 0)) {
                    this._sampleIndex = index;
                    x = Math.floor(this._xViewLower + (xViewRange * (index - this._zoomHistory[iZoomLast]._xZoomLower) / xZoomRange));
                    this._displaySampleData(index);
                    this._updateSampleElement(x, this._yViewUpper,  this._yViewLower);
                }
            }

            this._graphElement.onmousemove = makeObjectEventHandler(this, '_onGraphMouseMove');
        }

        LogGraph.prototype._onGraphMouseMove = function(oEvent) {
            cancelBubble(oEvent);
            var xPos;
            var yPos;

            if (oEvent.pageX) {
                xPos = oEvent.pageX - this._xGraphMouseElement - 1;
                yPos = oEvent.pageY - this._yGraphMouseElement - 1;
            } else if (oEvent.clientX) {
                xPos = oEvent.clientX + document.body.scrollLeft - this._xGraphMouseElement - 3;
                yPos = oEvent.clientY + document.body.scrollTop - this._yGraphMouseElement - 3;
            }

            if ((Math.abs(xPos - this._xGraphMouseDown) > this.graphMouseSensitivity) &&
                (Math.abs(yPos - this._yGraphMouseDown) > this.graphMouseSensitivity)) {
                this._bGraphMouseDragging = true;
            }

            if (this._bGraphMouseDragging) {
                this._updateDragElement(this._xGraphMouseDown, this._yGraphMouseDown, xPos, yPos);
            }

            // This works for IE only
            if (oEvent.srcElement) {
                if (oEvent.button == 0) {
                    this._bGraphMouseDragging = false;
                    this._graphElement.onmousemove = null;
                    this._removeDragElement();
                }
            }

            return false;
        }

        LogGraph.prototype._onGraphMouseUp = function(oEvent) {
            cancelBubble(oEvent);
            var xPos;
            var yPos;

            if (oEvent.pageX) {
                xPos = oEvent.pageX - this._xGraphMouseElement - 1;
                yPos = oEvent.pageY - this._yGraphMouseElement - 1;
            } else if (oEvent.clientX) {
                xPos = oEvent.clientX + document.body.scrollLeft - this._xGraphMouseElement - 3;
                yPos = oEvent.clientY + document.body.scrollTop - this._yGraphMouseElement - 3;
            }

            if (this._bGraphMouseDragging) {
                this.zoomIn(this._xGraphMouseDown, this._yGraphMouseDown, xPos, yPos);
                this.draw();
            }
            this._bGraphMouseDragging = false;
            this._graphElement.onmousemove = null;
        }

        LogGraph.prototype._onZoomPreviousClick = function(oEvent) {
            cancelBubble(oEvent);
            this.zoomPrevious();
            this.draw();
        }

        LogGraph.prototype._onZoomFullClick = function(oEvent) {
            cancelBubble(oEvent);
            this.zoomFull();
            this.draw();
        }

        LogGraph.prototype.zoomIn = function(x1, y1, x2, y2) {
            if (typeof this._arrData != "undefined") {
                var xUpper;
                var xLower;
                var yUpper;
                var yLower;

                // Reorder the input range
                if (x1 > x2) {
                    xUpper = x1;
                    xLower = x2;
                } else {
                    xUpper = x2;
                    xLower = x1;
                }

                if (y1 > y2) {
                    yUpper = y2;
                    yLower = y1;
                } else {
                    yUpper = y1;
                    yLower = y2;
                }

                // Validate the mouse input
                if (xLower < this._xViewLower)
                    xLower = this._xViewLower;
                if (xUpper > this._xViewUpper)
                    xUpper = this._xViewUpper;

                if (yLower > this._yViewLower)
                    yLower = this._yViewLower;
                if (yUpper < this._yViewUpper)
                    yUpper = this._yViewUpper;

                xUpper -= this._xViewLower;
                xLower -= this._xViewLower;
                yUpper -= this._yViewUpper;
                yLower -= this._yViewUpper;

                var iZoomLast = this._zoomHistory.length - 1;
                var xViewRange = this._xViewUpper - this._xViewLower;
                var yViewRange = this._yViewLower - this._yViewUpper;
                var xZoomRange = this._zoomHistory[iZoomLast]._xZoomUpper - this._zoomHistory[iZoomLast]._xZoomLower;
                var yZoomRange = this._zoomHistory[iZoomLast]._yZoomUpper - this._zoomHistory[iZoomLast]._yZoomLower;

                var zoom = new Object();
                zoom._xZoomUpper = Math.floor(((xUpper / xViewRange) * xZoomRange) + this._zoomHistory[iZoomLast]._xZoomLower);
                zoom._xZoomLower = Math.floor(((xLower / xViewRange) * xZoomRange) + this._zoomHistory[iZoomLast]._xZoomLower);
                zoom._yZoomUpper = ((yViewRange - yUpper) / yViewRange * yZoomRange) + this._zoomHistory[iZoomLast]._yZoomLower;
                zoom._yZoomLower = ((yViewRange - yLower) / yViewRange * yZoomRange) + this._zoomHistory[iZoomLast]._yZoomLower;

                if ((this._xZoomUpper - this._xZoomLower) < 2) {
                    zoom._xZoomUpper++;
                    zoom._xZoomLower--;
                    if (zoom._xZoomUpper > this._xFullUpper) {
                        zoom._xZoomUpper = this._xFullUpper;
                        zoom._xZoomLower--;
                    }

                    if (zoom._xZoomLower < this._xFullLower) {
                        zoom._xZoomLower = this._xFullLower
                        zoom._xZoomUpper++;
                    }
                }

                this._zoomHistory.push(zoom);

                this._sampleIndex = Math.round(((zoom._xZoomUpper - zoom._xZoomLower) / 2) + zoom._xZoomLower);
            }
        }

        LogGraph.prototype.zoomFull = function() {

            if (typeof this._arrData != "undefined") {
                var zoom = new Object();
                zoom._xZoomUpper = this._arrData.length;
                zoom._xZoomLower = 0;
                zoom._yZoomUpper = this._yFullUpper;
                zoom._yZoomLower = this._yFullLower;

                this._zoomHistory = new Array;
                this._zoomHistory.push(zoom);

                this._sampleIndex = Math.round(((zoom._xZoomUpper - zoom._xZoomLower) / 2) + zoom._xZoomLower);
            }
        }

        LogGraph.prototype.zoomPrevious = function() {
            if (this._zoomHistory.length > 1) {
                this._zoomHistory.pop();
                return true;
            }
            return false;
        }

        LogGraph.prototype.isZoomedFull = function() {
            return (this._zoomHistory.length <= 1) ? true : false;
        }

        LogGraph.prototype.dataArray = function(arrData) {
            // Need to go through the array and determine the extents
            var lenData = arrData.length;
            var value;
            var strDigitalEu;
            var epoch = new Date(Date.UTC(1988, 2, 6));   // March 6, 1988
            var dtPrev = new Date();
            var msInterval = this.sampleInterval * 1000;

            if (this.digital == true)
                strDigitalEu = this.engUnits.split("\u002f");

            this._arrData = new Array(lenData);

            for (var i = 0; i < lenData; i++) {
                var sample = arrData[lenData - i - 1];

                if (this.digital == true) {
                    value = (sample.value == strDigitalEu[0] ? 1 : 0);
                } else {
                    value = parseFloat(sample.value);
                    if (!isNaN(value)) {
                        if (i == 0) {
                            this._yFullUpper = value;
                            this._yFullLower = value;
                        } else {
                            if (this._yFullUpper < value)
                                this._yFullUpper = value;
                            if (this._yFullLower > value)
                                this._yFullLower = value;
                        }
                    }
                }

                var oNew = new Object();
                oNew.value = value;
                oNew.timestamp = new Date(epoch.getTime() + (((sample.date * 86400) + sample.time) * 1000));
                oNew.bGap = false;
                if (i > 0) {
                    if (dtPrev.getUTCDate() == oNew.timestamp.getUTCDate()) {
                        if (Math.abs((dtPrev.getTime() + msInterval) - oNew.timestamp.getTime()) > 3000)
                            oNew.bGap = true;
                    }
                }

                dtPrev.setTime(oNew.timestamp.getTime());
                this._arrData[i] = oNew;
            }


            if (this.digital == false) {
                var yFullRangeExtent = (this._yFullUpper - this._yFullLower) * 0.1;
                if (yFullRangeExtent == 0) { yFullRangeExtent = this._yFullUpper * 0.1; }
                this._yFullUpper += yFullRangeExtent;
                this._yFullLower -= yFullRangeExtent;
            }

            this.zoomFull();
        }

        LogGraph.prototype.draw = function() {

            this._zoomPreviousElement.disabled = this.isZoomedFull();
            this._zoomFullElement.disabled = this.isZoomedFull();

            var height = this._graphElement.offsetHeight;
            var width = this._graphElement.offsetWidth;

            if ((height < 50) || (width < 100))
                return;

            var pointSize = Math.round(((height * 0.03) + (width * 0.03)) / 2)
            var halfPointSize = pointSize / 2;

            var borderWidth = Math.round(width * 0.07);

            // This is here to make the looping go much faster.  About 3 to 1
            var xViewLower = borderWidth;
            var xViewUpper = width - borderWidth;
            var yViewLower = height - (2 * pointSize);
            var yViewUpper = 0;

            this._yViewUpper = yViewUpper;
            this._yViewLower = yViewLower;
            this._xViewLower = xViewLower;
            this._xViewUpper = xViewUpper;

            var iZoomLast = this._zoomHistory.length - 1;
            var xZoomLower = this._zoomHistory[iZoomLast]._xZoomLower;
            var xZoomUpper = this._zoomHistory[iZoomLast]._xZoomUpper;
            var yZoomLower = this._zoomHistory[iZoomLast]._yZoomLower;
            var yZoomUpper = this._zoomHistory[iZoomLast]._yZoomUpper;

            // Clear previous display
            this._jg.clear();

            // Setup the font
            this._jg.setFont(this.fontFamily, pointSize.toString() + "px", Font.PLAIN);

            // Show the eu text
            this._euAndPosElement.style.fontFamily = this.fontFamily;
            this._euAndPosElement.style.fontSize = pointSize.toString() + "px";
            this._euAndPosElement.style.color = this.textColor;
            this._euAndPosElement.innerHTML = this.engUnits;

            // Show the data
            if (typeof this._arrData != "undefined") {

                var xViewRange = xViewUpper - xViewLower;
                var yViewRange = yViewLower - yViewUpper;  // This is because 0, 0 is the upper left
                var xZoomRange = xZoomUpper - xZoomLower;
                var yZoomRange = yZoomUpper - yZoomLower;

                // Draw the x axis scale
                var xScaleIncr = xZoomRange * this.sampleInterval;
                if ((xViewRange / pointSize) > 35) {
                    xScaleIncr /= 5;
                } else {
                    xScaleIncr /= 3;
                }

                // First step, figure out the highest possible unit that will still be under the desired ticks
                var finalTimeIncr = 0;
                var timeIncr;

                // First seconds, hours, minutes
                if (finalTimeIncr == 0) {
                    var arrTimeIncr = [15, 30, 60, 120, 300, 600, 1200, 1800, 3600, 7200, 10800, 14400, 21600, 43200];
                    while (arrTimeIncr.length > 0) {
                        timeIncr = arrTimeIncr.shift();
                        if (xScaleIncr < timeIncr) {
                            finalTimeIncr = timeIncr * 1000;
                            break;
                        }
                    }
                    arrTimeIncr = null;
                }

                // Then days
                if (finalTimeIncr == 0) {
                    timeIncr = 86400;
                    while (xScaleIncr > timeIncr) { timeIncr *= 2; }
                    finalTimeIncr = timeIncr * 1000;
                }

                var x;
                var y;
                var xPrev;
                var yPrev;
                var yTop;
                var yBottom;

                var sampleIntervalMs = (this.sampleInterval * 1000);
                var bIncludeSec = (finalTimeIncr < 60000) ? true : false;
                var textWidth = pointSize * 6;
                var bDrawDate = true;

                xPrev = xViewLower;

                var data;
                var dataPrev = this._arrData[xZoomLower];
                var dtTick = new Date(Date.UTC(dataPrev.timestamp.getUTCFullYear(), dataPrev.timestamp.getUTCMonth(), dataPrev.timestamp.getDate()));
                while (dtTick <= dataPrev.timestamp.getTime())
                    dtTick.setTime(dtTick.getTime() + finalTimeIncr);

                for (var i = xZoomLower + 1; i < xZoomUpper; i++) {

                    data = this._arrData[i];
                    x = Math.floor(xViewLower + (xViewRange * (i - xZoomLower) / xZoomRange));

                    // Checking for gaps
                    if (data.bGap) {
                        if (dtTick.getUTCDate() != data.timestamp.getUTCDate())
                            bDrawDate = true;
                        dtTick = new Date(Date.UTC(data.timestamp.getUTCFullYear(), data.timestamp.getUTCMonth(), data.timestamp.getDate()));
                        while (dtTick.getTime() < data.timestamp.getTime())
                            dtTick.setTime(dtTick.getTime() + finalTimeIncr);

                        this._jg.setColor(this.errorColor);
                        this._jg.drawLine(x, yViewLower - 2, x, yViewLower);
                    } else {
                        if (data.timestamp.getTime() >= dtTick.getTime()) {
                            x = Math.floor((dtTick.getTime() - dataPrev.timestamp.getTime()) /
                                (data.timestamp.getTime() - dataPrev.timestamp.getTime()) * (x - xPrev)) + xPrev;
                            this._jg.setColor(this.gridColor);
                            this._jg.drawLine(x, yViewUpper, x, yViewLower);
                            this._jg.setColor(this.textColor);
                            this._jg.drawStringRect(this._getTimeString(dtTick, bIncludeSec), Math.floor(x - textWidth/2), yViewLower, textWidth, "center");
                            if (bDrawDate) {
                                this._jg.drawStringRect(this._getDateString(dtTick, false), Math.floor(x - textWidth/2), yViewLower + pointSize, textWidth, "center");
                                bDrawDate = false;
                            }
                            dtTick.setTime(dtTick.getTime() + finalTimeIncr);

                            if (dtTick.getUTCDate() != data.timestamp.getUTCDate())
                                bDrawDate = true;
                        }
                    }
                    xPrev = x;
                    dataPrev = data;
                }

                if ((xZoomRange) > 1) {

                    if (this.digital) {
                        this._euAndPosElement.innerHTML = "";
                        // Draw the y axis scale
                        var yOn = Math.floor((yViewRange * 0.2) + yViewUpper);
                        var yOff = Math.floor((yViewRange * 0.8) + yViewUpper);

                        var strDigitalEu = this.engUnits.split("\u002f");

                        this._jg.setColor(this.textColor);

                        this._jg.drawStringRect(strDigitalEu[0], 0, yOn - halfPointSize, xViewLower, "center");
                        this._jg.drawStringRect(strDigitalEu[1], 0, yOff - halfPointSize, xViewLower, "center");

                        this._jg.setColor(this.gridColor);
                        this._jg.drawLine(xViewLower + 1, yOn, xViewUpper, yOn);
                        this._jg.drawLine(xViewLower + 1, yOff, xViewUpper, yOff);

                        this._jg.setColor(this.dataColor);

                        if ((xZoomUpper - xZoomLower) <=(xViewUpper - xViewLower)) {
                            xPrev = xViewLower;
                            yPrev = (this._arrData[xZoomLower].value > 0) ? yOn : yOff;

                            for (var i = xZoomLower + 1; i < xZoomUpper; i++) {
                                x = Math.floor(xViewLower + (xViewRange * (i - xZoomLower) / xZoomRange));
                                y = (this._arrData[i].value > 0) ? yOn : yOff;

                                if (y != yPrev) {
                                    this._jg.drawLine(xPrev, yPrev, x, yPrev);
                                    this._jg.drawLine(x, yPrev, x, y);
                                    xPrev = x;
                                    yPrev = y;
                                }
                            }

                            if (xPrev != x)
                                this._jg.drawLine(xPrev, yPrev, x, y);

                        } else {
                            /* Speedier version for large data */
                            xPrev = xViewLower;
                            yPrev = (this._arrData[xZoomLower].value > 0) ? yOn : yOff;
                            yTop = yBottom = y;

                            for (var i = xZoomLower + 1; i < xZoomUpper; i++) {
                                x = Math.floor(xViewLower + (xViewRange * (i - xZoomLower) / xZoomRange));
                                y = (this._arrData[i].value > 0) ? yOn : yOff;
                                if (x != xPrev) {
                                    this._jg.drawLine(xPrev, yTop, xPrev, yBottom);
                                    yTop = yBottom = yPrev;
                                }
                                if (yBottom == yTop) {
                                    if (yBottom > y)
                                        yBottom = y;
                                    if (yTop < y)
                                        yTop = y;
                                }
                                xPrev = x;
                                yPrev = y;
                            }
                            this._jg.drawLine(x, yTop, x, yBottom);
                        }


                    } else {
                        // analog ************************************************************************************

                        this._euAndPosElement.innerHTML = this.engUnits;

                        // Draw the y axis scale
                        var yScaleIncr = parseFloat(new Number(yZoomRange).toExponential(0));

                        var scaleFixed;

                        if (yZoomRange > 10)
                            scaleFixed = 0;
                        else if (yZoomRange > 1)
                            scaleFixed = 1;
                        else if (yZoomRange > 0.1)
                            scaleFixed = 2;
                        else
                            scaleFixed = 3;

                        if ((yViewRange / pointSize) > 25) {
                            yScaleIncr /= 10;
                        } else {
                            yScaleIncr /= 5;
                        }

                        var yScaleTop = Math.ceil(yZoomUpper / yScaleIncr) * yScaleIncr;
                        var yScaleTick = yScaleTop;
                        var yViewScaleTick;
                        var yTextLocation;

                        while (yScaleTick > yZoomLower) {
                            if (yScaleTick <= yZoomUpper) {
                                yViewScaleTick = yViewUpper + (yViewRange - (yViewRange * ((yScaleTick - yZoomLower) / yZoomRange)));
                                yViewScaleTickRounded = Math.round(yViewScaleTick);
                                this._jg.setColor(this.gridColor);
                                this._jg.drawLine(xViewLower + 1, yViewScaleTickRounded, xViewUpper, yViewScaleTickRounded);
                                this._jg.setColor(this.textColor);
                                yTextLocation = yViewScaleTickRounded - halfPointSize;
                                if (yTextLocation < yViewUpper)
                                    yTextLocation = yViewUpper;
                                if ((yViewScaleTickRounded + pointSize) > yViewLower)
                                    yTextLocation = yViewLower - pointSize;
                                this._jg.drawStringRect(new Number(yScaleTick).toFixed(scaleFixed), 0, yTextLocation, xViewLower, "center");
                            }
                            yScaleTick -= yScaleIncr;
                        }

                        this._jg.setColor(this.dataColor);

                        if ((xZoomUpper - xZoomLower) <= (xViewUpper - xViewLower)) {
                            xPrev = xViewLower;
                            yPrev = Math.floor(yViewUpper + (yViewRange - (yViewRange * ((this._arrData[xZoomLower].value - yZoomLower) / yZoomRange))));

                            for (var i = xZoomLower + 1; i < xZoomUpper; i++) {
                                x = Math.floor(xViewLower + (xViewRange * (i - xZoomLower) / xZoomRange));
                                y = Math.floor(yViewUpper + (yViewRange - (yViewRange * ((this._arrData[i].value - yZoomLower) / yZoomRange))));
                                if ((y >= yViewUpper) && (y <= yViewLower) && (yPrev >= yViewUpper) && (yPrev <= yViewLower))
                                    this._jg.drawLine(xPrev, yPrev, x, y);
                                xPrev = x;
                                yPrev = y;
                            }
                            // TODO: Add crossover code for out of bounds to in bounds data points
                        } else {
                            /* Speedier version for large data */
                            xPrev = xViewLower;
                            yPrev = Math.floor(yViewUpper + (yViewRange - (yViewRange * ((this._arrData[xZoomLower].value - yZoomLower) / yZoomRange))));

                            yTop = yBottom = yPrev;

                            for (var i = xZoomLower + 1; i < xZoomUpper; i++) {
                                x = Math.floor(xViewLower + (xViewRange * (i - xZoomLower) / xZoomRange));
                                y = Math.floor(yViewUpper + (yViewRange - (yViewRange * ((this._arrData[i].value - yZoomLower) / yZoomRange))));
                                if (x != xPrev) {
                                    if ((yTop >= yViewUpper) && (yTop <= yViewLower) && (yBottom >= yViewUpper) && (yBottom <= yViewLower))
                                        this._jg.drawLine(xPrev, yTop, xPrev, yBottom);
                                    yTop = yBottom = yPrev;
                                }
                                if (yBottom > y) {
                                    yBottom = y;
                                    if (yBottom < yViewUpper)
                                        yBottom = yViewUpper;
                                }
                                if (yTop < y) {
                                    yTop = y;
                                    if (yTop > yViewLower)
                                        yTop = yViewLower;
                                }
                                xPrev = x;
                                yPrev = y;
                            }
                            if ((yTop >= yViewUpper) && (yTop <= yViewLower) && (yBottom >= yViewUpper) && (yBottom <= yViewLower))
                                this._jg.drawLine(x, yTop, x, yBottom);
                        }
                    }
                }

                // Draw the x and y axis
                this._jg.setColor(this.axisColor);
                this._jg.setStroke(1);
                this._jg.drawLine(xViewUpper, yViewLower, xViewLower, yViewLower);
                this._jg.drawLine(xViewLower, yViewLower, xViewLower, yViewUpper);

                // Paint it
                this._jg.paint();

                // Draw the center sample data and line
                this._displaySampleData(this._sampleIndex);
                x = Math.floor(xViewLower + (xViewRange * (this._sampleIndex - xZoomLower) / xZoomRange));
                this._updateSampleElement(x, this._yViewUpper,  this._yViewLower);
            }


        }

        LogGraph._initialized = true;
    }
}