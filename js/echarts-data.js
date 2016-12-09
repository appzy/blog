// JavaScript Document
var dom = document.getElementById("echart-data");
var myChart = echarts.init(dom);
var option;
var buildOption = function (timeArray, oilArray, accumulateOilArray, speedArray) {
    option = {
 //       title: {
 //          text: '油耗情况',
 //           subtext: '实时记录'
 //       },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['油量', '油耗', '速度']
        },
        toolbox: {
            show: true,
            feature: {
                mark: {show: true},
                dataView: {show: true, readOnly: false},
                magicType: {show: true, type: ['line', 'bar', 'stack', 'tiled']},
                restore: {show: true},
                saveAsImage: {show: true}
            }
        },
        calculable: true,
        xAxis: [
            {
                type: 'category',
                boundaryGap: false,
                //data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
                data: timeArray
            }
        ],
        yAxis: [
            {
                type: 'value'
            }
        ],
        series: [
            {
                name: '油量',
                type: 'line',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: oilArray
            },
            {
                name: '油耗',
                type: 'line',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: accumulateOilArray
            },
            {
                name: '速度',
                type: 'line',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: speedArray
            }
        ]
    };
    myChart.setOption(option);
}
