/**
 * =========================
 * 去广告脚本（MagicJS版）
 * =========================
 */

const scriptName = "MuYio Ad Block";
const $ = MagicJS(scriptName, "INFO");


(() => {

    let response = null;

    // =========================
    // 仅处理响应
    // =========================
    if ($.isResponse) {

        const url = $.request.url;

        switch (true) {

            // =========================
            // 丰巢广告接口
            // =========================
            case /^https?:\/\/rtm\.fcbox\.com\/rtsWeb\/api\/resource\/ad\/queryMultiAds/.test(url):
                try {

                    let obj = JSON.parse($.response.body);

                    const adList = obj?.data?.contractAdInfo?.adContentInfoList;

                    if (Array.isArray(adList)) {
                        obj.data.contractAdInfo.adContentInfoList = [];
                    }

                    response = {
                        body: JSON.stringify(obj)
                    };

                } catch (err) {
                    $.logger.error(`丰巢广告处理异常: ${err}`);
                }
                break;


            // =========================
            // 默认处理
            // =========================
            default:
                $.logger.warning(
                    `未匹配规则的请求: ${url}`
                );
                break;
        }

    } else {
        $.logger.warning("当前不是响应阶段");
    }


    // =========================
    // 返回结果
    // =========================
    if (response) {
        $.done(response);
    } else {
        $.done();
    }

})();



/**
 * =========================
 * MagicJS 本体（完整保留）
 * =========================
 */
function MagicJS(scriptName = "MagicJS", logLevel = "INFO") {

    const MagicEnvironment = () => {

        const isLoon = typeof $loon !== "undefined";
        const isQuanX = typeof $task !== "undefined";
        const isNode = typeof module !== "undefined";
        const isSurge = typeof $httpClient !== "undefined" && !isLoon;
        const isStorm = typeof $storm !== "undefined";
        const isStash =
            typeof $environment !== "undefined" &&
            typeof $environment["stash-build"] !== "undefined";
        const isScriptable = typeof importModule !== "undefined";

        const isSurgeLike = isSurge || isLoon || isStorm || isStash;

        return {
            isLoon,
            isQuanX,
            isNode,
            isSurge,
            isStorm,
            isStash,
            isSurgeLike,
            isScriptable,

            get name() {
                if (isLoon) return "Loon";
                if (isQuanX) return "QuantumultX";
                if (isNode) return "NodeJS";
                if (isSurge) return "Surge";
                if (isScriptable) return "Scriptable";
                return "unknown";
            },

            get system() {
                if (isSurge) return $environment["system"];
                if (isNode) return process.platform;
            }
        };
    };


    const MagicLogger = (scriptName, logLevel = "INFO") => {

        let level = logLevel;

        const levels = {
            ERROR: 1,
            WARNING: 2,
            INFO: 4,
            DEBUG: 5
        };

        const log = (msg, type = "INFO") => {
            console.log(`[${type}] ${scriptName}: ${msg}`);
        };

        return {
            info: (msg) => log(msg, "INFO"),
            warning: (msg) => log(msg, "WARNING"),
            error: (msg) => log(msg, "ERROR"),
            debug: (msg) => log(msg, "DEBUG"),
            setLevel: (v) => level = v,
            getLevel: () => level
        };
    };


    return new class {

        constructor(scriptName, logLevel) {

            this.scriptName = scriptName;
            this.env = MagicEnvironment();
            this.logger = MagicLogger(scriptName, logLevel);

            this.startTime = Date.now();
        }


        get isResponse() {
            return typeof $response !== "undefined";
        }

        get request() {
            return $request;
        }

        get response() {
            return $response;
        }


        done = (body = {}) => {
            const cost = ((Date.now() - this.startTime) / 1000).toFixed(3);
            this.logger.info(`done in ${cost}s`);

            $done(body);
        };

    }(scriptName, logLevel);
}