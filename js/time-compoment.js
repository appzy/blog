function buildDateString(time) {
    return time.getFullYear() + "-"
        + (time.getMonth() + 1) + "-" + time.getDate() + " "
        + time.getHours() + ":" + time.getMinutes() + ":00";
}
/**
 * Created by vinson on 16/5/9.
 */


function TimeCompoment(domElement, startDate, endDate, dateChangeFunction, minView, startView, maxView) {
    var timeCompoment = new Object;
    timeCompoment.dateElement = domElement;
    timeCompoment.dateOptions = {
        language: 'zh-CN',
        weekStart: 1,
        todayBtn: 1,
        autoclose: 1,
        todayHighlight: 1,
        forceParse: 0
    };
    if (startDate != null) {
        timeCompoment.dateOptions.startDate = startDate;
    }
    if (endDate != null) {
        timeCompoment.dateOptions.endDate = endDate;
    }
    if (minView != null) {
        timeCompoment.dateOptions.minView = minView;
    }
    if (startView != null) {
        timeCompoment.dateOptions.startView = startView;
    }
    if (maxView != null) {
        timeCompoment.dateOptions.maxView = maxView;
    }
    timeCompoment.mydatetimepicker = domElement.datetimepicker(timeCompoment.dateOptions).on("changeDate", function (ev) {
        dateChangeFunction(ev.date.valueOf());
    });
    timeCompoment.setTime = function (time) {
        this.value = time;
        this.dateElement.datetimepicker("update", buildDateString(time));
    };
    return timeCompoment;
}
