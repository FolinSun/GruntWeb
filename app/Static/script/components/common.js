//下拉框
var selectFun = {
    inputHidden: "",
    selectCurrent: "",
    init: function(obj){
        this.selectClick(obj);
        this.documentClick(obj);
    },
    selectClick: function(obj){
        var self = this;
        $(obj.selectDom).on("click",function(){
            var _this = $(this);
            self.selectCurrent = $(obj.selectCurrent, _this);
            self.inputHidden = $(obj.inputHidden, _this);
            self.isHidden(!_this.hasClass(obj.cls), obj, _this);
            self.listClick($("li", _this));
        });
    },
    isHidden: function(isTrue, obj, dom){
        if( isTrue ){
            $(obj.selectDom).removeClass( obj.cls );
            dom.addClass( obj.cls );
        }else{
            dom.removeClass( obj.cls );
        }
    },
    documentClick: function(obj){
        $(document).click(function(event){
            var e = $(event.target);
            if( !e.parents().hasClass(obj.selectDom.substring(1)) ){
                $(obj.selectDom).removeClass( obj.cls );
            }
        });
    },
    listClick: function(obj){
        var self = this;
        obj.on("click",function(){
            var _this = $(this);
            self.selectCurrent.html(_this.html());
            self.inputHidden.val(_this.attr("data-id"));
        });
    }
};
selectFun.init({
    selectDom: ".ms-select",
    inputHidden: ".select-val",
    selectCurrent: ".select-current",
    cls: "cur"
});
