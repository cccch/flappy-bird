var canvas = document.getElementById('canvas');
var div = document.getElementById('div');
var cts = canvas.getContext('2d');
var timer = null;
//所有图片路径存入数组
var images = {
    bird:'img/bird.png',
    land:'img/land.png',
    pipeDown:'img/pipeDown.png',
    pipeUp:'img/pipeUp.png',
    sky:'img/sky.png'

}
//封装移动端click事件
function myClick(dom,callBack) {
    //设置初始参数
    var start = 0;
    var delay = 300;
    var isMove = false;
    //判断是移动端还是pc端
    var UA = window.navigator.userAgent.toLocaleLowerCase()
    //移动端注册touch事件
    if (/(iphone|android|ipad|webOS|iPod|BlackBerry)/i.test(UA)) {
        dom.addEventListener("touchstart", function (event) {
            //记录开始时间
            start = Date.now();
        });
        dom.addEventListener("touchmove", function (event) {
            //如果发生了移动就改变isMove的值
            isMove = true;
        });
        dom.addEventListener("touchend", function (event) {
            //如果发生了移动就不执行回调
            if (isMove) return;
            //如果大于延时时间就不执行回调函数
            if (Date.now() - start > delay) return;
            callBack(event);

        });
    }//pc端注册mouse事件
    else {

        dom.addEventListener("mousedown", function (event) {
            //记录开始时间
            start = Date.now();
        });

        dom.addEventListener("mouseup", function (event) {

            //如果大于延时时间就不执行回调函数
            if (Date.now() - start > delay) {
                return;
            }
            callBack(event);

        });
    }
}


//载入图片函数（要将所有图片全部载入再开始绘图）
function loadImages(json,fn){
    //哨兵变量
    var index = 0;
    //记录json.length
    var data = {}
    for(var k in json){
        var img = new Image();
        img.src = json[k];
        data[k] = img;
        img.onload = function(){
            index++;
            if(index == 5){
                fn(data);
            }
        }
    }
}

