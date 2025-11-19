const base_url = process.env.NODE_ENV === "development" ? 'http://127.0.0.1:8000' : 'https://hds.sundayong.top'

export default {
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
        'gz': '广州'
    }, 
    "base_url":base_url
}