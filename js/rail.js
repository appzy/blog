 var editorTool, map = new AMap.Map("container", {
        resizeEnable: true,
        center: [121.5, 31.1],//地图中心点
        zoom: 13 //地图显示的缩放级别
    });
    var mapAreaResult = [];
    var name;
    var mapAreasToShowInMap = [];
    var editor = {};
    var itemData = [];
    var mmessage;
    var main_update = document.getElementById("main_update");//进入时隐藏修改
    var main_but = document.getElementById("main_but");//进入时显示添加
    var startR = document.getElementById("startR");//进入时显示
    var endR = document.getElementById("endR");//进入时显示
    main_update.style.display="none";
    main_but.style.display="inline";
    startR.style.display="inline";
    endR.style.display="inline";
    $(document).ready(function () {
        var settings = {
            method: "GET",
            dataType: "json",
            headers: {
                "Content-Type": "application/json"
            },
            error: function (XHR, textStatus, errorThrown) {
                alert("XHR=" + XHR + "\ntextStatus=" + textStatus + "\nerrorThrown=" + errorThrown);
            },
            success: function (data) {
                var mapAreaResult = data;
                if (mapAreaResult !== null) {
                    var mapData = [];
                    mapAreaResult['data'].forEach(function (mapArea) {
                        var obj = new Object();
                        obj['name'] = mapArea.name;
                        obj['id'] = mapArea.id;
                        mapAreasToShowInMap.push({
                            "id": mapArea.id,
                            "name": mapArea.name,
                            "positions": mapArea.positions
                        });
                        var singlePointArray = [];
                        mapArea['positions'].forEach(function (position) {
                            singlePointArray.push([position.lng, position.lat]);
                        });
                        obj['positions'] = singlePointArray;
                        mapData.push(obj);
                    });
                    console.log(mapData);
                    mapData.forEach(drawPolygon);
                    //renderData(mapData);
                }

            }
        };
        $.ajax("/api-customer/mapArea", settings);
    });
    //在地图上绘制折线
    var markers;
    var updateRailData=function(pointArr){
    	arr = pointArr;
    editor._polygon = (function () {
         markers = new AMap.Polygon({
            map: map,
            path: pointArr,
            strokeColor: "#0000ff",
            strokeOpacity: 1,
            strokeWeight: 3,
            fillColor: "#f5deb3",
            fillOpacity: 0.35
        });
        return markers;
    })();
       editor.markers = markers;
    //map.setFitView();
    editor._polygonEditor = new AMap.PolyEditor(map, editor._polygon);

    editor.startEditPolygon = function () {
        editor._polygonEditor.open();
    }
    editor.closeEditPolygon = function () {
    	closeRule();
     }
	}
	//结束绘制
	var closeRule=function(){
     itemData = [];
        if (arr != null) {
            arr.forEach(function (item) {
                itemData.push({"lng": item.lng, "lat": item.lat});
            });
        }
        console.log(arr);
        console.log(itemData);
        editor._polygonEditor.close();
        mmessage = dw_add.mmessage.value;//设备ID
        if (mmessage == "") {
            alert("请添加地理围栏名称");
            dw_add.mmessage.focus();
            return false;
        }
    }
	var arr = [ //构建多边形经纬度坐标数组
              [121.45, 31.1],
             [121.5,31.15],
            // [116.402292,39.892353],
            [121.55, 31.1]
        ];
	updateRailData(arr);
    var tmp;
    //添加地理围栏
    $(document).ready(function () {
        $(".main_but").click(function () {
            mmessage = dw_add.mmessage.value;//设备ID
            if (mmessage == "") {
                alert("请输入地理围栏名称");
                dw_add.mmessage.focus();
                return false;
            }
            if (itemData == "") {
                alert("请点击开始绘制");
                return false;
            }
            var settings = {
                method: "POST",
                dataType: "json",
                headers: {
                    "Content-Type": "application/json"
                },
                data: JSON.stringify(
                        {
                            "developerId": 1,
                            "name": mmessage,
                            "positions": itemData
                        }),
                error: function (XHR, textStatus, errorThrown) {
                    alert("XHR=" + XHR + "\ntextStatus=" + textStatus + "\nerrorThrown=" + errorThrown);
                },
                success: function (data) {
                    alert('添加成功！');
                    window.location.href = "rail.html";//添加成功 跳转到主界面
                }
            };
            $.ajax("/api-customer/mapArea", settings);
        });
    });
    //绘制围栏
    var sposition=[];
    var drawPolygon = function (data) {
        data['positions'][0];//取围栏第一个点
        var marker = new AMap.Marker({
            position: data['positions'][0]
        });
        marker.setMap(map);
        sposition=data;
        console.log(sposition);
        marker.on('click', markerClick);
        // 设置label标签
        marker.setLabel({//label默认蓝框白底左上角显示，样式className为：amap-marker-label
            offset: new AMap.Pixel(0, 0),//修改label相对于maker的位置
            content: data.name
        });
        var obj = {};
        obj.id = data.id;
        var mar = new AMap.Polygon({
            map: map,
            path: data.positions,
            strokeColor: "#0000ff",
            strokeOpacity: 1,
            strokeWeight: 3,
            fillColor: "#f5deb3",
            fillOpacity: 0.35
        });
        mar.setExtData(data);
        marker.setExtData(data);
        mar.on('click', markerClick);

    };
    var markerClick = function (e) {
    	var data = e.target.getExtData();
    	document.getElementById("mmessage").value=data.name;
	  var contextMenu = new AMap.ContextMenu();  //创建右键菜单
	  contextMenu.addItem("添加规则", function() {
	     	window.location.href = "rail-add.html";
    }, 0);
	     
    //左键点击修改
    contextMenu.addItem("开始修改", function() {
    	main_update.style.display="inline ";//点击显示完成修改
    	main_but.style.display="none";//点击修改隐藏
    	startR.style.display="none";
    	endR.style.display="none";
    	e.target.setMap(null);
    	//editor.markers.setMap(null);
    	//markers.setMap(null);
    	editor._polygonEditor.close();//点击修改 结束当前编辑的围栏
    	updateRailData(data.positions);
    	editor._polygonEditor.open();//自动开始所点击围栏的编辑
    	updateRail(data);
    }, 1);
    //删除
    　contextMenu.addItem("<div class='warning tab-hover' data-toggle='modal' data-target='.bs-example-modal-sm1' >"+"删除围栏"+"</div>", function() {
      $('#btn_deleteRail').click(function () {
      	deleteRail(data.id);//删除
        });
      	
    }, 2);
    contextMenu.open(map, e.lnglat)
		}

	//修改地理围栏
    var updateRail=function(data){
    $(".main_update").click(function () {
    	closeRule();
      $.ajax({ 
		type: "PUT", 
		url: "api-customer/mapArea/"+data.id, 
		data: JSON.stringify(
                        {
                            "developerId": 1,
                            "name": mmessage,
                            "positions": itemData
                        }), 
		contentType: "application/json; charset=utf-8", 
		dataType: "json", 
		success: function (data) { // Play with response returned in JSON format 
			if (data['code'] == 200) {
                alert("修改成功！");
                window.location.href = "rail.html";
            }
		}, 
		error: function (msg) { 
		alert(msg+"修改失败"); 
		} 
		});
    });
    }
    //删除地理围栏
    var data = [];
    var deleteRail=function(td){
      $.ajax({
        url: '/api-customer/mapArea/' + td,
        type: 'delete',
        dataType: 'json',
        data: data,
        success: function (data) {
            if (data['code'] == 200) {
                alert("删除成功！");
                window.location.href = "rail.html";
            }
        }
        })
    }