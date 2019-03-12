/**
 * Created by Skiychan on 02/11/2016.
 */
$(function () {
    let myUrl = window.location.href;
    let allCount = 0;
    let doCount = 0;
    let g_user_code = ''; //code
    let g_user_url = ''; //space

    let errMid = [];

    //获取用户空间地址 和 用户码
    $("val[data-name^='g_user']").each(function(i) {
        const that = $(this);
        if (that.data('name') == 'g_user_url') {
            g_user_url = that.data('value');
        } else if (that.data('name') == 'g_user_code') {
            g_user_code = that.data('value');
        }
     });

     console.log(g_user_code, g_user_url);
    if (g_user_code == '') {
        console.log('未登录');
        return false;
    }

    if (myUrl.indexOf('https://my.oschina.net/') !== 0) {
        window.location.href = g_user_url;
        return false;
    }

    if (myUrl == '') {
        console.log('获取用户空间失败');
        return false;
    }

    //自动触发删除功能
    var auto = getQueryString('auto');
    if ((auto != undefined) && (auto == 'true')) {
        //console.log("auto");
        doDelete();
    }

    //所有操作的总次数
    var count = getQueryString('count');
    if (count != undefined) {
        allCount = parseInt(count);
    }

    //添加按键内置到OSChina
    var doDeleteHtml = "<div id='do-delete-all'>手动清空</div>"
    $('body').append(doDeleteHtml);

    /**
     * 操作删除
     */
    function toDelete() {
        var midArr = [];

        //动弹列表，取 id
        var feedList = $('.tweet-item');
        $.each(feedList, function (i, o) {
            var myMid = $(o).data('tweet-id');
            if (myMid!= undefined) {
                midArr.push(myMid);
            }
        });

        //当前页取不到数据，刷新当前页
        if (midArr.length == 0) {
            window.location.reload();
        }
        //console.log(midArr);

        const deleteUrl = myUrl + '/tweet/deleteTweet';
        const midLen = midArr.length;

        $.each(midArr, function (i, v) {
            const data = {
                user_code: g_user_code,
                id: v,
            };

            $.ajax({
                url: deleteUrl,
                type: "POST",
                data: data,
                dataType: "JSON",
                timeout: 5000,
                success: function (d) {
                    doCount ++;

                    if ((d.code == 100000) || (d.code == 100001)) {
                        allCount ++;
                        //console.log('success');
                    } else {
                        //添加错误id
                        errMid.push(v);
                        //console.log(d.code);
                    }

                    //展示结果
                    if (doCount == midLen) {
                        showResert();
                    }
                    //show_result();
                },
                error: function(d) {
                    //已执行次数
                    doCount ++;
                    //添加错误id
                    errMid.push(v);
                    if (doCount == midLen) {
                        showResert();
                    }
                }
            })
        });

    }

    //手动隐藏
    $('#do-delete-all').on('click', function() {
        doDelete();
   });

    /**
     * 转跳到底部，且 15s 后开始设置隐藏
     * @return {[type]} [description]
     */
    function doDelete() {
        goBottom();
        setTimeout(toDelete, 15000);
    }

    /**
     * 显示结果
     * @return {[type]} [description]
     */
    function showResert() {
        console.log('allCount', allCount);
        const msg = "成功处理: " + doCount + " 条\r\n" + "错误信息: " + errMid.length + "条\r\n";
        console.log(msg);

        window.location.reload();
        /*
        if (confirm(msg)) {
            window.location.reload();
        } else {
            console.log("取消转跳");
        }*/
    }

    /**
     * 划动至底部 (懒加载完所有数据)
     * @return {[type]} [description]
     */
    function goBottom() {
        //++i;
        if ($(window).scrollTop() < $(document).height() - $(window).height()){
            $('html, body').animate({scrollTop: $(document).height()}, 0, 'swing', function() {
                //console.log(i);
                setTimeout(goBottom, 5000);
                //goBottom();
                return;
            }); 
            return;
        }
    }

});

/**
 * 获取url
 * @param name
 * @returns {*}
 */
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return (r[2]);
    }
    return null;
}