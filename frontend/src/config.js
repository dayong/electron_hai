export const base_url = process.env.NODE_ENV === "development" ? 'http://127.0.0.1:8000' : 'https://hds.sundayong.top'

// export const base_url = 'https://hds.sundayong.top'

export const map = {
    category:{
        '1': '普通公司',
        '2': '开发中客户',
        '3': '已签约客户'
    },
    level: {
        '1': '无',
        '2': '子公司',
        '3': '母公司'
    },
    city: {
        'bj': '北京',
        'sh': '上海',
        'sz': '深圳',
        'gz': '广州',
        'xa': '西安',
        'tj': '天津',
        'hz': '杭州',
        'wh': '武汉',
        'other': '其它'
    }
}