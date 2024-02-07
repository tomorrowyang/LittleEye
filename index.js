let bigEye = document.getElementById('bigEye');
let eyeball = document.getElementById('eyeball');
let eyeballChart = echarts.init(eyeball);
let leftRotSize = 0; // 旋转角度
let ballSize = 0; // 眼睛尺寸
let rotTimer; // 定时器
let isSleep = true;
let ballColor = 'transparent';

bigEye.addEventListener('click', () => {
    if (!isSleep) return;
    clickToWeakup();
})

function getEyeballChart() {
    eyeballChart.setOption({
        series: [
            {
                type: 'gauge', // 使用仪表盘类型
                radius: '-20%', // 采用负数是为了让分割线从内向外延伸
                clockwise: false,
                startAngle: `${0 + leftRotSize * 5}`, // 起始角度
                endAngle: `${270 + leftRotSize * 5}`, // 结束角度
                splitNumber: 3, // 分割数量，会将270度分割为3份，所以有四根线
                detail: false,
                axisLine: {
                    show: false,
                },
                axisTick: false,
                splitLine: {
                    show: true,
                    length: ballSize, // 分割线长度
                    lineStyle: {
                        shadowBlur: 20, // 阴影渐变
                        shadowColor: ballColor, // 阴影颜色
                        shadowOffsetY: '0',
                        color: ballColor, // 分割线颜色
                        width: 4, // 分割线宽度
                    }
                },
                axisLabel: false
            },
            {
                type: 'gauge',
                radius: '-20%',
                clockwise: false,
                startAngle: `${45 + leftRotSize * 5}`, // 倾斜45度
                endAngle: `${315 + leftRotSize * 5}`,
                splitNumber: 3,
                detail: false,
                axisLine: {
                    show: false,
                },
                axisTick: false,
                splitLine: {
                    show: true,
                    length: ballSize,
                    lineStyle: {
                        shadowBlur: 20,
                        shadowColor: ballColor,
                        shadowOffsetY: '0',
                        color: ballColor,
                        width: 4,
                    }
                },
                axisLabel: false
            }
        ]
    })
}

function toSleep() {
    clearInterval(rotTimer); // 清除定时器
    rotTimer = setInterval(() => {
        getEyeballChart();
        if (ballSize > 0) {
            ballSize -= 0.1; // 当眼球存在时慢慢减小
        } else {
            bigEye.className = 'eyeSocket eyeSocketSleeping'; // 眼球消失后添加呼吸
        }
        leftRotSize === 360 ? (leftRotSize = 0) : (leftRotSize += 0.1); // 旋转，
    }, 10);
    document.body.removeEventListener('mousemove', focusOnMouse);
    bigEye.style.transform = `rotateY(0deg) rotateX(0deg)`;
    eyeball.style.transform = `translate(0px, 0px)`;
}

function clickToWeakup() {
    isSleep = false; // 修改状态
    bigEye.className = 'eyeSocket'; // 清除休眠状态
    setAngry();
    eyeFilter.style.opacity = '1';
    eyeFilter.className = bigEye.className = 'eyeSocket eyeSocketLooking';
    clearInterval(rotTimer); // 清除定时器
    rotTimer = setInterval(() => {
        getEyeballChart()
        ballSize <= 50 && (ballSize += 1);
        leftRotSize === 360 ? (leftRotSize = 0) : (leftRotSize += 0.5);
    }, 10);
}

function setAngry() {
    // 通过js修改body的css变量
    document.body.style.setProperty('--c-eyeSocket', 'rgb(255,187,255)');
    document.body.style.setProperty('--c-eyeSocket-outer', 'rgb(238,85,135)');
    document.body.style.setProperty('--c-eyeSocket-outer-shadow', 'rgb(255, 60, 86)');
    document.body.style.setProperty('--c-eyeSocket-inner', 'rgb(208,14,74)');
    ballColor = 'rgb(208,14,74)';
}

function setNormal() {
    document.body.style.setProperty('--c-eyeSocket', 'rgb(41, 104, 217)');
    document.body.style.setProperty('--c-eyeSocket-outer', '#02ffff');
    document.body.style.setProperty('--c-eyeSocket-outer-shadow', 'transparent');
    document.body.style.setProperty('--c-eyeSocket-inner', 'rgb(35, 22, 140)');
    ballColor = 'rgb(0,238,255)';
}

bigEye.addEventListener('webkitAnimationEnd', () => { // 监听动画结束事件
    new Promise(res => {
        clearInterval(rotTimer); // 清除定时器
        rotTimer = setInterval(() => {
            getEyeballChart(); // 更新视图
            ballSize > 0 && (ballSize -= 0.5); // 眼球尺寸减小
            leftRotSize === 360 ? (leftRotSize = 0) : (leftRotSize += 0.1);
            if (ballSize === 0) { // 当眼球尺寸为0时，将Promise标记为resolved，然后执行后面的代码
                clearInterval(rotTimer);
                res();
            }
        }, 10);
    }).then(() => {
        eyeFilter.style.opacity = '0'; // 清除光环
        eyeFilter.className = bigEye.className = 'eyeSocket'; // 清除环视动画
        setNormal(); // 设置常态样式
        document.body.addEventListener('mousemove', focusOnMouse);
        rotTimer = setInterval(() => {
            getEyeballChart();
            ballSize <= 12 && (ballSize += 0.1); // 眼球尺寸缓慢增加
            leftRotSize === 360 ? (leftRotSize = 0) : (leftRotSize += 0.1);
        }, 10);
    })
})

function focusOnMouse(e) {
    // 视口尺寸
    let clientWidth = document.body.clientWidth;
    let clientHeight = document.body.clientHeight;
    // 原点，即bigEye中心位置，页面中心
    let origin = [clientWidth / 2, clientHeight / 2];
    // 鼠标坐标
    let mouseCoords = [e.clientX - origin[0], origin[1] - e.clientY];
    let eyeXDeg = mouseCoords[1] / clientHeight * 80;
    let eyeYDeg = mouseCoords[0] / clientWidth * 60;
    bigEye.style.transform = `rotateY(${eyeYDeg}deg) rotateX(${eyeXDeg}deg)`;
    eyeball.style.transform = `translate(${eyeYDeg / 1.5}px, ${-eyeXDeg / 1.5}px)`;
    // 设置休眠
    if (sleepTimer) clearTimeout(sleepTimer);
    sleepTimer = setTimeout(() => {
        toSleep();
    }, 30000);
}

// getEyeballChart();

// toSleep();