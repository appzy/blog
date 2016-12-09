var plateId;
/*车队*/
$.get("api-customer/entityGroups",
    function (data) {
        console.log(data);
        if (data['code'] == 200) {
            carsOption(data['data']);
        }
    }
)
/*添加车队*/
var carsOption = function (dataArray) {
    var select = $("#car1");
    $("#moto_tbody tr").remove();
    dataArray.forEach(function (data) {
        var table = $("#moto_tbody");
        var tr = $('<tr></tr>');
        $("<td onclick=selectmotor(" + data["id"] + ")>" + data['name'] + "</td>").appendTo(tr);
        $("<td class='warning tab-hover' data-toggle='modal' data-target='.bs-example-modal-sm1' onclick=deletemotor(" + data["id"] + ")>删除</td>").appendTo(tr);
        tr.appendTo(table);
        $("<option value='" + data['id'] + "'>" + data['name'] + "</option>").appendTo(select);
        var pId = plateId;
        plateId = pId;
    });
}
var carIDs;
//查询车辆
var selectmotor = function (id) {
    carIDs = id;
    $.get("api-customer/entityGroup/" + id + "/entities",
        function (data) {
            console.log(data);
            if (data['code'] == 200) {
                renderTable(data['data']);
            }
        })
}

var loadAllEntities = function () {
    $.get("api-customer/entities",
        function (data) {
            console.log(data);
            if (data['code'] == 200) {
                renderTableAll(data['data']);
            }
        })
}
loadAllEntities();


/*删除车队*/
var data = [];
var deletemotor = function (id) {
	 $('#btn_deleteCars').click(function () {
	 	deletmotors(id);
        });
}

var deletmotors = function (id) {
    $.ajax({
        url: '/api-customer/entityGroup/' + id,
        type: 'delete',
        dataType: 'json',
        data: data,
        success: function (data) {
            console.log(data);
            if (data['code'] == 200) {
                window.location.href = "motorcade.html";
            }
        }
    })
}
/*删除车队车辆*/
var data = [];
var deleteCar = function (id) {
	$('#btn_deleteCarsone').click(function () {
    	deletCars(id);
    });
}
var deletCars = function (id) {
    $.ajax({
        url: '/api-customer/entityGroup/' + carIDs + '/entity/' + id,
        type: 'delete',
        dataType: 'json',
        data: data,
        success: function (data) {
            console.log(data);
            if (data['code'] == 200) {
                alert("删除成功！");
                window.location.href = "motorcade.html";
            }
        }
    })
}

var getValue = function (array, name) {
    if (array == undefined) {
        return "--";
    }
    var value = array[name];
    if (value == undefined) {
        return "---";
    } else {
        return value;
    }
}

var renderTableAll = function (dataArray) {
    $("#motoTbody tr").remove();
    if(dataArray==""){
	$('#motoTbody').html('暂无数据').addClass('nullcss');
	}else{
		$('#motoTbody').html('').removeClass('nullcss');
    dataArray.forEach(function (data) {
        var tr = $("<tr></tr>");
        $("<td class='active'>" + data['identity'] + "</td>").appendTo(tr);
        $("<td class='active'>" + data['deviceId'] + "</td>").appendTo(tr);
        $("<td class='active'>" + getValue(data['attrs'], 'release_date') + "</td>").appendTo(tr);
        $("<td class='warning'>" + getValue(data['attrs'], 'engine_type') + "</td>").appendTo(tr);
        $("<td class='danger'>" + getValue(data['attrs'], 'insurance') + "</td>").appendTo(tr);
        $("<td class='active tab-hover' data-toggle='modal' data-target='.bs-example-modal-sm' onclick=addEntityToGroup(" + data["id"] + ")>" + "添加到车队" + "</td>").appendTo(tr);
        tr.appendTo('#motoTbody');
    });
	}
}

var renderTable = function (dataArray) {
    $("#motoTbody tr").remove();
    if(dataArray==""){
	$('#motoTbody').html('暂无数据').addClass('nullcss');
	}else{
		$('#motoTbody').html('').removeClass('nullcss');
    dataArray.forEach(function (data) {
        var tr = $("<tr></tr>");
        $("<td class='active'>" + data['identity'] + "</td>").appendTo(tr);
        $("<td class='active'>" + data['deviceId'] + "</td>").appendTo(tr);
        $("<td class='active'>" + getValue(data['attrs'], 'release_date') + "</td>").appendTo(tr);
        $("<td class='warning'>" + getValue(data['attrs'], 'engine_type') + "</td>").appendTo(tr);
        $("<td class='danger'>" + getValue(data['attrs'], 'insurance') + "</td>").appendTo(tr);
        $("<td class='active tab-hover' data-toggle='modal' data-target='.bs-example-modal-sm2' onclick=deleteCar(" + data["id"] + ")>" + "删除" + "</td>").appendTo(tr);
        tr.appendTo('#motoTbody');
    });
	}
}

var addEntityToGroup = function (entityId) {
    $('#btn_addCar').click(function () {
        var options = $("#car1 option");
            if (options.size() > 1) {
            var selectElement = $("#car1").find("option:selected");
            if (hasAttr(selectElement, "value")) {
                var entityGroupId = selectElement.val();
                addEntityToGroupData(entityGroupId, entityId);
            }
        }
        });
}
    var hasAttr = function (element, attr) {
        return typeof(element.attr(attr)) != 'undefined';
        }
var addEntityToGroupData = function (entityGroupId, entityId) {
    $.post("api-customer/entityGroup/" + entityGroupId + "/entity/" + entityId, function (result) {
        var code = result.code;
        if (code == 200) {
            alert("添加成功！")
            window.location.href = "motorcade.html";
        }
    });

}

/*搜索*/
// $('#m-select').click(function(){
//     var m_txt=$('#m_txt').val();
//     if(m_txt=="")
//         {
//           $("m-tab tr:gt(0)").css("display","block");
//         }
//         else
//         {
//             $("m-tab tr:gt(0)").css("display","none");
//             $("m-tab tr:contains("+m_txt+")").css("display","block");
//         }
// })