$(function(){ 
    var stock = new Stock();
    //页面初始化先渲染一次数据
    stock.render();

    //处理点击添加代码事件
    $("#add").click(function(){
        var code = $("#stock_code").val();
        stock.addToLocalStorge(code);
        console.log(code);
        stock.render();
    });

    //处理点击删除按钮事件，这里a标签是动态加载的，需要这样绑定事件
    $(document).on( "click", "a[data-action=delete]", function() {
        var code = $(this).attr("data-code");
        console.log("in remove")
        console.log(code);
        //移除对应localStorge中的代码
        stock.removeStock(code);
        //修改完渲染数据
        stock.render();
    });

    //点击股票代码，添加跳转
    $(document).on( "click", "a[data-action=open]", function() {
        var code = $(this).text();
        if(code.match(/^00.*?/)){
            code = "sz"+code;
        }
        if(code.match(/^60.*?/)){
            code = "sh"+code;
        }
        var api = "http://finance.sina.com.cn/realstock/company/"+code+"/nc.shtml";
        chrome.tabs.create({url:api})
    });
})