"use strict";

const LocalServer_URL = "";


// ---------------- 運算、除錯功能函數 ----------------

function getRanVal(min, max) {
  return Math.random() * (max - min) + min;
} // getRanVal

function getRanInterVal(min1, max1, min2, max2) {
  if (getRanVal(0, 4) >= 2) {
    return Math.random() * (max1 - min1) + min1;
  }

  return Math.random() * (max2 - min2) + min2;
} // getRanInterval

function getAddNowTime(Y, M, D) {
  let ServerDate = new Date();
  let yyyy = parseInt(ServerDate.toLocaleDateString().slice(0, 4)) + Y;
  let MM = ServerDate.getMonth() + 1 + M;
  let dd = ServerDate.getDate() + D;

  let TDate = new Date(yyyy, MM, dd);
  yyyy = parseInt(TDate.toLocaleDateString().slice(0, 4));
  MM = TDate.getMonth();
  dd = TDate.getDate();

  let dateString = yyyy + '-' + MM + '-' + dd;

  return dateString;
} // getAddNowTime


function getNowTime(returnArray = false) {
  let ServerDate = new Date();
  let yyyy = ServerDate.toLocaleDateString().slice(0, 4);
  let MM = padLeft(ServerDate.getMonth() + 1, 2);
  let dd = padLeft(ServerDate.getDate(), 2);
  let h = padLeft(ServerDate.getHours(), 2);
  let m = padLeft(ServerDate.getMinutes(), 2);
  let s = padLeft(ServerDate.getSeconds(), 2);

  let dateString = '\n' + yyyy + '-' + MM + '-' + dd;
  let dateArray = [yyyy, MM, dd, h, m, s];

  if (returnArray) {
    return dateArray;
  }

  return dateString;
}

function getNow_hms(returnArray = false) {
  let ServerDate = new Date();
  let yyyy = ServerDate.toLocaleDateString().slice(0, 4);
  let MM = padLeft(ServerDate.getMonth() + 1, 2);
  let dd = padLeft(ServerDate.getDate(), 2);
  let h = padLeft(ServerDate.getHours(), 2);
  let m = padLeft(ServerDate.getMinutes(), 2);
  let s = padLeft(ServerDate.getSeconds(), 2);

  let dateString = h + ':' + m + ':' + s;
  let dateArray = [h, m, s];

  if (returnArray) {
    return dateArray;
  }

  return dateString;
}

// 在左邊補 0
function padLeft(str, lenght) { 
  str += "";
  if (str.length >= lenght)
    return str;
  else
    return padLeft("0" + str, lenght);
}


// 判斷數值是否存在
function isExist(Val) {
  try {
    if (Val)
      return true;
  } catch (e) {
    return false;
  }
}

// 保留浮點數字，去除所有文字
function parseFloat2(str) {
  let Length = str.length;
  let ReStr = "";

  for (let i = 0; i < Length; i++) {
    console.log(str.charCodeAt(i) + "  " + str.charAt(i));

    if (str.charCodeAt(i) == 46 || (str.charCodeAt(i) >= 48 && str.charCodeAt(i) <= 57)) {
      ReStr += str.charAt(i);
    }
  }
  console.log(ReStr);
  return parseFloat(ReStr);
}

// 隨機取值
function random(Max) {
  return Math.random() * Max;
} // random

// 隨機取字符
function randomChar() {
  let Char = parseInt(random(255));
  while (!isChar(Char)) {
    Char = parseInt(random(255));
  }
  return String.fromCharCode(Char);
}

// 判斷是否為小寫英文、數字
function isChar(Num) {
  let Re = false;
  if (Num >= 48 && Num <= 57) {
    Re = true;
  } else if (Num >= 97 && Num <= 102) {
    Re = true;
  }

  return Re;
}

// 取得隨機 key
function getRanKey() {
  let Key_Str = "";
  for (let i = 0; i < 5; i++) {
    Key_Str += randomChar();
  }
  return Key_Str;
}

