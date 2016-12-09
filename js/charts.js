/*开始时间，结束时间*/
var sTime, eTime;
var plateId;
/*日历*/
var start = {
    elem: '#start',
    format: 'YYYY/MM/DD hh:mm',
    min: '2010-1-1',
    //设定最小日期为当前日期的前一个月
    //min: laydate.now(),//定最小日期为当前日期
    max: laydate.now(),
    //最大日期为当前日期
    istime: true,
    istoday: true,
    festival: true,
    choose: function (datas) {
        var unix = get_unix_time(datas);

        function get_unix_time(datas) {
            var newstr = datas.replace(/-/g, '/');
            var date = new Date(newstr);
            var time_str = date.getTime().toString();
            return time_str.substr(0, 1000);
        }

        sTime = unix;
        end.min = datas; //开始日选好后，重置结束日的最小日期
        end.start = datas //将结束日的初始值设定为开始日
    }
};
var end = {
    elem: '#end',
    format: 'YYYY/MM/DD hh:mm:ss',
    min: '2010-1-1',
    max: laydate.now(),
    //最大日期为当前日期
    istime: true,
    istoday: false,
    choose: function (datas) {
        var unix = get_unix_time(datas);

        function get_unix_time(datas) {
            var newstr = datas.replace(/-/g, '/');
            var date = new Date(newstr);
            var time_str = date.getTime().toString();
            return time_str.substr(0, 1000);
        }

        eTime = unix;
        start.max = datas; //结束日选好后，重置开始日的最大日期
    }
};
laydate(start);
laydate(end);

var carId, e_plateId;
$.get("api-customer/entityGroups",
    function (data) {
        console.log(data);
        if (data['code'] == 200) {
            carsOption(data['data'])
        }
    })

var carsOption = function (dataArray) {
    var select = $("#e_spe1");
    dataArray.forEach(function (data) {
        $("<option value='" + data['id'] + "'>" + data['name'] + "</option>").appendTo(select);
        var aId = data['id'].value
    })
}

$("#e_spe1").change(function () {
    var groupId = $("#e_spe1").find("option:selected").val();
    $.get("api-customer/entityGroup/" + groupId + "/entities",
        function (data) {
            console.log(data);
            if (data['code'] == 200) {
                plateOption(data['data'])
            }
        })

    var plateOption = function (dataArray) {
        var select1 = $("#e_spe2");
        $("#e_spe2 option").remove();
        $("<option>--车牌--</option>").appendTo(select1);
        dataArray.forEach(function (data) {
            $("<option value='" + data['deviceId'] + "'>" + data['identity'] + "</option>").appendTo(select1);
            var pId = e_plateId;
            e_plateId = pId
        })
    }
});

$('#main_but').click(function () {
    var options = $("#e_spe2 option");
    if (options.size() > 1) {
        var selectElement = $("#e_spe2").find("option:selected");
        if (hasAttr(selectElement, "value")) {
            var deviceId = selectElement.val();
            console.log(deviceId);
            loadData(deviceId);
        } else {
            $('#myModal').modal('show');
        }
    } else {
        $('#myModal').modal('show');
    }
});

var hasAttr = function (element, attr) {
    return typeof(element.attr(attr)) != 'undefined'
}


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