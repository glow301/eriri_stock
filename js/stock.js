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
        //搜索建议api
        this.suggestApi = "http://suggest.sinajs.cn/suggest/";
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
     * 输入时搜索建议
     */
    getSuggest(code){
        var query = {
            type:"",
            key:code,
            name:"suggestdata_" + this.getTimestamp()
        }
        var api = this.suggestApi + this.buildQuery(query);

        try{
            var response = this.requestSync(api);
            var data = response.match(/=\"(.*?)\"/)[1].split(";");
            var list = [];
            for(var i = 0; i < data.length; i++){
                var item = data[i].split(",");
     
                list.push({
                    code:item[2],
                    name:item[4]
                })
            }
        }catch(e){
            return [];
        }
        return list;
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
    }

    /**
     * 通过接口同步获取数据
     * @param api   string     请求接口地址
     */
    requestSync(api){
        var response = "";
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
     * 构建查询querystring
     * @param   object  传入参数对象
     * @return  string  构建好的querystring
     */
    buildQuery(obj){
        var query = [];
        for (var key in obj) {
            query.push(key + "=" + obj[key])
        }
        return query.join("&");
    }

    /**
     * 获取数据
     * @return string
     */
    fetch(){
        var code = this.getCodeFromLocalStorge();
        
        //自选股代码为空，返回空
        if("" == code){
            return "";
        }

        var query = {
            rn:this.getTimestamp(),
            list:code
        }
        var api = this.api + this.buildQuery(query);
        return this.requestSync(api);
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
            var row = "<td data-action='open'>"+key+"</td><td data-action='open'>"+name+"</td><td>"+now+"</td><td>"+change+"</td><td>"+rate+"%</td>" + del;

            var style = 'color:red;';
            if(change < 0 ) {
                style = 'color:green;';
            }
            html += "<tr data-code='"+key+"' style="+style+">"+row+"</tr>";
        }
        $("#content").html(html);
        this.addNotice();
    }

     /**
      * 增加提示信息
      */
      addNotice() {
          var notice = "点击代码或名称查看详细信息";
          $("#notice").text(notice);
      }
}