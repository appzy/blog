/*开始时间，结束时间*/
var sTime, eTime;
var plateId;
var beginTime = new Date();
beginTime.setHours(0);
beginTime.setMinutes(0);
beginTime.setSeconds(0);

var endTime = new Date();
endTime.setHours(23);
endTime.setMinutes(59);
endTime.setSeconds(59);

startTimeObject = new TimeCompoment($('#start'), beginTime, endTime, function (timeValue) {
    sTime = timeValue;
    var minEndTime = new Date(timeValue);
    startTimeObject.setTime(minEndTime);
    if (endTimeObject.value != undefined && endTimeObject.value.getTime() < minEndTime.getTime()) {
    	if (minEndTime.getHours() == 23) {
    		minEndTime.setHours(23);
    		minEndTime.setMinutes(59);
    	} else {
			minEndTime.setHours(minEndTime.getHours() + 1);
    	}
        endTimeObject.setTime(minEndTime);
    }
},0,1, 0);
var endTimeObject = new TimeCompoment($('#end'), beginTime, endTime, function (timeValue) {
    eTime = timeValue;
    var maxStartTime = new Date(timeValue);
    endTimeObject.setTime(maxStartTime);	
    if (startTimeObject.value != undefined && startTimeObject.value.getTime() > maxStartTime.getTime()) {
    	if (maxStartTime.getHours() == 0) {
    		maxStartTime.setHours(0);
    		maxStartTime.setMinutes(0);
    	} else {
    		maxStartTime.setHours(maxStartTime.getHours() - 1);	
    	}
        startTimeObject.setTime(maxStartTime);
    }
},0,1, 0);
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
    //进入时隐藏
    var rul_select = document.getElementById("rule_4");
    var rul_num = document.getElementById("typeNum");
    rul_select.style.display="none";
    rul_num.style.display="none";
	var mapAreaResult = [];
    var name;
    var mapAreasToShowInMap = [];
    var ids = [];
    //显示所有规则数据
    function renderRule(ruleAlldata) {
    	if(ruleAlldata==""){
			$('#radd_tbody').html('暂无数据').addClass('nullcss');
			}else{
            ruleAlldata.forEach(function (rule) {
				var tr = $("<tr></tr>");
                if(rule.name==undefined){
                    $("<td class='success'>" + null + "</td>").appendTo(tr);
                }else{
                    $("<td class='success'>" + rule.name + "</td>").appendTo(tr);
                }
                $("<td class='active'>" + new Date(rule.startTime).toLocaleTimeString('zh-CN', {hour12: false}) + "</td>").appendTo(tr);
                $("<td class='active'>" + new Date(rule.endTime).toLocaleTimeString('zh-CN', {hour12: false}) + "</td>").appendTo(tr);
                $("<td class='success'>" + rule.monitorFiled + "</td>").appendTo(tr);
                $("<td class='success'>" + rule.monitorOperator + "</td>").appendTo(tr);
                $("<td class='danger'>" + rule.ruleValue + "</td>").appendTo(tr);
                $("<td class='warning tab-hover' data-toggle='modal' data-target='.bs-example-modal-sm' onclick=addCars(" + rule.id + ")>" + "添加" + "</td>").appendTo(tr);
                $("<td class='warning tab-hover' data-toggle='modal' data-target='.bs-example-modal-lg' onclick=selectCar(" + rule.id + ")>"  + "查询" + "</td>").appendTo(tr);
                $("<td class='warning tab-hover' data-toggle='modal' data-target='.bs-example-modal-sm1' onclick=deleteRule(" + rule.id + ")>"  + "删除" + "</td>").appendTo(tr);
                tr.appendTo('#radd_tbody');
            });
        }
    }
        //查询所有规则数据
		$.get("/api-customer/monitorRule", function (data) {
                console.log(data["data"]);
                if(data["code"]==200){
                    renderRule(data["data"]);
                }
			});
         /*对象 /车/人*/
        $.get("api-customer/compoments",
                function (data) {
                    if (data['code'] == 200) {
                        objType(data['data']);
                    }
                }
        )
        var objType = function (dataArray) {
            var select = $("#rule_1");
            dataArray.forEach(function (data) {
                $("<option value='" + data['id'] + "'>" + data['name'] + "</option>").appendTo(select);
                var aId = data['id'].value;
            });
        }
        var ruleAllData=[];
        /*监控类型*/
        $("#rule_1").change(function () {
        var groupId = $("#rule_1").find("option:selected").val();
        $.get("api-customer/compoment/"+ groupId +"/metrics",
                function (data) {
                    console.log(data);
                    if (data['code'] == 200) {
                        ruleAllData=data['data'];
                        monitorType();
                    }
                }
        )
        var monitorType = function () {
            var select1 = $("#rule_2");
            $("#rule_2 option").remove();
            $("<option>--选择--</option>").appendTo(select1);
            ruleAllData.metricFields.forEach(function (data) {
                console.log(data);
                $("<option value='" + data['fieldName'] + "'>" + data['name'] + "</option>").appendTo(select1);
                var aId = data['fieldName'].value;
            });
        }
        });

        /*监控范围*/
        var monitorTypes;//规则类型 
        $("#rule_2").change(function () {
        var fileName = $("#rule_2").find("option:selected").val();
        var monitorType = function (fileName) {
            var select2 = $("#rule_3");
            $("#rule_3 option").remove();
            $("<option>--选择--</option>").appendTo(select2);
            ruleAllData.metricFields.forEach(function (data) {
                console.log(data);
                if(data['fieldName'] == fileName) {
                monitorTypes=data['monitorType'];
                console.log(monitorTypes);
                data['monitorOperators'].forEach(function(operator) {
                $("<option value='" + operator + "'>" + operator + "</option>").appendTo(select2);
                var aId = operator.value;
                });
                //判断是否有位置信息
                if(data['relatedValues']==undefined){
                //隐藏选择地点
                rul_select.style.display="none";
                rul_num.style.display="inline ";
                }else{
                //隐藏输入框 
                rul_select.style.display="inline ";
                rul_num.style.display="none";
                    $("#rule_4 option").remove();
                    var select3 = $("#rule_4");
                    $("<option>--选择--</option>").appendTo(select3);
                    for (id in data['relatedValues']) {
                        var value = data['relatedValues'][id];
                        $("<option value='" + id + "'>" + value + "</option>").appendTo(select3);
                    }
                }
                }
            });
        };
        monitorType(fileName);
        });

        var typeNums;
        var names;//围栏名称
		//添加规则按钮
		$('#btn_addrule').click(function () {
        typeNums = typeNum.value; //输入框的数值
        names=r_name.value;//规则名称
		if (sTime == undefined) {
           alert("请选择开始时间");
           return false;
        }
        if (eTime == undefined) {
            alert("请选择结束时间");
            return false;
        }
        if (names == "") {
            alert("请输入规则名称");
            return false;
        }
        //如果ruleId位置信息为空 则 提示输入数值
			var ruleId=null;
            var options = $("#rule_4 option");
			if (options.size() > 1) {
            var selectElement = $("#rule_4").find("option:selected");
            if (hasAttr(selectElement, "value")) {
                 ruleId = selectElement.val(); 
			}
		}
            var monitorFiled=$("#rule_2").val();
            var monitorOperator=$("#rule_3").val();
            if(ruleId==undefined){
                ruleId==null;
                if(typeNums==""){
                    alert("请输入数值");
                    return false;
                }
            }
            clickaction(ruleId,monitorFiled,monitorOperator);
		});

		var hasAttr = function (element, attr) {
        return typeof(element.attr(attr)) != 'undefined';
        }
	//绑定时间(规则)
    function clickaction(ruleId,monitorFiled,monitorOperator) {
        $(document).ready(function () {
            var settings = {
                method: "POST",
                dataType: "json",
                headers: {
                    "Content-Type": "application/json"
                },
                data: JSON.stringify(
                        {
                            "productId": "20ba818c89904db0b740fdcd12a826b1",
                            "monitorType": monitorTypes,
                            "monitorFiled": monitorFiled,//类型-位置
                            "monitorOperator": monitorOperator,//在/不在
                            "relatedId": ruleId,//围栏
                            "ruleValue": typeNums,//其他
                            "name": names,//规则名称
                            "startTime": sTime,
                            "endTime": eTime
                        }),
                error: function (XHR, textStatus, errorThrown) {
                    alert("XHR=" + XHR + "\ntextStatus=" + textStatus + "\nerrorThrown=" + errorThrown);
                },
                success: function (data) {
                    alert('添加成功！');
                    window.location.href = "rail-add.html";//添加成功 跳转到主界面
                }
            };
            $.ajax("/api-customer/monitorRule", settings);
        });
    }
    //绑定规则车辆信息
    var addCars = function (td) {
        $('#btn_addCar').click(function () {
        var id = [];
        var data = [];
        var options = $("#car2 option");
        if (options.size() > 1) {
            var selectElement = $("#car2").find("option:selected");
            if (hasAttr(selectElement, "value")) {
                id.push(selectElement.val());
            } else {
                for (i = 1; i < options.size(); i++) {
                    id.push(parseInt(options[i].value));
                }
            }
            console.log(id);
            carData(id);
        } else {
        	alert("请选择车队");
            //$('#myModal').modal('show');
        }
        function carData(id) {
        	$(document).ready(function () {
            var settings = {
                method: "POST",
                dataType: "json",
                headers: {
                    "Content-Type": "application/json"
                },
                data: JSON.stringify(id),
                error: function (XHR, textStatus, errorThrown) {
                    alert("XHR=" + XHR + "\ntextStatus=" + textStatus + "\nerrorThrown=" + errorThrown);
                },
                success: function (data) {
                    alert('添加成功！');
                    window.location.href = "rail-add.html";//添加成功 跳转到主界面
                }
            };
            $.ajax("/api-customer/monitorRule/" + td + "/batchBindEntities", settings);
        });
       }
        });
    }
    var selectCar= function(id){
            $.get("api-customer/monitorRule/"+id,
            function (data) {
                console.log(data);
                if (data['code'] == 200) {
                    renderTable(data['data']);
                }
            })
    var renderTable = function (dataArray) {
    $("#lw_tbody tr").remove();
    if(dataArray==""){
	    $('#lw_tbody').html('暂无数据').addClass('nullcss');
	}else{
		$('#lw_tbody').html('').removeClass('nullcss');
    dataArray.forEach(function (data) {
        var tr = $("<tr></tr>");
        $("<td class='active'>" + data['deviceId'] + "</td>").appendTo(tr);
        $("<td class='success'>" + data['identity'] + "</td>").appendTo(tr);
        $("<td class='danger tab-hover' onclick=deleteCar(" +data['ruleId'] + ","+data['entityId']+")>" + "删除" + "</td>").appendTo(tr);
        tr.appendTo('#lw_tbody');
    	});
		}
      }
    }
    //删除规则
    var data = [];
    var deleteRule=function(id){
        $('#btn_deleteRule').click(function () {
      $.ajax({
        url: '/api-customer/monitorRule/' + id,
        type: 'delete',
        dataType: 'json',
        data: data,
        success: function (data) {
            if (data['code'] == 200) {
                window.location.href = "rail-add.html";
            }
        }
        })
        });
    }
    //删除规则里的车辆
    var deleteCar=function(td,id){
      $.ajax({
        url: '/api-customer/monitorRule/' + td + '/entity/' + id,
        type: 'delete',
        dataType: 'json',
        data: data,
        success: function (data) {
            if (data['code'] == 200) {
                alert("删除成功！");
                window.location.href = "rail-add.html";
            }
        }
        })
    }