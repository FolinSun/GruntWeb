define(function(require, exports, module){
    var $ = require('jquery');
    var render = require('template/common/list');

    var data = {
        title: '我是tmod的标题',
        isAdmin: true,
        name: 'folin',
        list: ['文艺', '博客', '摄影', '电影', '民谣', '旅行', '吉他']
    };

    var html = render(data);




    return{
        decs : 'this js will be request only if it is needed',
        method1: function() {
            $(".ms-breadCrumb-main").css("color","red")
        },
        method2: function(){
            $('body').append(html);
        }
    }
});