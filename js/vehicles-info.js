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
    var carsOption = function (dataArray) {
        var select = $("#w_spe1");
        dataArray.forEach(function (data) {
            $("<option value='" + data['id'] + "'>" + data['name'] + "</option>").appendTo(select);
            var aId = data['id'].value;
        });
    }
$.get("api-customer/entityGroup/33/entities",
                function (data) {
                    console.log(data);
                    if (data['code'] == 200) {
                        renderTable(data['data']);
                    }
                }
        )
    /*车牌*/
    $("#w_spe1").change(function () {
         groupId = $("#w_spe1").find("option:selected").val();
        $.get("api-customer/entityGroup/" + groupId + "/entities",
                function (data) {
                    console.log(data);
                    if (data['code'] == 200) {
                        renderTable(data['data']);
                    }
                }
        )
        var plateOption = function (dataArray) {
            var select1 = $("#w_spe2");
            $("#w_spe2 option").remove();
            $("<option>--车牌--</option>").appendTo(select1);
            dataArray.forEach(function (data) {
                $("<option value='" + data['deviceId'] + "'>" + data['identity'] + "</option>").appendTo(select1);
                var pId = plateId;
                plateId = pId;
                console.log(data);
            });
        }
    });
    	   		 var getValue = function(array, name) {
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

	    var renderTable = function(dataArray) {
		$("lw_tbody tr").remove();
		if(dataArray==""){
			$('#lw_tbody').html('暂无数据').addClass('nullcss');
			}else{
				$('#lw_tbody').html('').removeClass('nullcss');
	   		 dataArray.forEach(function(data) {
	        var tr = $("<tr></tr>");
			$("<td class='active'>" + data['identity']+"</td>").appendTo(tr);
	        $("<td class='active'>" + data['deviceId'] +"</td>").appendTo(tr);
	        $("<td class='active'>" + '---' +"</td>").appendTo(tr);
	        $("<td class='success'>" + '---' +"</td>").appendTo(tr);
	        $("<td class='info'>" + '---' +"</td>").appendTo(tr);
	        $("<td class='warning'>" + getValue(data['attrs'], 'engine_number') +"</td>").appendTo(tr);
	        $("<td class='warning'>" + getValue(data['attrs'], 'release_date') +"</td>").appendTo(tr);
	        $("<td class='danger'>" + getValue(data['attrs'], 'engine_type') +"</td>").appendTo(tr);
	        $("<td class='danger'>" + getValue(data['attrs'], 'engine_power') + "</td>").appendTo(tr);
	        $("<td class='danger'>" + getValue(data['attrs'], 'insurance') + "</td>").appendTo(tr);
	        $("<td class='danger'>" + '---' + "</td>").appendTo(tr);
	        $("<td class='danger'>" + '---' + "</td>").appendTo(tr);
	        tr.appendTo('#lw_tbody');
	   	 });
	   	}
	   }