//绘制背景
function drawSky(data,json){
    //背景运动起来
    json.skyx1--;
    json.skyx2--;
    json.skyx1 = json.skyx1 < -data['sky'].width? data['sky'].width:json.skyx1;
    json.skyx2 = json.skyx2 < -data['sky'].width? data['sky'].width:json.skyx2;
    cts.drawImage(data['sky'],json.skyx1,0);
    cts.drawImage(data['sky'],json.skyx2,0);

}
//陆地绘制
function drawLand(data,json){
    json.landx1--;
    json.landx2--;
    json.landx3--;
    json.landx4--;
    json.landx1 = json.landx1 <= -data['land'].width? data['land'].width*3:json.landx1;
    json.landx2 = json.landx2 <= -data['land'].width? data['land'].width*3:json.landx2;
    json.landx3 = json.landx3 <= -data['land'].width? data['land'].width*3:json.landx3;
    json.landx4 = json.landx4 <= -data['land'].width? data['land'].width*3:json.landx4;
    cts.drawImage(data['land'],json.landx1,488);
    cts.drawImage(data['land'],json.landx2,488);
    cts.drawImage(data['land'],json.landx3,488);
    cts.drawImage(data['land'],json.landx4,488);
};
//管道绘制
function drawPipe(data,json){

    //存储每个管道的高
    if(json.pipeArr.length ==0){
        for(var i=1;i<7;i++){
            var upHeight = Math.random() * (json.maxHeight - json.minHeight) + json.minHeight;
            var downHeight = data['sky'].width-data['land'].width-upHeight-120;
            json.pipeArr.push({upHeight:upHeight,downHeight:downHeight})
            //管道间隔
            //上管道
            cts.drawImage(data['pipeDown'],0,data['pipeDown'].height-upHeight,52,upHeight,(json.pipeSpace*i)-json.pipex1,0,52,upHeight);
            //下管道
            cts.drawImage(data['pipeUp'],0,0,52,downHeight,(json.pipeSpace*i)-json.pipex1,data['sky'].height-data['land'].height-downHeight,52,downHeight)
        }
    }
    else {
        //记录总共的管道数目
        json.num = Math.ceil(json.pipex1 / json.pipeSpace)+6;

        //如果管道arr里的数据和总共管道数目不符合，push一组数据进管道arr
        if(json.num!=json.pipeArr.length){
            var upHeight = Math.random() * (json.maxHeight - json.minHeight) + json.minHeight;
            var downHeight = data['sky'].width-data['land'].width-upHeight-100;
            json.pipeArr.push({
                upHeight:upHeight,
                downHeight:downHeight
            })
        }
        json.pipex1++;
        for(var i=1;i<json.num;i++){
            //上管道
            cts.drawImage(data['pipeDown'],0,data['pipeDown'].height-json.pipeArr[i-1].upHeight,52,json.pipeArr[i-1].upHeight,(json.pipeSpace*i)-json.pipex1,0,52,json.pipeArr[i-1].upHeight);
            //下管道
            cts.drawImage(data['pipeUp'],0,0,52,json.pipeArr[i-1].downHeight,(json.pipeSpace*i)-json.pipex1,data['sky'].height-data['land'].height-json.pipeArr[i-1].downHeight,52,json.pipeArr[i-1].downHeight)
        }
    }

}
//小鸟绘制
function drawBird(data,json){
    json.speed +=0.04 ;
    json.birdy +=json.speed;
    if(json.speed==0){
        cts.drawImage(data['bird'],52,0,50,45,10,20+json.birdy,50,45);
    }
    else if(json.speed>0){
        cts.drawImage(data['bird'],0,0,50,45,10,20+json.birdy,50,45);
    }
    else if(json.speed<0){
        cts.drawImage(data['bird'],104,0,50,45,10,20+json.birdy,50,45);

    }


}
//判断失败函数
function fail(data,bird,pipe){
    //判断落地失败
    cts.beginPath();
    cts.rect(0,data['sky'].height-data['land'].height,data['sky'].width,data['land'].height)
    if (cts.isPointInPath(10,20+bird.birdy+data['bird'].height-12)) {
        clearInterval(timer);
        div.style.display='block';
        return false;
    }
    //判断撞管道失败
    cts.beginPath();
    for(var i=1;i<pipe.num;i++){
        //判断上管道
        cts.beginPath();
        cts.rect((pipe.pipeSpace*i)-pipe.pipex1,0,52,pipe.pipeArr[i-1].upHeight);
        if (cts.isPointInPath(10+40, 30 + bird.birdy)) {
            clearInterval(timer);
            div.style.display='block';
        }
        cts.beginPath()
        cts.rect((pipe.pipeSpace*i)-pipe.pipex1,data['sky'].height-data['land'].height-pipe.pipeArr[i-1].downHeight,52,pipe.pipeArr[i-1].downHeight);
        if (cts.isPointInPath(10+40, 55+ bird.birdy)) {
            clearInterval(timer);
            div.style.display='block';

        }
    }

}

//记录分数函数
function writeGoal(json){
    //记录分数并显示在图中
    var goal = document.getElementById('goal');
    var grade = document.getElementById('grade');
    if(json.num-7>=0){
        goal.innerHTML = json.num-7;
        grade.innerHTML = json.num-7;
    }
}
loadImages(images, function(data){
//        定义函数外部变量
    //sky变量
    var sky = {
        skyx1:0,
        skyx2:data['sky'].width
    }
    //land变量
    var land = {
        landx1:0,
        landx2:data['land'].width,
        landx3:data['land'].width*2,
        landx4:data['land'].width*3
    }
    //pipe变量
    var  pipe = {
        minHeight:80,
        maxHeight:300,
        pipeSpace:190,
        pipex1:0,
        pipeArr:[],
        num:0
    }
    //小鸟变量
    var bird = {
        speed:1,
        birdy:0
    }
    //点击小鸟跳跃
    myClick(canvas,function(){
        bird.speed = -1.4;
    })
    //在来一次
    var again = document.getElementById('again');
    myClick(again,function(){
        location.reload();
    })
    //主要函数调用
    timer = setInterval(function(){
        drawSky(data,sky);
        drawLand(data,land);
        drawPipe(data,pipe);
        drawBird(data,bird);
        //记录分数
        writeGoal(pipe);
        //失败函数需要拿到bird和pipe的数据
        fail(data,bird,pipe);
        console.log(pipe.num);
    },10)
})
