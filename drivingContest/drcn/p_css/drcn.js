// 変数の初期化
var mxg = 0; // 加速度の最大値
var msg; // 表示メッセージ
var os; // オペレーティングシステム

var aa = 0; // alpha
var ba = 0; // beta
var ga = 0; // gamma
var ia = 0; // 初期化フラグ
var ax = 0; // 補正値

// ユーザーエージェントを確認し、オペレーティングシステムを判別する
if (
    navigator.userAgent.indexOf("iPhone") > 0 ||
    navigator.userAgent.indexOf("iPad") > 0 ||
    navigator.userAgent.indexOf("Macintosh") > 0
) {
    os = "Apple"; // Appleデバイス
} else {
    if (navigator.userAgent.indexOf("Android") > 0) {
        os = "Android"; // Androidデバイス
    } else {
        os = "Other"; // その他のデバイス
    }
}

// ボタンを非表示にし、イベントリスナーを登録する
function startS() {
    document.getElementById("button1").style.display = "none";
    document.getElementById("result1").style.display = "none";
    document.getElementById("result3").style.display = "none";

    window.addEventListener("devicemotion", motion, true);

    // オペレーティングシステムがAppleの場合
    if (os == "Apple") {
        // DeviceOrientationEventのパーミッションをリクエストし、許可された場合にイベントリスナーを登録する
        DeviceOrientationEvent.requestPermission().then((response) => {
            if (response === "granted") {
                window.addEventListener("deviceorientation", orientation, true);
            }
        });

        // DeviceMotionEventのパーミッションをリクエストし、許可された場合にイベントリスナーを登録する
        DeviceMotionEvent.requestPermission().then((response) => {
            if (response === "granted") {
                window.addEventListener("devicemotion", orientation, true);
            }
        });
    }
    // オペレーティングシステムがAppleではない場合
    else if ("ondeviceorientationabsolute" in window) {
        window.addEventListener("deviceorientationabsolute", orientationabsolute, true);
        window.addEventListener("deviceorientation", orientation, true);
    } else if ("ondeviceorientation" in window) {
        os = "Android?";
        window.addEventListener("deviceorientation", orientation, true);
    } else {
        os = "Not Work";
    }

    // 特定のデバイスの場合、位置情報を監視し、成功した場合に処理を実行する
    if (
        navigator.userAgent.indexOf("F-04K") > 0 ||
        navigator.userAgent.indexOf("F-41A") > 0
    ) {
        var gl = navigator.geolocation.watchPosition(
            function (position) {
                var data = position.coords;
                var aa = data.heading;
                if (aa != null) {
                    navigator.geolocation.clearWatch(gl);
                    os = "i-filter";
                    startS();
                }
            },
            function (e) {
                document.getElementById("result3").innerHTML = "GeoLocationing";
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 10000,
            }
        );
    }
    document.getElementById("result3").innerHTML = os;
}

// DeviceOrientationEventのイベントハンドラー
function orientationabsolute(e0) {
    aa = e0.alpha;
    ba = e0.beta;
    ga = e0.gamma;
    ia = 1;
    aa = compassHeading(aa, ba, ga);
    window.removeEventListener("deviceorientationabsolute", orientationabsolute, true);
}

// DeviceOrientationEventまたはdeviceorientationイベントのイベントハンドラー
function orientation(e1) {
    var a = e1.alpha;
    var b = e1.beta;
    var g = e1.gamma;

    if (os == "Apple") {
        a = e1.webkitCompassHeading;
    } else {
        a = compassHeading(a, b, g);
        if (ia == 1) {
            ax = a - aa;
            ia = 0;
        }
        a = a - ax;
        if (a < 0) {
            a = a + 360;
        } else {
            if (a > 360) {
                a = a - 360;
            }
        }
    }
    msg = '<font size="7" color="green">';

    if (a < 11.25) {
        msg = msg + "北";
    } else if (a < 33.75) {
        msg = msg + "北北東";
    } else if (a < 56.25) {
        msg = msg + "北東";
    } else if (a < 78.75) {
        msg = msg + "東北東";
    } else if (a < 101.25) {
        msg = msg + "東";
    } else if (a < 123.75) {
        msg = msg + "東南東";
    } else if (a < 146.25) {
        msg = msg + "南東";
    } else if (a < 168.75) {
        msg = msg + "南南東";
    } else if (a < 191.25) {
        msg = msg + "南";
    } else if (a < 213.75) {
        msg = msg + "南南西";
    } else if (a < 236.25) {
        msg = msg + "南西";
    } else if (a < 258.75) {
        msg = msg + "西南西";
    } else if (a < 281.25) {
        msg = msg + "西";
    } else if (a < 303.75) {
        msg = msg + "西北西";
    } else if (a < 326.25) {
        msg = msg + "北西";
    } else if (a < 348.75) {
        msg = msg + "北北西";
    } else {
        msg = msg + "北";
    }
    msg = msg + '</font><br><font size="3" color="black">' + Math.round(a) + "°</font><br><br>";

    msg = msg + '<font size="5" color="red">前後の傾き：';

    if (b < -5) {
        msg = msg + Math.round(b) + '°';
    } else if (b < 5) {
        msg = msg + '水平';
    } else if (b < 85) {
        msg = msg + Math.round(b) + '°';
    } else if (b < 95) {
        msg = msg + '垂直';
    } else if (b < 175) {
        msg = msg + Math.round(b) + '°';
    } else if (b < 185) {
        msg = msg + '逆水平';
    } else if (b < 265) {
        msg = msg + Math.round(b) + '°';
    } else {
        msg = msg + '逆垂直';
    }

    msg = msg + '</font><br>';

    msg = msg + '<font size="5" color="red">左右の傾き：';

    if (g < -5) {
        msg = msg + '左傾' + Math.abs(Math.round(g)) + '°';
    } else if (g < 5) {
        msg = msg + '直立';
    } else {
        msg = msg + '右傾' + Math.abs(Math.round(g)) + '°';
    }
    msg = msg + '</font><br><br>';

    var result1 = document.getElementById("result1");
    result1.innerHTML = msg;
}

function motion(e2) {
    var x = e2.acceleration.x;
    var y = e2.acceleration.y;
    var z = e2.acceleration.z;

    if (mxg < x + y + z) {
        mxg = x + y + z;
    }

    if (Math.round(mxg * 10 / 9.81) / 10 < 1) {
        return;
    }

    var result2 = document.getElementById("result2");
    msg = '<br><font size="7" color="green">';
    msg = msg + Math.round(mxg * 2 * 1.094) + 'ヤード</font><br>';
    msg = msg + '<font size="2" color="blue">加速度＝' +
        Math.round(mxg * 10 / 9.81) / 10 + 'Ｇ</font>';
    result2.innerHTML = msg;
}

function compassHeading(_a, _b, _g) {
    var _d = Math.PI / 180;
    var _x = _b ? _b * _d : 0;
    var _y = _g ? _g * _d : 0;
    var _z = _a ? _a * _d : 0;

    var cX = Math.cos(_x);
    var cY = Math.cos(_y);
    var cZ = Math.cos(_z);
    var sX = Math.sin(_x);
    var sY = Math.sin(_y);
    var sZ = Math.sin(_z);

    var Vx = - cZ * sY - sZ * sX * cY;
    var Vy = - sZ * sY + cZ * sX * cY;

    var _c = Math.atan(Vx / Vy);

    if (Vy < 0) {
        _c += Math.PI;
    } else if (Vx < 0) {
        _c += 2 * Math.PI;
    }

    return _c * (1 / _d);
}