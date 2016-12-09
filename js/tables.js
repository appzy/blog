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
                loadData(deviceId);
            }else {
             $('#myModal').modal('show');

        }
        } else {
             $('#myModal').modal('show');

        }
    });
        var hasAttr = function (element, attr) {
        return typeof(element.attr(attr)) != 'undefined';
        }

	var renderTable = function (deviceId, dataArray) {
    var locObject;
    var accumulateOilObject;
    var oilObject;
    var mileageObject;
    var speedObject;
    var workingTimeObject;
    var carname;
     if(dataArray==""){
	$('#lw_tbody').html('暂无数据').addClass('nullcss');
	}else{
	$('#lw_tbody').html('').removeClass('nullcss');
    dataArray.forEach(function (singleMetric) {
    $("#lw_tbody tr").remove();
        var metricItems = singleMetric.metricItems;
        metricItems.sort(function (x1, x2) {
            return x1.timestamp - x2.timestamp;
        });
        var itemObject = new Object();
        metricItems.forEach(function (x) {
            itemObject[x.timestamp] = x.value;
        });
        var name = singleMetric.name;
        carname=singleMetric.identity;
        switch (name) {
            case 'loc':
                locObject = itemObject;
                break;
            case 'oil':
                oilObject = itemObject;
                break;
            case 'accumulateOil':
                accumulateOilObject = itemObject;
                break;
            case 'mileage':
                mileageObject = itemObject;
                break;
            case 'speed':
                speedObject = itemObject;
                break;
            case 'workingTime':
                workingTimeObject = itemObject;
                break;
        }
    });
    for (i in locObject) {
        var tr = $("<tr></tr>");
        $("<td class='active'>" + carname + "</td>").appendTo(tr);
        $("<td class='success'>" + new Number(accumulateOilObject[i]).toFixed(2) + "</td>").appendTo(tr);//行驶油耗
        $("<td class='info'>" + new Number(oilObject[i]).toFixed(2) + "</td>").appendTo(tr);//行驶油耗
        $("<td class='warning'>" + new Number(mileageObject[i]).toFixed(2) + "</td>").appendTo(tr);//行驶油耗
        $("<td class='danger'>" + new Number(speedObject[i]).toFixed(2) + "</td>").appendTo(tr);//行驶油耗
        $("<td class='warning'>" + new Number(workingTimeObject[i]).toFixed(2) + "</td>").appendTo(tr);//行驶油耗
        $("<td class='danger'>" + new Date(parseInt(i) * 1000).toLocaleDateString() + "</td>").appendTo(tr);  //行驶公里
        $("<td class='danger'>" + new Date(parseInt(i) * 1000).toLocaleTimeString('zh-CN', {hour12: false}) + "</td>").appendTo(tr);  //行驶公里
        //详情
        tr.appendTo('#lw_tbody');
	}
	}
}
 var loadMap = function (deviceId) {
    $.get("api-customer/device/" + deviceId + "/search",
         {startTime: sTime, endTime: eTime,metricNames: 'loc,oil,accumulateOil,mileage,speed,workingTime'},
         function(data){
         console.log(data);
         if(data['code']==200){
            renderTable(deviceId, data['data']);
         }
         });
    };
/*get excel*/

$('.input_cxcalendar').each(function () {
    var a = new Calendar({
            targetCls: $(this),
            type: 'yyyy-mm-dd HH:MM',
            wday: 2
        },
        function (val) {
            console.log(val)
        })
});
var accumulateOilItems = [];
var oilItems = [];
var speedItems = [];
var nameArray = ['油量', '油耗', '速度'];
var charObject = loadChart(document.getElementById("echart-data"), [], [], [[], [], []]);
var loadData = function (deviceId) {
    $.get("api-customer/device/" + deviceId + "/search", {
            startTime: sTime,
            endTime: eTime,
            metricNames: 'accumulateOil,oil,speed'
        },
        function (data) {
            result = data;
            if (result.code == 200) {
                var dataArray = result.data;
                dataArray.forEach(function (x) {
                    var name = x.name;
                    var items = x.metricItems;
                    if (items != null) {
                        items.sort(function (x1, x2) {
                            return x1['timestamp'] - x2['timestamp']
                        });
                        switch (name) {
                            case 'accumulateOil':
                                accumulateOilItems = items;
                                break;
                            case 'oil':
                                oilItems = items;
                                break;
                            case 'speed':
                                speedItems = items;
                                break
                        }
                    }
                })
                var timeArray = [];
                var oilArray = [];
                var accumulateOilArray = [];
                var speedArray = [];
                oilItems.forEach(function (item) {
                    timeArray.push(new Date(item.timestamp * 1000).toLocaleString('zh-CN', {hour12: false}));
                    oilArray.push(item.value.toFixed(2));
                });
                accumulateOilItems.forEach(function (item) {
                    accumulateOilArray.push(item.value.toFixed(2));
                })
                speedItems.forEach(function (item) {
                    speedArray.push(item.value.toFixed(2));
                })
                var dataArray = [oilArray, accumulateOilArray, speedArray];
                if (charObject == null) {
                    charObject = loadChart(document.getElementById("echart-data"), nameArray, timeArray, dataArray);
                } else {
                    charObject.chart.hideLoading();
                    charObject.reBuildOption(timeArray, nameArray, dataArray);
                }
            }
        })
};
//添加前一天默认数据
var timestamp = Date.parse(new Date());//当前时间
var preDate =timestamp- 24*60*60*1000;  //前一天
	sTime=preDate;
	eTime=timestamp;
	var deviceId="861001005353806";
	loadMap(deviceId);
    loadData(deviceId);
	document.getElementById("startTimes").value=new Date(sTime).toLocaleString("zh-CN",{hour12:false});
	document.getElementById("endTimes").value=new Date(eTime).toLocaleString("zh-CN",{hour12:false});