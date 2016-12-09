/*开始时间，结束时间*/
var sTime, eTime;
var plateId;
startTimeObject = new TimeCompoment($('#start'), null, new Date(), function (timeValue) {
    var minEndTime = new Date(timeValue);
    minEndTime.setHours(0);
    minEndTime.setMinutes(0);
    minEndTime.setSeconds(0);
    sTime = minEndTime.getTime();
    startTimeObject.setTime(minEndTime);
    if (endTimeObject.value != undefined && endTimeObject.value.getTime() < minEndTime.getTime()) {
        //minEndTime.setHours(minEndTime.getHours() + 1);
        minEndTime.setDate(minEndTime.getDate() + 1);
        endTimeObject.setTime(minEndTime);
    }
}, 2);
var endTimeObject = new TimeCompoment($('#end'), null, new Date(), function (timeValue) {
    var maxStartTime = new Date(timeValue);
    maxStartTime.setHours(0);
    maxStartTime.setMinutes(0);
    maxStartTime.setSeconds(0);
    eTime = maxStartTime.getTime();
    endTimeObject.setTime(maxStartTime);
    if (startTimeObject.value != undefined && startTimeObject.value.getTime() > maxStartTime.getTime()) {
        //maxStartTime.setHours(maxStartTime.getHours() - 1);
        maxStartTime.setDate(maxStartTime.getDate() - 1);
        startTimeObject.setTime(maxStartTime);
    }
}, 2);
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
    var loadMap = function (deviceId) {
    $.get("api-customer/truck/" + deviceId + "/dailyReport",
         {startDate: sTime, endDate: eTime},
         function(data){
         console.log(data);
         if(data['code']==200){
            renderTable(data['data']);
         }
         });
    };
    var renderTable = function(dataArray) {
		$("#lw_tbody tr").remove();
		if(dataArray==""){
			$('#lw_tbody').html('暂无数据').addClass('nullcss');
		}else{
			$('#lw_tbody').html('').removeClass('nullcss');
		dataArray.forEach(function(data) {
        var tr = $("<tr></tr>");
		$("<td class='active'>" + data['identity'] +"</td>").appendTo(tr);
        $("<td class='active'>" + new Date(parseInt(data['date'])).toLocaleDateString()+"</td>").appendTo(tr);
        $("<td class='active'>" + data['totalGas'].toFixed(2) +"</td>").appendTo(tr);
        $("<td class='success'>" + data['movingGas'].toFixed(2) +"</td>").appendTo(tr);
        $("<td class='info'>" + data['totalMileage'].toFixed(2) +"</td>").appendTo(tr);
        $("<td class='warning'>" + data['avgGasOf100Km'].toFixed(2) +"</td>").appendTo(tr);
        $("<td class='warning'>" + data['idleGas'].toFixed(2) +"</td>").appendTo(tr);
        $("<td class='danger'>" + data['totalIdleTime'].toFixed(2) +"</td>").appendTo(tr);
        $("<td class='danger'>" + data['avgGasOf1Hour'].toFixed(2) + "</td>").appendTo(tr);
        tr.appendTo('#lw_tbody');
    });
	}
   }
//添加前一天默认数据
var timestamp = Date.parse(new Date());//当前时间
var preDate =timestamp- 24*60*60*1000;  //前一天
	sTime=preDate;
	eTime=timestamp;
	var deviceId="861001005353806";
	loadMap(deviceId);
	document.getElementById("startTimes").value=new Date(sTime).toLocaleDateString();
	document.getElementById("endTimes").value=new Date(eTime).toLocaleDateString();