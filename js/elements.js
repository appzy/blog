/*开始时间，结束时间*/
var sTime, eTime;
var plateId;
var interval = 500;
var intervalTimer = null;
var oilWithNoSpeed = 0.0;
startTimeObject = new TimeCompoment($('#start'), null, new Date(), function (timeValue) {
    sTime = timeValue;
    var minEndTime = new Date(timeValue);
    startTimeObject.setTime(minEndTime);
    if (endTimeObject.value != undefined && endTimeObject.value.getTime() < minEndTime.getTime()) {
        minEndTime.setHours(minEndTime.getHours() + 1);
        endTimeObject.setTime(minEndTime);
    }
});
var endTimeObject = new TimeCompoment($('#end'), null, new Date(), function (timeValue) {
    eTime = timeValue;
    var maxStartTime = new Date(timeValue);
    endTimeObject.setTime(maxStartTime);
    if (startTimeObject.value != undefined && startTimeObject.value.getTime() > maxStartTime.getTime()) {
        maxStartTime.setHours(maxStartTime.getHours() - 1);
        startTimeObject.setTime(maxStartTime);
    }
});


/*车队*/
$.get("api-customer/entityGroups",
    function (data) {
        console.log(data);
        if (data['code'] == 200) {
            carsOption(data['data']);
        }
    }
)
var carsOption = function (dataArray) {
    var select = $("#spe1");
    dataArray.forEach(function (data) {
        $("<option value='" + data['id'] + "'>" + data['name'] + "</option>").appendTo(select);
        var aId = data['id'].value;
    });
}

/*车牌*/
$("#spe1").change(function () {
    var groupId = $("#spe1").find("option:selected").val();
    $.get("api-customer/entityGroup/" + groupId + "/entities",
        function (data) {
            console.log(data);
            if (data['code'] == 200) {
                plateOption(data['data']);
            }
        }
    )
    var plateOption = function (dataArray) {
        var select1 = $("#spe2");
        $("#spe2 option").remove();
        $("<option>--车牌--</option>").appendTo(select1);
        dataArray.forEach(function (data) {
            $("<option value='" + data['deviceId'] + "'>" + data['identity'] + "</option>").appendTo(select1);
            var pId = plateId;
            plateId = pId;
        });
    }
});

/*查询*/
$('#main_but').click(function () {
    var options = $("#spe2 option");
    if (options.size() > 1) {
        var selectElement = $("#spe2").find("option:selected");
        if (hasAttr(selectElement, "value")) {
            var deviceId = selectElement.val();
            loadMap(deviceId);
        } else {
            $('#myModal').modal('show');
        }

    } else {
        $('#myModal').modal('show');
    }
});

var hasAttr = function (element, attr) {
    return typeof(element.attr(attr)) != 'undefined';
}

var marker, map;
var result;
map = new AMap.Map("container", {
    resizeEnable: true,
    center: [121.55, 31.24],
    zoom: 12
});

var locItems = [];
var oilItems = [];
var mileageItems = [];
var speedItems = [];

var itemData;
endIndex = 0;
var currentPosition;
var endPosition;

var speed = 10000;
var preciousPolyLine = null;
var loadMap = function (deviceId) {
    preciousPolyLine = null;
    if (intervalTimer != null) {
        clearTimer();
    }
    oilWithNoSpeed = 0.0;
    $.get("api-customer/device/" + deviceId + "/search",
        {
            startTime: sTime, endTime: eTime, metricNames: 'loc,accumulateOil,mileage,speed'
        }, handleResult);
};
var handleResult = function (data) {
    preciousPolyLine = null;
    result = data;
    if (result.code == 200) {
        map.clearMap();
        var dataArray = result.data;

        dataArray.forEach(function (x) {
            var name = x.name;
            var items = x.metricItems;
            if (items != null) {
                items.sort(function (x1, x2) {
                    return x1['timestamp'] - x2['timestamp'];
                });
                switch (name) {
                    case 'loc':
                        locItems = items;
                        break;
                    case 'accumulateOil':
                        oilItems = items;
                        break;
                    case 'mileage':
                        mileageItems = items;
                        break;
                    case 'speed':
                        speedItems = items;
                        break;
                }

            }
        });
        if (locItems != null) {
            itemData = [];
            locItems.forEach(function (item) {
                itemData.push(transform(item.value.lat, item.value.lng));
                //itemData.push([item.value.lng, item.value.lat]);
            });
            currentPosition = itemData[0];
            endIndex = 0;
            endPosition = itemData[endIndex];
        }
        completeEventHandler(itemData[0]);
    }
};