// 回傳 Unix 時間戳記
function getUnitTime(Time = 0) {
  return Math.floor(new Date() / 1000) + Time;
}

// 日期轉時間戳記
function getDatetoUnitTime(Y, M, D, h, m, s) {
  let DateObj = new Date(Y, M, D, h, m, s);

  return parseInt(DateObj.getTime() / 1000);
}

function filter_PartialStr(val, array) {
  let val_length = val.length;

  let RArray = array.filter(function (e, index, array) {
    let CompareString = e.slice(0, val_length);

    if (val == CompareString) {
      return e;
    }
  });
  return RArray;
}

let FloatWindowTimer = setTimeout(function () { }, 0);
let WinObj = $("#FloatWindow");

function Show_FloatMsg(Msg) {
  try {
    clearTimeout(FloatWindowTimer);

    WinObj.addClass("FloatWindow_show");
    WinObj.children(".FloatWindow_Label").html(Msg);

    FloatWindowTimer = setTimeout(function () {
      WinObj.removeClass("FloatWindow_show");
    }, 3000);
  } catch (e) {
    console.log(e);
  }
} // Show_FloatMsg


function get_NameList(Type, callback) {
	let settings = {
		"async": true,
		"crossDomain": true,
		"url": LocalServer_URL + "/TTmatch/get_list/" + Type,
		"method": "GET",
		data: {},
		//timeout: 3000
	};

	$.ajax(settings)
		.done(function(res) {
			try {
				let Obj = JSON.parse(res);
				callback(Obj);
			} catch (e) {
				callback(res);
			}
		})
		.fail(function(jqXHR, exception) {
			// Our error logic here
			var msg = '';
			if (jqXHR.status === 0) {
				msg = 'Not connect.\n Verify Network.';
			} else if (jqXHR.status === 404) {
				msg = 'Requested page not found. [404]';
			} else if (jqXHR.status === 500) {
				msg = 'Internal Server Error [500].';
			} else if (exception === 'parsererror') {
				msg = 'Requested JSON parse failed.';
			} else if (exception === 'timeout') {
				msg = 'Time out error.';
			} else if (exception === 'abort') {
				msg = 'Ajax request aborted.';
			} else {
				msg = 'Uncaught Error.\n' + jqXHR.responseText;
			}
			console.log("\nget_NameList : " + msg);
			console.log("settings : ");
			console.log(settings);
		});
}

function AjaxFail(HeaderMsg, settings, jqXHR, exception) {
	// Our error logic here
	var msg = '';
	if (jqXHR.status === 0) {
		msg = 'Not connect.\n Verify Network.';
	} else if (jqXHR.status == 404) {
		msg = 'Requested page not found. [404]';
	} else if (jqXHR.status == 500) {
		msg = 'Internal Server Error [500].';
	} else if (exception === 'parsererror') {
		msg = 'Requested JSON parse failed.';
	} else if (exception === 'timeout') {
		msg = 'Time out error.';
	} else if (exception === 'abort') {
		msg = 'Ajax request aborted.';
	} else {
		msg = 'Uncaught Error.\n' + jqXHR.responseText;
	}
	console.log(HeaderMsg + msg);
	console.log("query_settings : ");
	console.log(settings);
}

function json2csv(objArray) {
	let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

  let label = Object.keys(array[0]); // 第一行為標題
  label.forEach((item, i)=>{ // 去除空白，以免 CSV 格式意外換行
    label[i] = label[i].trim();
  });

	let str = label.toString() + "\r\n";

	for (var i = 0; i < array.length; i++) {
		var line = "";
		for (var index in array[i]) {
			if (line !== "") line += ","

			line += ( '"' + array[i][index] + '"' ); // csv 將 "" 內容以一個單元格處理，將矩陣包上 ""，以免分離格
		}
		str += line + "\r\n";
	}
	return str;	
}