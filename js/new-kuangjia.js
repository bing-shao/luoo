// 学习jQuery 封装一些简单的功能
(function(w){
    var $$ = function() {};
    $$.prototype={
        $id:function(id){
            return document.getElementById(id)
        },
        $tag:function(tag){
            return document.getElementsByTagName(tag)
        },
        //去除空格
        trim:function(str){
            return str.replace(/(^\s*)|(\s*$)/g, '');
        },

        //简单的数据绑定formateString
        formateString:function(str, data){
            return str.replace(/@\((\w+)\)/g, function(match, key){
                return typeof data[key] === "undefined" ? '' : data[key]});
        },
        BindTemplate:function (data, divid, Template) {
            //alert(divid);
            //alert(Template);
            var html = template(Template, data);
            document.getElementById(divid).innerHTML = html;
        },
        artTemplate:function (id,html,data){
            var render = template.compile(html);
            var str = render(data)
            document.getElementById(id).innerHTML = str;
        },
        extend:function(targent,source){
            for (var i in source){
                targent[i]=source[i];
            }
            return targent;
        },
        //ajax - 前面学习的
        myAjax:function(URL,fn){
            var xhr = createXHR();	//返回了一个对象，这个对象IE6兼容。
            xhr.onreadystatechange = function(){
                if(xhr.readyState === 4){
                    if(xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
                        fn(xhr.responseText);
                    }else{
                        alert("错误的文件！");
                    }
                }
            };
            xhr.open("get",URL,true);
            xhr.send();

            //闭包形式，因为这个函数只服务于ajax函数，所以放在里面
            function createXHR() {
                //本函数来自于《JavaScript高级程序设计 第3版》第21章
                if (typeof XMLHttpRequest != "undefined") {
                    return new XMLHttpRequest();
                } else if (typeof ActiveXObject != "undefined") {
                    if (typeof arguments.callee.activeXString != "string") {
                        var versions = ["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0",
                                "MSXML2.XMLHttp"
                            ],
                            i, len;

                        for (i = 0, len = versions.length; i < len; i++) {
                            try {
                                new ActiveXObject(versions[i]);
                                arguments.callee.activeXString = versions[i];
                                break;
                            } catch (ex) {
                                //skip
                            }
                        }
                    }

                    return new ActiveXObject(arguments.callee.activeXString);
                } else {
                    throw new Error("No XHR object available.");
                }
            }
        },
        //随机数
        random: function (begin, end) {
            return Math.floor(Math.random() * (end - begin)) + begin;
        },
        //数据类型检测
        isNumber:function (val){
            return typeof val === 'number' && isFinite(val)
        },
        isBoolean:function (val) {
            return typeof val ==="boolean";
        },
        isString:function (val) {
            return typeof val === "string";
        },
        isUndefined:function (val) {
            return typeof val === "undefined";
        },
        isObj:function (str){
            if(str === null || typeof str === 'undefined'){
                return false;
            }
            return typeof str === 'object';
        },
        isNull:function (val){
            return  val === null;
        },
        isArray:function (arr) {
            if(arr === null || typeof arr === 'undefined'){
                return false;
            }
            return arr.constructor === Array;
        },

    };
//在框架中实例化，这样外面就不用实例化了
    $$ = new $$();
    /* 模块化 */
    $$.extend($$,{
        /*绑定事件*/
        on: function (id, type, fn) {
            //var dom = document.getElementById(id);
            var dom = $$.isString(id)?document.getElementById(id):id;
            //如果支持
            //W3C版本 --火狐 谷歌 等大多数浏览器
            //如果你想检测对象是否支持某个属性，方法，可以通过这种方式
            if(dom.addEventListener ) {
                dom.addEventListener(type, fn, false);
            }else if(dom.attachEvent){
                //如果支持 --IE
                dom.attachEvent('on' + type, fn);
            }
        },
        /*解除事件*/
        un:function(id, type, fn) {
            //var dom = document.getElementById(id);
            var dom = $$.isString(id)?document.getElementById(id):id;
            if(dom.removeEventListener){
                dom.removeEventListener(type, fn);
            }else if(dom.detachEvent){
                dom.detachEvent(type, fn);
            }

        },
        /*点击*/
        click:function(id,fn){
            this.on(id,'click',fn)
        },
        /*鼠标移上*/
        mouseover:function(id,fn){
            this.on(id,'mouseover',fn);
        },
        /*鼠标离开*/
        mouseout:function(id,fn){
            this.on(id,'mouseout',fn);
        },
        /*悬浮*/
        hover : function(id,fnOver,fnOut){
            if(fnOver){
                this.on(id,"mouseover",fnOver);
            }
            if(fnOut){
                this.on(id,"mouseout",fnOut);
            }
        },
        /*  委托事件*/
        delegate:function (pid, eventType, selector, fn) {
            //参数处理
            var parent = $$.$id(pid);
            function handle(e){
                var target = $$.GetTarget(e);
                if(target.nodeName.toLowerCase()=== selector || target.id === selector || target.className.indexOf(selector) != -1){
                    // 在事件冒泡的时候，回以此遍历每个子孙后代，如果找到对应的元素，则执行如下函数
                    // 为什么使用call，因为call可以改变this指向
                    // 大家还记得，函数中的this默认指向window，而我们希望指向当前dom元素本身
                    fn.call(target);
                }
            }
            //当我们给父亲元素绑定一个事件，他的执行顺序：先捕获到目标元素，然后事件再冒泡
            //这里是是给元素对象绑定一个事件
            parent[eventType]=handle;
        },
        //事件基础
        getEvent:function(event){
            return event?event:window.event;
        },
        //获取目标
        GetTarget :function(event){
            var e = $$.getEvent(event);
            return e.target|| e.srcElement;
        },
        //组织默认行为
        preventDefault:function(event){
            var event = $$.getEvent(event);
            if(event.preventDefault){
                event.preventDefault();
            }else{
                event.returnValue = false;
            }
        },
        //阻止冒泡
        stopPropagation:function(event){
            var event = $$.getEvent(event);
            if(event.stopPropagation){
                event.stopPropagation();
            }else{
                event.cancelBubble = true;
            }
        },
    });

//封装一些常用的dom操作
    $$.extend($$,{
        //给某个元素设置样式
        css:function(id, key, value){
            $$.$id(id).style[key] = value;
        },
        //给某个元素设置属性
        attr:function(id, key, value){
            $$.$id(id)[key] = value;
        },
        //给某个元素设置内容
        html:function(id, value){
            $$.$id(id).innerHTML = value;
        }

    })

    /*选择框架*/
    $$.extend($$,{
        $id:function (str){
            return document.getElementById(str)
        },
        $tag:function(tag,context){
            if(typeof context == 'string'){
                context = $$.$id(context);
            }
            if(context){
                return context.getElementsByTagName(tag);
            }else{
                return document.getElementsByTagName(tag);
            }
        },
        //class选择器
        $class:function(className,context){
            var elements;
            var dom;
            //如果传递过来的是字符串 ，则转化成元素对象
            if($$.isString(context)){
                context = document.getElementById(context);
            }
            //如果兼容getElementsByClassName
            if(context.getElementsByClassName){
                return context.getElementsByClassName(className);
            }else{
                //如果浏览器不支持
                dom = context.getElementsByTagName('*');
                for(var i,len=dom.length;i<len;i++) {
                    if(dom[i].className && dom[i].className ==className ) {
                        elements.push(dom[i]);
                    }
                }
            }
            return elements;
        },
        //分组选择器
        $group:function(content) {
            var result=[],doms=[];
            var arr = $$.trim(content).split(',');
            //alert(arr.length);
            for(var i=0,len=arr.length;i<len;i++) {
                var item = $$.trim(arr[i])
                var first= item.charAt(0)
                var index = item.indexOf(first)
                if(first === '.') {
                    doms=$$.$class(item.slice(index+1))
                    //每次循环将doms保存在reult中
                    //result.push(doms);//错误来源

                    //陷阱1解决 封装重复的代码成函数
                    pushArray(doms,result)

                }else if(first ==='#'){
                    doms=[$$.$id(item.slice(index+1))]//陷阱：之前我们定义的doms是数组，但是$id获取的不是数组，而是单个元素
                    //封装重复的代码成函数
                    pushArray(doms,result)
                }else{
                    doms = $$.$tag(item)
                    pushArray(doms,result)
                }
            }
            return result;

            //封装重复的代码
            function pushArray(doms,result){
                for(var j= 0, domlen = doms.length; j < domlen; j++){
                    result.push(doms[j])
                }
            }
        },
        //层次选择器
        $cengci:function (select){
            //个个击破法则 -- 寻找击破点
            var sel = $$.trim(select).split(' ');
            var result=[];
            var context=[];
            for(var i = 0, len = sel.length; i < len; i++){
                result=[];
                var item = $$.trim(sel[i]);
                var first = sel[i].charAt(0)
                var index = item.indexOf(first)
                if(first ==='#'){
                    //如果是#，找到该元素，
                    pushArray([$$.$id(item.slice(index + 1))]);
                    context = result;
                }else if(first ==='.'){
                    //如果是.
                    //如果是.
                    //找到context中所有的class为【s-1】的元素 --context是个集合
                    if(context.length){
                        for(var j = 0, contextLen = context.length; j < contextLen; j++){
                            pushArray($$.$class(item.slice(index + 1), context[j]));
                        }
                    }else{
                        pushArray($$.$class(item.slice(index + 1)));
                    }
                    context = result;
                }else{
                    //如果是标签
                    //遍历父亲，找到父亲中的元素==父亲都存在context中
                    if(context.length){
                        for(var j = 0, contextLen = context.length; j < contextLen; j++){
                            pushArray($$.$tag(item, context[j]));
                        }
                    }else{
                        pushArray($$.$tag(item));
                    }
                    context = result;
                }
            }

            return context;

            //封装重复的代码
            function pushArray(doms){
                for(var j= 0, domlen = doms.length; j < domlen; j++){
                    result.push(doms[j])
                }
            }
        },
        //多组+层次
        $select:function(str) {
            var result = [];
            var item = $$.trim(str).split(',');
            for(var i = 0, glen = item.length; i < glen; i++){
                var select = $$.trim(item[i]);
                var context = [];
                context = $$.$cengci(select);
                pushArray(context);

            };
            return result;

            //封装重复的代码
            function pushArray(doms){
                for(var j= 0, domlen = doms.length; j < domlen; j++){
                    result.push(doms[j])
                }
            }
        },
        //html5实现的选择器
        $all:function(selector,context){
            context = context || document;
            return  context.querySelectorAll(selector);
        },
    });

    /*css框架*/
    $$.extend($$,{
        //显示
        show:function (context){
            var doms = $$.$all(context)
            for(var i=0;i<doms.length;i++){
                $$.css(doms[i], 'display', 'block');
            }
        },

        //隐藏
        hide:function (context){
            var doms = $$.$all(context)
            for(var i=0;i<doms.length;i++){
                $$.css(doms[i], 'display', 'none');
            }
        },

        /*css*/
        css:function(context, key, value){
            var dom = $$.isString(context)?$$.$all(context) : context;
            //如果是数组
            if(dom.length){
                //先骨架骨架 -- 如果是获取模式 -- 如果是设置模式
                //如果value不为空，则表示设置
                if(value){
                    for(var i = dom.length - 1; i >= 0; i--){
                        setStyle(dom[i],key, value);
                    }
                    //            如果value为空，则表示获取
                }else{
                    return getStyle(dom[0]);
                }
                //如果不是数组
            }else{
                if(value){
                    setStyle(dom,key, value);
                }else{
                    return getStyle(dom);
                }
            }
            function getStyle(dom){
                if(dom.currentStyle){
                    return dom.currentStyle[key];
                }else{
                    return getComputedStyle(dom,null)[key];
                }
            }
            function setStyle(dom,key,value){
                dom.style[key] = value;
            }
        },
        //元素高度宽度概述
        //计算方式：clientHeight clientWidth innerWidth innerHeight
        //元素的实际高度+border，也不包含滚动条
        Width:function (id){
            return $$.$id(id).clientWidth
        },
        Height:function (id){
            return $$.$id(id).clientHeight
        },


        //元素的滚动高度和宽度
        //当元素出现滚动条时候，这里的高度有两种：可视区域的高度 实际高度（可视高度+不可见的高度）
        //计算方式 scrollwidth
        scrollWidth:function (id){
            return $$.$id(id).scrollWidth
        },
        scrollHeight:function (id){
            return $$.$id(id).scrollHeight
        },


        //元素滚动的时候 如果出现滚动条 相对于左上角的偏移量
        //计算方式 scrollTop scrollLeft
        scrollTop:function (id){
            return $$.$id(id).scrollTop
        },
        scrollLeft:function (id){
            return $$.$id(id).scrollLeft
        },

        //获取屏幕的高度和宽度
        sHeight:function (){
            return  window.screen.height
        },
        sWidth:function (){
            return  window.screen.width
        },

        //文档视口的高度和宽度
        wWidth:function (){
            return document.documentElement.clientWidth
        },
        wHeight:function (){
            return document.documentElement.clientHeight
        },
        //文档滚动区域的整体的高和宽
        wScrollHeight:function () {
            return document.body.scrollHeight
        },
        wScrollWidth:function () {
            return document.body.scrollWidth
        },
        //获取滚动条相对于其顶部的偏移
        wScrollTop:function () {
            var scrollTop = window.pageYOffset|| document.documentElement.scrollTop || document.body.scrollTop;
            return scrollTop
        },
        //获取滚动条相对于其左边的偏移
        wScrollLeft:function () {
            var scrollLeft = document.body.scrollLeft || (document.documentElement && document.documentElement.scrollLeft);
            return scrollLeft
        }
    });
//封装属性框架
    $$.extend($$,{
        //属性操作，获取属性的值，设置属性的值 at tr（'test','target','_blank'）
        attr:function(content, key, value){
            var dom =  $$.$all(content);
//        如果是数组  比如tag
            if(dom.length){
                if(value){
                    for(var i= 0, len=dom.length; i <len; i++){
                        dom[i].setAttribute(key, value);
                    }
                }else{
                    return dom[0].getAttribute(key);
                }
//            如果是单个元素  比如id
            }else{
                if(value){
                    dom.setAttribute(key, value);
                }else{
                    return dom.getAttribute(key);
                }
            }
        },
        //动态添加和移除class
        addClass:function (context, name){
            var doms = $$.$all(context);
            //如果获取的是集合
            if(doms.length){
                for(var i= 0,len=doms.length;i<len;i++){
                    addName(doms[i]);
                }
                //如果获取的不是集合
            }else{
                addName(doms);
            }
            function addName(dom){
                dom.className = dom.className + ' ' + name;
            }
        },
        removeClass:function (context, name){
            var doms = $$.$all(context);
            if(doms.length){
                for(var i= 0,len=doms.length;i<len;i++){
                    removeName(doms[i]);
                }
            }else{
                removeName(doms);
            }
            function removeName(dom){
                dom.className = dom.className.replace(name, '');
            }
        },
        //判断是否有
        hasClass:function(context,name){
            var doms = $$.$all(context)
            var flag = true;
            for(var i= 0,len=doms.length;i<len;i++){
                flag = flag && check(doms[i],name)
            }

            return flag;
            //判定单个元素
            function check(element,name){
                return -1<(" "+element.className+" ").indexOf(" "+name+" ")
            }
        },
        //获取
        getClass:function (id){
            var doms = $$.$all(id);
            return $$.trim(doms[0].className).split(" ")
        }
    })
//内容框架
    $$.extend($$,{
        //innerHTML的函数版本
        html:function (context, value){
            var doms = $$.$all(context);
            //设置
            if(value){
                for(var i= 0,len= doms.length; i<len; i++){
                    doms[i].innerHTML = value;
                }
            }else{
                return doms[0].innerHTML
            }
        }
    })
    function Animate(){
        this.interval=30;   // 计时器循环时间
        this.timer;
        this._obj={};   //  保存单个对象
        this._queen=[]; //   保存多个对象
        this._init();
    }
    Animate.prototype={
        _init:function(){},
        // add 函数实现运行
        add:function(id,json,duration){
            //add方法做两件事情：适配器，运行动画，只要用户调用add方法，整个动画能够运行起来
            this._apdapter(id,json,duration);
            this._run();
        },
        // 单个适配器函数
        _apdapterOne:function(id,source,duration){
            var _obj={};
            _obj.id=id ;
            _obj.duration = duration
            _obj.now = +new Date()
            var target=[];
            for (i in source){
                var json={};
                json.start= parseFloat($$.css(id,i)) ;
                json.juli=parseFloat(source[i])-json.start ;
                json.name=i;
                target.push(json);
//                console.log(target.length);
            }
            _obj.styles=target;
            return _obj;
        },
        // 多对象适配
        _apdapter:function(id,source,duration){
            var _obj={};
            _obj=this._apdapterOne(id,source,duration);
            this._queen.push(_obj);  //  将每个对象添加进queen里
        },


        _run:function(){
            // 此处使用定时器循环loop
            var that=this;
            that.timer=setInterval(function(){that._loop();},that.interval)
        },
        // 创建一个新函数loop运行每一个对象
        _loop:function(){  // 遍历循环move
            for(var i=0;i<this._queen.length;i++){
                this._move(this._queen[i]);
            }
        },
        _move:function(_obj){  // 单个对象运动
            var pass = +new Date();
            var tween = this._getTween(_obj.now,pass,_obj.duration,'easeOutBounce');
            if (tween>=1){
                this._stop(_obj);;
            }else{  //  多属性实现
                this._manyProperty(_obj.id,_obj.styles,tween);
            }
        },
        _getTween:function(now,pass,duration,ease){
            var eases = {
                //线性匀速
                linear:function (t, b, c, d){
                    return (c - b) * (t/ d);
                },
                //弹性运动
                easeOutBounce:function (t, b, c, d) {
                    if ((t/=d) < (1/2.75)) {
                        return c*(7.5625*t*t) + b;
                    } else if (t < (2/2.75)) {
                        return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
                    } else if (t < (2.5/2.75)) {
                        return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
                    } else {
                        return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
                    }
                },
                //其他
                swing: function (t, b, c, d) {
                    return this.easeOutQuad(t, b, c, d);
                },
                easeInQuad: function (t, b, c, d) {
                    return c*(t/=d)*t + b;
                },
                easeOutQuad: function (t, b, c, d) {
                    return -c *(t/=d)*(t-2) + b;
                },
                easeInOutQuad: function (t, b, c, d) {
                    if ((t/=d/2) < 1) return c/2*t*t + b;
                    return -c/2 * ((--t)*(t-2) - 1) + b;
                },
                easeInCubic: function (t, b, c, d) {
                    return c*(t/=d)*t*t + b;
                },
                easeOutCubic: function (t, b, c, d) {
                    return c*((t=t/d-1)*t*t + 1) + b;
                },
                easeInOutCubic: function (t, b, c, d) {
                    if ((t/=d/2) < 1) return c/2*t*t*t + b;
                    return c/2*((t-=2)*t*t + 2) + b;
                },
                easeInQuart: function (t, b, c, d) {
                    return c*(t/=d)*t*t*t + b;
                },
                easeOutQuart: function (t, b, c, d) {
                    return -c * ((t=t/d-1)*t*t*t - 1) + b;
                },
                easeInOutQuart: function (t, b, c, d) {
                    if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
                    return -c/2 * ((t-=2)*t*t*t - 2) + b;
                },
                easeInQuint: function (t, b, c, d) {
                    return c*(t/=d)*t*t*t*t + b;
                },
                easeOutQuint: function (t, b, c, d) {
                    return c*((t=t/d-1)*t*t*t*t + 1) + b;
                },
                easeInOutQuint: function (t, b, c, d) {
                    if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
                    return c/2*((t-=2)*t*t*t*t + 2) + b;
                },
                easeInSine: function (t, b, c, d) {
                    return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
                },
                easeOutSine: function (t, b, c, d) {
                    return c * Math.sin(t/d * (Math.PI/2)) + b;
                },
                easeInOutSine: function (t, b, c, d) {
                    return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
                },
                easeInExpo: function (t, b, c, d) {
                    return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
                },
                easeOutExpo: function (t, b, c, d) {
                    return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
                },
                easeInOutExpo: function (t, b, c, d) {
                    if (t==0) return b;
                    if (t==d) return b+c;
                    if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
                    return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
                },
                easeInCirc: function (t, b, c, d) {
                    return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
                },
                easeOutCirc: function (t, b, c, d) {
                    return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
                },
                easeInOutCirc: function (t, b, c, d) {
                    if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
                    return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
                },
                easeInElastic: function (t, b, c, d) {
                    var s=1.70158;var p=0;var a=c;
                    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
                    if (a < Math.abs(c)) { a=c; var s=p/4; }
                    else var s = p/(2*Math.PI) * Math.asin (c/a);
                    return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
                },
                easeOutElastic: function (t, b, c, d) {
                    var s=1.70158;var p=0;var a=c;
                    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
                    if (a < Math.abs(c)) { a=c; var s=p/4; }
                    else var s = p/(2*Math.PI) * Math.asin (c/a);
                    return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
                },
                easeInOutElastic: function (t, b, c, d) {
                    var s=1.70158;var p=0;var a=c;
                    if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
                    if (a < Math.abs(c)) { a=c; var s=p/4; }
                    else var s = p/(2*Math.PI) * Math.asin (c/a);
                    if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
                    return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
                },
                easeInBack: function (t, b, c, d, s) {
                    if (s == undefined) s = 1.70158;
                    return c*(t/=d)*t*((s+1)*t - s) + b;
                },
                easeOutBack: function (t, b, c, d, s) {
                    if (s == undefined) s = 1.70158;
                    return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
                },
                easeInOutBack: function (t, b, c, d, s) {
                    if (s == undefined) s = 1.70158;
                    if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
                    return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
                },
                easeInBounce: function (t, b, c, d) {
                    return c - this.easeOutBounce (d-t, 0, c, d) + b;
                },
                easeInOutBounce: function (t, b, c, d) {
                    if (t < d/2) return this.easeInBounce (t*2, 0, c, d) * .5 + b;
                    return this.easeOutBounce (t*2-d, 0, c, d) * .5 + c*.5 + b;
                }
            };
            return eases[ease](pass-now,0,1,duration);
        },
        _oneProperty:function(id,name,start,juli,tween){
            if(name == 'opacity') {
                $$.css(id, name, start+juli*tween);
            }
            else {
                $$.css(id, name, start+juli*tween+'px');
            }
        },
        _manyProperty:function(id,styles,tween){
            // 循环遍历单个属性得到多属性
            for(var i=0;i<styles.length;i++){
                this._oneProperty(id,styles[i].name,styles[i].start,styles[i].juli,tween);
            }
        },
        _stop:function(_obj){
            this._manyProperty(_obj.id,_obj.styles,1);
        },
    };
    // 采用原型方式需要实例化函数
    $$.animate = new Animate();


    w.$$=$$
})(window);