function isSamePoint() {
    return endPosition != undefined && new Number(currentPosition[0]).toFixed(3) == new Number(endPosition[0]).toFixed(3)
        && new Number(currentPosition[1]).toFixed(3) == new Number(endPosition[1]).toFixed(3);
}
var move = function () {
    //if (!isKeepCenter) {
    //    timer = setInterval(keepInCenter, 1000);
    //    isKeepCenter = true;
    //}
    if (!map.getBounds().contains(marker.getPosition())) {
        map.setCenter(marker.getPosition());
    }
    currentPosition = endPosition;
    console.log("endindex: " + endIndex);
    endIndex = endIndex + 1;
    endPosition = itemData[endIndex];
    var speed = speedItems[endIndex]['value'];
    if (speed == 0.0) {
        oilWithNoSpeed = oilWithNoSpeed + (oilItems[endIndex]['value'] - oilItems[endIndex - 1]['value']);
    }
    rentTrace(currentPosition);
    if (endPosition != undefined) {
        $("#Time_N").val(new Date(1000 * speedItems[endIndex]['timestamp']).toLocaleString('zh-CN', {hour12: false}));
        $("#speed").val(speedItems[endIndex]['value'].toFixed(2));
        $("#mileage").val(mileageItems[endIndex]['value'].toFixed(2));
        var oilPer100Mileage = 0.0;
        if (endIndex > 0) {
            var mileage = mileageItems[endIndex]['value'] - mileageItems[endIndex - 1]['value'];
            if (mileage != 0) {
                oilPer100Mileage = 100 * ((oilItems[endIndex]['value'] - oilItems[endIndex - 1]['value']) / (mileage))
            }
        }
        $("#oilPer100Mileage").val(oilPer100Mileage.toFixed(2) + '升/百公里');

        $("#oilWithNoSpeed").val(oilWithNoSpeed.toFixed(2) + '升');
    }
    if (isSamePoint()) {
        intervalTimer = setTimeout("move()", interval);
        return;
    }
    intervalTimer = null;
    if (endPosition != undefined) {
        singleMove(currentPosition, endPosition);
    }
};

var singleMove = function (startPosition, endPosition) {
    var littleArray = [];
    littleArray.push(startPosition);
    littleArray.push(endPosition);
    var polyline = new AMap.Polyline({

        map: map,
        path: littleArray,
        strokeColor: "#00A",  //线颜色
        strokeOpacity: 1,     //线透明度
        strokeWeight: 3,      //线宽
        strokeStyle: "solid"  //线样式
    });
    //polyline.hide();
    preciousPolyLine = polyline;
    marker.moveAlong(littleArray, speed);
    //marker.moveTo(endPosition, speed);
}
AMap.event.addDomListener(document.getElementById('startMove'), 'click', function () {
    move();
}, false);
AMap.event.addDomListener(document.getElementById('stopMove'), 'click', function () {
    marker.stopMove();
}, false);
$("#increaseSpeed").click(function () {
    console.log(speed);
    speed = speed + 1000;
    if (interval >= 200) {
        interval = interval - 100;
    }
    var currentPosition = stop();
    if (intervalTimer == null) {
        singleMove(currentPosition, endPosition);
    }
});
$("#decreaseSpeed").click(function () {
    console.log(speed);
    interval = interval + 100;
    if (speed > 1000) {
        speed = speed - 1000;
    }
    var currentPosition = stop();
    if (intervalTimer == null) {
        singleMove(currentPosition, endPosition);
    }
});
$("#pause").click(function () {
    stop();
});
$("#continue").click(function () {
    singleMove(currentPosition, endPosition);
});

function clearTimer() {
    clearTimeout(intervalTimer);
    intervalTimer = null;
}
var stop = function () {
    if (intervalTimer != null) {
        return currentPosition;
    }
    marker.stopMove();
    var position = marker.getPosition();
    currentPosition = [position.getLng(), position.getLat()];
    rentTrace(currentPosition);
    return currentPosition;
}

var rentTrace = function (currentPosition) {
    if (preciousPolyLine != null) {
        var previousPath = preciousPolyLine.getPath();
        var firstPreviousPosition = previousPath[0];
        var pathArray = [];
        pathArray.push(firstPreviousPosition);
        pathArray.push(currentPosition);
        var polyline = new AMap.Polyline({
            map: map,
            path: pathArray,
            strokeColor: "#00A",  //线颜色
            strokeOpacity: 1,     //线透明度
            strokeWeight: 3,      //线宽
            strokeStyle: "solid"  //线样式
        });
    }
}
// 地图图块加载完毕后执行函数
// http://webapi.amap.com/images/car.png
function completeEventHandler(position) {
    map.setCenter(position);
    marker = new AMap.Marker({
        map: map,
        position: position,
        icon: "./images/hcar.png",
        offset: new AMap.Pixel(-26, -13),
        autoRotation: true
    });
    marker.on('moveend', function () {
        console.log(endIndex);
        console.log("stop");
        move();
    });
    //marker.on('movealong', function () {
    //    console.log(endIndex);
    //    console.log("stop");
    //    move();
    //});
}
//添加前一天默认数据
var timestamp = Date.parse(new Date());//当前时间
var preDate = timestamp - 24 * 60 * 60 * 1000;  //前一天
sTime = preDate;
eTime = timestamp;
var deviceId = "861001005353806";
loadMap(deviceId);
document.getElementById("startTimes").value = new Date(sTime).toLocaleString("zh-CN", {hour12: false});
document.getElementById("endTimes").value = new Date(eTime).toLocaleString("zh-CN", {hour12: false});
