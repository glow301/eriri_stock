/**
 * 获取数据
 */
class Stock{

    /**
     * 构造方法，初始化一些数据
     */
    constructor(){
        //定义localstorge的key
        this.key = "eriri_stock";
        //数据获取api
        this.api = "http://hq.sinajs.cn/";
    }

    /**
     * 获取当前时间戳
     */
    getTimestamp(){
        return new Date().getTime();    
    }

    /**
     * 从localstorge中获取自选股代码
     * @return string
     */
    getCodeFromLocalStorge(){
        if(undefined == localStorage[this.key] || "" == localStorage[this.key]){
            return '';
        }
        return localStorage[this.key].replace(/(^,|,$)/g,"");
    }

    /**
     * 添加自选股代码到localStorge
     */
    addToLocalStorge(code){
        if(code.match(/^00.*?/)){
            code = "s_sz"+code;
        }
        if(code.match(/^60.*?/)){
            code = "s_sh"+code;
        }
        //如果已经存在，则不添加
        var stockCode = localStorage[this.key];
        
        if(undefined != stockCode && stockCode.indexOf(code) > -1){
            return "";
        }

        if(undefined == stockCode || "" == stockCode){
            localStorage[this.key] = code;
        }else{
            localStorage[this.key] = stockCode + "," + code;
        }
    }

    /**
     * 移除localStorge中的自选股代码
     */
    removeStock(code) {
        //获取当前localStorge中的代码
        var stockCode = this.getCodeFromLocalStorge();
        console.log("修改前");
        console.log(stockCode);
        var reg = new RegExp("[a-z]_[a-z]{2}"+code,"g")
        stockCode = stockCode.replace(reg,'').replace(/(^,|,$)/g,"");
        //将修改后的股票代码添加到localStorge中
        localStorage[this.key] = stockCode;
        console.log("修改后");
        console.log(stockCode);
        //修改完渲染数据
        this.render();
    }

    /**
     * 获取数据
     * @return string
     */
    fetch(){
        var response = "";
        var code = this.getCodeFromLocalStorge();
        
        console.log(code);
        //自选股代码为空，返回空
        if("" == code){
            return "";
        }

        var timestamp = this.getTimestamp();
        var api = this.api + "rn=" + timestamp + "&list=" + code;
        console.log(api);

        var xhr = new XMLHttpRequest();
        xhr.open("GET", api, false);
        xhr.onreadystatechange = function() {
            if (4 == xhr.readyState) {
                console.log(xhr.responseText)
                response = xhr.responseText;
            }
        }
        xhr.send();
        return response;
    }

    /**
     * 格式化数据
     */
    formatData(data){      
        var data = data.split("\n")
        var list = {};
        for (var i = 0, length = data.length; i < length; i++){
            
            if("" != data[i]){
                //获取股票代码
                var code = data[i].match(/(\d{6})=/);
                //获取详细数据
                var detail = data[i].match(/=\"(.*?)\"/);
                //没有查询到数据，跳过;
                if (!detail[1] || !code[1]){
                    continue;
                }
                code = code[1];
                detail = detail[1];

                detail = detail.split(",")
                //京东方Ａ,5.78,-0.28,-4.62,15840922,944253
                //名称,现价，涨跌值,涨跌幅(百分比),成交量,成交额
                list[code] = detail;
            }
        }
        return list;
    }

    /**
     * 渲染数据
     */
    render(){
        //获取股票行情数据
        var stockList = this.fetch();
        //格式化数据
        var data = this.formatData(stockList);

        var html = "";
        for (var key in data) {
            console.log(key)
            var item = data[key];

            var name    = item[0];
            var now     = item[1];
            var change  = item[2];
            var rate    = item[3];

            //定义删除按钮
            var del = "<td><a data-action='delete' data-code='"+key+"' href='#'>删除</a></td>";
            var row = "<td>"+name+"</td><td>"+now+"</td><td>"+change+"</td><td>"+rate+"%</td>" + del;

            var style = 'color:red;';
            if(change < 0 ) {
                style = 'color:green;';
            }
            html += "<tr style="+style+">"+row+"</tr>";
        }
        $("#content").html(html);
    }
}