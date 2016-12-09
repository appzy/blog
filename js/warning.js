	$.get("api-customer/warninglog",
			function (data) {
				console.log(data);
				if (data['code'] == 200) {
					renderTable(data['data']);
				}
			})
	var renderTable = function (dataArray) {
    $("#warn_tbody tr").remove();
    if(dataArray==""){
	$('#warn_tbody').html('暂无数据').addClass('nullcss');
	}else{
		$('#warn_tbody').html('').removeClass('nullcss');
    dataArray.forEach(function (data) {
        var tr = $("<tr></tr>");
        $("<td class='active'>" + data['entityId'] + "</td>").appendTo(tr);
        $("<td class='success'>" + data['identity'] + "</td>").appendTo(tr);
        $("<td class='warning'>" + data['ruleName'] + "</td>").appendTo(tr);
        $("<td class='danger'>" + new Date( data['warningTime']).toLocaleString("zh-CN",{hour12:false}) + "</td>").appendTo(tr);
        $("<td class='warning'>" + data['value'] + "</td>").appendTo(tr);
        tr.appendTo('#warn_tbody');
    });
	}
	}