const RESUME_JSON_TEMP = {
    "basic_info": {
      "name": "张三",
      "gender": "女",
      "education": "本科",
      "nationality": "民族",
      "age": 32,
      "workExperienceYears": 10,
      "title": "高级全栈开发工程师",
      "email": "zhangsan@email.com",
      "phone": "13811112222",
      "location": "上海",
      "hometown_location": "陕西西安",
      "marital_status": "已婚",
      "personal_website": "zhangsan.dev",
      "summary": "拥有5年以上经验的全栈开发工程师，专注于构建可扩展的Web应用。精通React、Node.js和云原生技术。在优化系统性能方面有成功经验，曾将API响应速度提升50%。",
      "other_info":[]
    },
    "work_experience": [
      {
        "superior": "研发总监",
        "subordinate_count":"5人",
        "company": "上海科技有限公司",
        "position": "技术经理",
        "location": "中国，上海",
        "period": "2020年4月 - 至今",
        "responsibilities": [
          "领导一个5人前端团队，负责公司核心SaaS产品的设计与开发。",
          "使用React和TypeScript重构用户界面，将页面加载速度优化了40%。",
          "设计与开发RESTful和GraphQL微服务，日均处理百万级请求。",
          "实施CI/CD管道，将测试和部署流程自动化。",
          "指导 junior 工程师进行代码审查和技术决策。"
        ],
        "achievements": [
          "荣获2022年公司'年度杰出贡献奖'。",
          "主导的项目成功获得TechCrunch报道，为公司带来大量新用户。"
        ]
      }
    ],
    "education": [
      {
        "school": "北京大学",
        "degree": "工学学士",
        "major": "计算机科学与技术",
        "period": "2014年9月 - 2018年6月",
        "gpa": "3.8/4.0",
        "honors": [
          "校级优秀毕业生 (2018)",
          "国家奖学金 (2016)"
        ],
        "relevant_coursework": ["数据结构", "算法", "操作系统", "计算机网络", "数据库系统"]
      }
    ],
    "skills": {
      "technical": [
        {
          "category": "编程语言",
          "items": ["JavaScript (ES6+)", "TypeScript", "Python", "Java", "HTML5", "CSS3/SASS"]
        }
      ],
      "professional": ["团队领导", "项目管理", "敏捷开发", "解决问题", "有效沟通"]
    },

    "projects": [
      {
        "name": "企业级任务管理平台",
        "period": "2023年",
        "description": "一个仿Jira的任务管理与团队协作平台。实现了项目看板、任务分配、进度跟踪、实时通知等功能。",
        "technologies": ["React", "TypeScript", "NestJS", "PostgreSQL", "Socket.IO", "Docker"],
        "other_content": ""
      }
    ],

    "certifications": [
      {
        "name": "AWS认证解决方案架构师 - 助理",
        "issuer": "Amazon Web Services",
        "date": "2022年11月",
        "other_content": "",
      }
    ],

    "languages": [
      {
        "language": "中文",
        "proficiency": "母语"
      },
      {
        "language": "英语",
        "proficiency": "流利 (TOEFL 105)",

      }
    ],

    "awards": [
      {
        "title": "黑客马拉松一等奖",
        "issuer": "某开发者社区",
        "date": "2021年10月"
      }
    ],

    "volunteer_experience": [
      {
        "organization": "编程之美",
        "role": "技术导师",
        "period": "2019年 - 2020年",
        "description": "为非计算机专业的大学生提供编程入门指导。"
      }
    ]
  };


  module.exports = {
    RESUME_JSON_TEMP
};

