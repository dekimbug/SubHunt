const simpleTime = function (set) {
  var time = new Date();
  var date = time.getDate();

  var hour = appendZero(time.getHours());
  var min = appendZero(time.getMinutes());
  var sec = appendZero(time.getSeconds());
  var msec = appendZero(time.getMilliseconds());

  switch (set) {
    case 1:
      return hour;
    case 2:
      return hour + ":" + min;
    case 3:
      return hour + ":" + min + ":" + sec;
    case 4:
      return hour + ":" + min + ":" + sec + ":" + msec;
    case "full":
      return date + " - " + hour + ":" + min + ":" + sec + ":" + msec;
    case "msec":
      return msec;
    default:
      return hour + ":" + min;
  }
};

const appendZero = function (val) {
  if (val < 10) {
    val = "0" + val;
  }
  return val;
};
