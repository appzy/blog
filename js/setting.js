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

	$.get("api-customer/maintainceRules",
			function (data) {
				console.log(data);
				if (data['code'] == 200) {
					setTable(data['data']);
				}
			})
	var setTable = function (dataArray) {
    $("#set_tbody tr").remove();
    if(dataArray==""){
	$('#set_tbody').html('暂无数据').addClass('nullcss');
	}else{
		$('#set_tbody').html('').removeClass('nullcss');
    dataArray.forEach(function (data) {
        var tr = $("<tr></tr>");
        $("<td class='active'>" + data['identity'] + "</td>").appendTo(tr);
        $("<td class='success'>" + data['fieldName'] + "</td>").appendTo(tr);
        $("<td class='warning'>" + data['warningValue'] + "</td>").appendTo(tr);
        $("<td class='danger'>" + new Date( data['startDate']).toLocaleDateString() + "</td>").appendTo(tr);
        $("<td class='warning tab-hover' data-toggle='modal' data-target='.bs-example-modal-sm1' onclick=deleteSet(" + data['ruleId'] + ") >" + "删除" + "</td>").appendTo(tr);
        tr.appendTo('#set_tbody');
    });
	}
	}

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
        var select = $("#car1");
        dataArray.forEach(function (data) {
            $("<option value='" + data['id'] + "'>" + data['name'] + "</option>").appendTo(select);
            var aId = data['id'].value;
        });
    }
    /*车牌*/
    $("#car1").change(function () {
        var groupId = $("#car1").find("option:selected").val();
        $.get("api-customer/entityGroup/" + groupId + "/entities",
                function (data) {
                    console.log(data);
                    if (data['code'] == 200) {
                        plateOption(data['data']);
                    }
                }
        )
        var plateOption = function (dataArray) {
            var select1 = $("#car2");
            $("#car2 option").remove();
            $("<option>--车牌--</option>").appendTo(select1);
            dataArray.forEach(function (data) {
                $("<option value='" + data['id'] + "'>" + data['identity'] + "</option>").appendTo(select1);
                var pId = plateId;
                plateId = pId;
            });
        }
    });
    //获取选择的类型
    $.get("api-customer/maintainceFields",
                function (data) {
                    if (data['code'] == 200) {
                    	console.log(data['data']);
                        maintenanceData(data['data']);
                    }
                }
        )
        var maintenanceData = function (dataArray) {
            var select = $("#set3");
            dataArray.forEach(function (data) {
                $("<option value='" + data['id'] + "'>" + data['name'] + "</option>").appendTo(select);
                var aId = data['id'].value;
            });
        }
        var fieldId;//选择的类型
        var ssize;//取值大小
       //设置保养按钮
   	$('#btn_addset').click(function () {
   		 ssize=$("#ssize").val();//输入框的数值
   		 fieldId= $("#set3").find("option:selected").val();//选择的类型
   		if(ssize==""){
           alert("请输入养护数值");
           return false;
         }
   		var options = $("#car2 option");
        if (options.size() > 1) {
            var selectElement = $("#car2").find("option:selected");
            if (hasAttr(selectElement, "value")) {
                var carId = selectElement.val();
                addMaintenance(carId);
            }else {
             $('#myModal').modal('show');
             alert("请选择车辆");
        }
        } else {
             $('#myModal').modal('show');
             alert("请选择车辆");
        }
   	});
   	var hasAttr = function (element, attr) {
        return typeof(element.attr(attr)) != 'undefined';
        }
    //添加车辆养护信息
    function addMaintenance(carId) {
        $(document).ready(function () {
            var settings = {
                method: "POST",
                dataType: "json",
                headers: {
                    "Content-Type": "application/json"
                },
                data: JSON.stringify(
                        {
                        	"entityId": carId,
						  	"fieldId": fieldId,
						  	"warningValue": ssize,
						  	"startDate": sTime
                        }),
                error: function (XHR, textStatus, errorThrown) {
                    alert("XHR=" + XHR + "\ntextStatus=" + textStatus + "\nerrorThrown=" + errorThrown);
                },
                success: function (data) {
                    alert('添加成功！');
                    window.location.href = "setting.html";//添加成功 跳转到主界面
                }
            };
            $.ajax("/api-customer/maintainceRule", settings);
        });
    }
	//删除养护规则
    var data = [];
    var deleteSet=function(id){
        $('#btn_deleteSet').click(function () {
      $.ajax({
        url: '/api-customer/monitorRule/' + id,
        type: 'delete',
        dataType: 'json',
        data: data,
        success: function (data) {
            if (data['code'] == 200) {
            	alert("删除成功！");
                window.location.href = "setting.html";
            }
        }
        })
        });
    }