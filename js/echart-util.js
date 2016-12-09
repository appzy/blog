/**
 *
 * Created by vinson on 16/5/6.
 */

var loadChart = function (domElement, nameArray, timeArray, dataArray) {
    var chartObject = new Object();

    var myChart = echarts.init(domElement);

    var option = buildOption(timeArray, nameArray, dataArray);

    myChart.setOption(option);

    chartObject['chart'] = myChart;
    chartObject['option'] = option;
    chartObject.reBuildOption = reBuildOption;
    return chartObject;
}

var initOption = function (nameArray, timeArray) {
    return {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: nameArray,
        },
        //toolbox: {
        //    show: true,
        //    feature: {
        //        mark: {show: true},
        //        dataView: {show: true, readOnly: false},
        //        magicType: {show: true, type: ['line', 'bar', 'stack', 'tiled']},
        //        restore: {show: true},
        //        saveAsImage: {show: true}
        //    }
        //},
        calculable: true,
        xAxis: [
            {
                type: 'category',
                boundaryGap: false,
                data: timeArray
            }
        ],
        yAxis: [
            {
                type: 'value'
            }
        ]
    };
}
var buildOption = function (timeArray, nameArray, dataArray) {
    var option = initOption(nameArray, timeArray);

    var seriesArray = [];
    for (i = 0; i < nameArray.length; i++) {
        var seriesElement = buildSeriesElement(nameArray[i], dataArray[i]);
        seriesArray.push(seriesElement);
    }

    option.series = seriesArray;
    return option;

}
var reBuildOption = function (timeArray, nameArray, dataArray) {
     this.option = initOption(nameArray, timeArray);

    var seriesArray = [];
    for (i = 0; i < nameArray.length; i++) {
        var seriesElement = buildSeriesElement(nameArray[i], dataArray[i]);
        seriesArray.push(seriesElement);
    }

    this.option.series = seriesArray;
    this.chart.setOption(this.option);

}

var buildSeriesElement = function (nameValue, dataArray) {
    var seriesElement =
    {
        name: nameValue,
        type: 'line',
        smooth: true,
        itemStyle: {normal: {areaStyle: {type: 'default'}}},
        data: dataArray
    };
    return seriesElement;

}
