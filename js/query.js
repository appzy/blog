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
    
    // /*车队*/
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
                $("<option value='" + data['id'] + "'>" + data['identity'] + "</option>").appendTo(select1);
                var pId = plateId;
                plateId = pId;
            });
        }
    });
    
      /*查询*/
    $('#main_but').click(function () {
        var id = [];
        var options = $("#spe2 option");
        if (options.size() > 1) {
            var selectElement = $("#spe2").find("option:selected");
            if (hasAttr(selectElement, "value")) {
                id.push(selectElement.val());
            } else {
                for (i = 1; i < options.size(); i++) {
                    id.push(options[i].value);
                }
            }
            loadMap(id);
        } else {
            $('#myModal').modal('show');
        }
    });
        var hasAttr = function (element, attr) {
        return typeof(element.attr(attr)) != 'undefined';
        }
        var loadMap = function (id) {
        $.get("api-customer/maintainceRecords/search",
            {
            //startDate: sTime,
              //endDate: eTime,
              entityIds:id.toString()
          	},
             function(data){
             console.log(data);
             if(data['code']==200){
                queryTable(data['data']);
             }
             });
        };
		var queryTable = function(dataArray) {
			$("#listdata tr").remove();
			if(dataArray==""){
			$('#listdata').html('暂无数据').addClass('nullcss');
			}else{
				$('#listdata').html('').removeClass('nullcss');
			dataArray.forEach(function(data) {
				var tr = $("<tr></tr>");
				$("<td class='active'>" + data['identity'] +"</td>").appendTo(tr);
				$("<td class='success'>" + data['fieldName'] +"</td>").appendTo(tr);
				$("<td class='warning'>" + data['realValue'].toFixed(2) +"</td>").appendTo(tr);
				$("<td class='danger'>" + data['warningValue'].toFixed(2) +"</td>").appendTo(tr);
				$("<td class='info'>" + new Date(data['startDate']).toLocaleDateString() +"</td>").appendTo(tr);
				if(data['state']==0){
				$("<td class='warning tab-hover' data-toggle='modal' data-target='.bs-example-modal-sm1' onclick=isMaintain(" +data['id'] +")>" + "未保养(编辑)" + "</td>").appendTo(tr);
				}else{
				$("<td class='warning tab-hover'>" + "已保养" + "</td>").appendTo(tr);
				}
				$("<td class='warning'>" + data['description'] + "</td>").appendTo(tr);
				tr.appendTo('#listdata');
			});
			}
		}
	var	descrip;
	//改变养护状态（已养护/未养护）
    var isMaintain=function(id){
    $("#btn_maintain").click(function () {
    	descrip=$("#descrip").val();//获取描述内容
    	if (descrip == "") {
           alert("请输入保养信息");
           return false;
        }
      $.ajax({ 
		type: "PUT", 
		url: "api-customer/maintainceRecord/" + id + "/finish",
		data: JSON.stringify(
                        {
                        "description":descrip
                        }), 
		contentType: "application/json; charset=utf-8", 
		dataType: "json", 
		success: function (data) { // Play with response returned in JSON format 
			if (data['code'] == 200) {
                alert("提交成功！");
                window.location.href = "query.html";
            }
		}, 
		error: function (msg) { 
		alert("提交失败"); 
		} 
		});
    });
    }
//添加前一天默认数据
var timestamp = Date.parse(new Date());//当前时间
var preDate =timestamp- 24*60*60*1000;  //前一天
	sTime=preDate;
	eTime=timestamp;
	var id=739;
	loadMap(id);
	document.getElementById("startTimes").value=new Date(sTime).toLocaleDateString();
	document.getElementById("endTimes").value=new Date(eTime).toLocaleDateString();