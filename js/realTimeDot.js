/**
 * Created by vinson on 16/4/26.
 */


var trunckList = new Object();

var myIcon = "http://webapi.amap.com/theme/v1.3/markers/n/mark_b2.png";
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
var loadData = function (deviceIds) {
    $.get("api-customer/device/search",
        {
            fieldName: "loc",
            ids: deviceIds.join(",")
        }, function (data) {
            map.clearMap();  // 清除地图覆盖物
            var deviceData = data['data'];
            deviceData.forEach(function (deviceDataItem) {
                trunckList[deviceDataItem.deviceId]['loc'] = deviceDataItem.metricValue;
                trunckList[deviceDataItem.deviceId]['timestamp'] = deviceDataItem.timestamp;
                var marker = new AMap.Marker({
                    map: map,
                    myIcon: myIcon,
                    position: [deviceDataItem.metricValue['lng'], deviceDataItem.metricValue['lat']],
                    offset: new AMap.Pixel(-12, -36)
                });
                marker.content = deviceDataItem['deviceId'];
                map.setFitView();
                marker.on('click', markerClick);
            });
            map.setFitView();
            loadAdditionalInfo();
        }
    );
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
            ids: deviceIds.toString()
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
            ids: deviceIds.toString()
        }, function (data) {
            var deviceData = data['data'];
            deviceData.forEach(function (deviceDataItem) {
                trunckList[deviceDataItem.deviceId]['accumulateOil'] = deviceDataItem.metricValue;
            });
        }
    );
}
var geocoder = new AMap.Geocoder({
    radius: 1000,
    extensions: "all"
});
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
function setAddress(trunkInfo) {
    var loc = trunkInfo.loc;
    if (typeof loc == 'undefined') {
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


var timeArray = []
var gasArray = [];
var mileageArray = [];
var workingTimeArray = [];
$.get("/api-customer/hourReportsOfAll",
    function (data) {
        console.log(data);
        if (data['code'] == 200) {
            var hourDataArray = data['data'];
            hourDataArray.sort(function (x1, x2) {
                return x1.time - x2.time;
            });
            hourDataArray.forEach(function (item) {
                timeArray.push(new Date(item.time).toLocaleString());
                gasArray.push(item.totalGas);
                mileageArray.push(item.totalMileage);
                workingTimeArray.push(item.totalWorkingTime);
            });
            buildOption(timeArray, gasArray);
        } else {
            buildOption(timeArray, gasArray);
            barChart.setOption(option, true);
        }
    });

var map = new AMap.Map('container', {
    resizeEnable: true,
    center: [116.397428, 39.90923],
    zoom: 18
});
loadAllDevices();


var map = new AMap.Map('container', {
    resizeEnable: true,
    center: [116.397428, 39.90923],
    zoom: 18
});


// JavaScript Document
var dom = document.getElementById("echart-data");
var myChart = echarts.init(dom);
var option;
var buildOption = function (timeArray, accumulateOilArray) {
    option = {
 //       title: {
 //          text: '油耗情况',
 //           subtext: '实时记录'
 //       },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['油耗']
        },
        toolbox: {
            show: true,
            feature: {
                mark: {show: true},
                dataView: {show: true, readOnly: false},
                magicType: {show: true, type: ['line', 'bar', 'stack', 'tiled']},
                restore: {show: true},
                saveAsImage: {show: true}
            }
        },
        calculable: true,
        xAxis: [
            {
                type: 'category',
                boundaryGap: false,
                //data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
                data: timeArray
            }
        ],
        yAxis: [
            {
                type: 'value'
            }
        ],
        series: [
            {
                name: '油耗',
                type: 'line',
                smooth: true,
                itemStyle: {
                    normal: {
                        areaStyle: {
                            type: 'default',
                            color: '#f0ad4e'
                        }
                        }
                    },
                data: accumulateOilArray
            }
        ]
    };
    myChart.setOption(option);
}
//警报查询 monitor

//添加前一天默认数据
var timestamp = Date.parse(new Date());//当前时间
var preDate =timestamp- 24*60*60*1000;  //前一天

    $.get("api-customer/warninglog",
         {startTime: preDate, endTime: timestamp},
         function(data){
         console.log(data);
         if(data['code']==200){
            monitorTable(data['data']);
         }
         });
    var monitorTable = function (dataArray) {
    $("#monitor tr").remove();
    if(dataArray==""){
    $('#monitor').html('暂无数据').addClass('nullcss');
    }else{
        $('#monitor').html('').removeClass('nullcss');
    dataArray.forEach(function (data) {
        var tr = $("<tr></tr>");
        $("<td class='active'>" + data['entityId'] + "</td>").appendTo(tr);
        $("<td class='success'>" + data['identity'] + "</td>").appendTo(tr);
        $("<td class='warning'>" + data['ruleName'] + "</td>").appendTo(tr);
        $("<td class='danger'>" + new Date( data['warningTime']).toLocaleString() + "</td>").appendTo(tr);
        $("<td class='warning'>" + data['value'] + "</td>").appendTo(tr);
        tr.appendTo('#monitor');
    });
    }
    }