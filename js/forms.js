/*开始时间，结束时间*/
var sTime, eTime;
var plateId;
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
var plateId;
    // /*车队*/
    $.get("api-customer/entityGroups",
            function (data) {
                console.log(data);
                if (data['code'] == 200) {
                    carsOption(data['data']);
                }
            }
    )
    var trunckList= new Object();
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
                // var pId = plateId;
                // plateId = pId;
            });




            
        }
    });
/*查询*/
$('#main_but').click(function () {
    var deviceIds = [];
    var options = $("#spe2 option");
    if (options.size() > 1) {
        var selectElement = $("#spe2").find("option:selected");
        if (hasAttr(selectElement, "value")) {
            deviceIds.push(selectElement.val());
        } else {
            for (i = 1; i < options.size(); i++) {
                deviceIds.push(options[i].value);
            }
        }
        console.log(deviceIds);
        loadData(deviceIds);
    } else {
        $('#myModal').modal('show');
    }

});

var hasAttr = function (element, attr) {
    return typeof(element.attr(attr)) != 'undefined';
}
<!--Map-->
var map = new AMap.Map('container', {
    resizeEnable: true,
    center: [116.397428, 39.90923],
    zoom: 18
});
var result;
var geocoder = new AMap.Geocoder({
    radius: 1000,
    extensions: "all"
});
function setAddress(trunkInfo) {
    var loc = trunkInfo.loc;
    if (typeof loc == "undefined") {
        return;
    }
    lnglatXY = [];
    lnglatXY.push(trunkInfo.loc.lng);
    lnglatXY.push(trunkInfo.loc.lat);
    geocoder.getAddress(lnglatXY, function (status, result) {
        if (status === 'complete' && result.info === 'OK') {
            var address = result.regeocode.formattedAddress;
            console.log(result);
            trunkInfo['address'] = address;
        } else {
            trunkInfo['address'] = '';
        }
    });
}
var loadAdditionalInfo = function () {
    var deviceIds = [];
    for (i in trunckList) {
        deviceIds.push(i);
        var trunkInfo = trunckList[i];
        setAddress(trunkInfo);
    }
    // TODO 后台没时间暂时批量查询接口,先分开取数据
    $.get("api-customer/device/search",
        {
            fieldName: "speed",
            ids: deviceIds.join(",")
        }, function (data) {
            var deviceData = data['data'];
            deviceData.forEach(function (deviceDataItem) {
                trunckList[deviceDataItem.deviceId]['speed'] = deviceDataItem.metricValue;
            });
        }
    );
    $.get("api-customer/device/search",
        {
            fieldName: "accumulateOil",
            ids: deviceIds.join(",")
        }, function (data) {
            var deviceData = data['data'];
            deviceData.forEach(function (deviceDataItem) {
                trunckList[deviceDataItem.deviceId]['accumulateOil'] = deviceDataItem.metricValue;
            });
        }
    );
}
var loadData = function (deviceIds) {
    $.get("api-customer/device/search",
        {
            fieldName: "loc",
            time:sTime,
            ids: deviceIds.toString()
        }, function (data) {
            map.clearMap();  // 清除地图覆盖物
            var deviceData = data['data'];
            deviceData.forEach(function (deviceDataItem) {
                if (typeof deviceDataItem.metricValue != 'undefined') {
                    trunckList[deviceDataItem.deviceId]['loc'] = deviceDataItem.metricValue;
                    trunckList[deviceDataItem.deviceId]['timestamp'] = deviceDataItem.timestamp;
                    var imageUrl=deviceDataItem['imageUrl'];
                    if(imageUrl==undefined){
                       imageUrl = "./images/mark_b.png";
                    } else {
                        imageUrl = imageUrl;
                    }
                    var marker = new AMap.Marker({
                        map: map,
                        icon: imageUrl,
                        position: [deviceDataItem.metricValue['lng'], deviceDataItem.metricValue['lat']],
                        offset: new AMap.Pixel(-12, -36)
                    });
                    marker.content = deviceDataItem['deviceId'];
                    map.setFitView();
                    marker.on('click', markerClick);
                }
            });
            map.setFitView();
            loadAdditionalInfo();
        }
    );
}

var markerClick = function (e) {
    var deviceId = e.target.content;
    var trunckInfo = trunckList[deviceId];

    var infoWindow = new AMap.InfoWindow({
        content: '<div>车辆信息<br>车牌: ' + trunckInfo['identity']
        + '<br>时间:' + new Date(trunckInfo['timestamp'] * 1000).toLocaleString()
        + '<br>位置:' + trunckInfo['address']
        + '<br>车速:' + trunckInfo['speed']
        + '<br>累计油耗:' + +trunckInfo['accumulateOil'] +
        '</div>',
    });
    infoWindow.open(map, e.target.getPosition());
}
var center = map.getCenter();
var centerText = '当前中心点坐标：' + center.getLng() + ',' + center.getLat();

// 添加事件监听, 使地图自适应显示到合适的范围
AMap.event.addDomListener(document.getElementById('setFitView'), 'click', function () {
    var newCenter = map.setFitView();
});
var loadAllDevices = function () {
    $.get("api-customer/entities",
        function (data) {
            var deviceIds = [];
            if (data['code'] == 200) {
                data['data'].forEach(function (trunkInfo) {
                    trunckList[trunkInfo.deviceId] = trunkInfo;
                    deviceIds.push(trunkInfo.deviceId);
                });
            }
            loadData(deviceIds);
        }
    );
}
loadAllDevices();

	var timestamp = Date.parse(new Date());//当前时间
    sTime=timestamp;
	document.getElementById("startTimes").value=new Date(timestamp).toLocaleString("zh-CN",{hour12:false});
