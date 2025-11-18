// 项目详情

import React, { useState, useEffect }  from 'react';
import { Space, Table, Input, Button, message, Form, InputNumber } from 'antd';
import { useNavigate, Link, useParams } from "react-router-dom";
import { SearchOutlined } from '@ant-design/icons';
import axios from "axios";

import map from '../../config'

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

function App() {
    const { positionID } = useParams();
    const [form] = Form.useForm();
    

    const [list, setList] = useState([]);

    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    

    const [filters, setFilters] = useState({});

    const [messageApi, contextHolder] = message.useMessage();
    const info = (msg) => {
        messageApi.info(msg);
    };

    const view_detail = function(){
        alert(111)
    }


    


    const columns = [
            {
                title: 'id',
                dataIndex: 'id',
                key: 'id'
            },
            {
                title: 'status',
                dataIndex: 'status',
                key: 'status'
            },
  
      {
        title: '操作',
        key: 'action',
        render: (_, record) => (
          <Space size="middle">
            {contextHolder}
            <a onClick={view_detail}>查看</a>
          </Space>
        ),
      },
    ];

    // 删除回调
  const handleDelete = async (record) => {
    console.log("要删除的记录:", record);
    const result = await window.api.delResume(record["id"]);

    console.log(100, result)
    // setResumes(resumes.filter((item) => item.id !== record.id)); // 前端删除
    info('移除成功！')
    fetchResumes({...pagination,...filters});
  };


 //   查询项目详情
 const fetchPosition = async (params) => {
    setLoading(true)
    // const { page = 1, pageSize = 10, ...filters} = params;

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    
    try {
        let res = await axios.get(
            "http://127.0.0.1:8000/member/find_one_position",
            {
                params,  // 查询参数放在这里
                headers: {
                    'Authorization': `${token}`
                }
            }
        );

      console.log(67, res.data)

    //   set_default_value(res.data)

      const {name, city, count, created_at, jd, jr, process, author, author_id, owner, resumes} = res.data;

      console.log(149, name, resumes, owner)

      form.setFieldsValue({
        name,
        city,
        count,
        created_at,
        jd,
        jr,
        author,
        process
      });

      var f_resumes = []

      console.log(128, resumes.length, resumes)

      resumes.forEach(async function(resume){
        console.log(131, resume)
        try{
            var resume_info = await axios.get(
                "http://127.0.0.1:8000/member/find_one_resume",
                {
                    params:{
                        '_id': resume.id
                    },  // 查询参数放在这里
                    headers: {
                        'Authorization': `${token}`
                    }
                }
            );

            var author_info = await axios.get(
                "http://127.0.0.1:8000/member/find_one_author",
                {
                    params:{
                        '_id': resume.author_id
                    },  // 查询参数放在这里
                    headers: {
                        'Authorization': `${token}`
                    }
                }
            );

            console.log(150, resume_info, author_info)
        }catch(e){

        }
        



      });

    


    setList(resumes);

    //   setPagination({
    //     page,
    //     pageSize,
    //     total
    //   });

    } catch (err) {
     
      console.error('获取职位列表失败:', err);
    } finally {
        setLoading(false);
    }


  };

      useEffect(() => {
        console.log(129, map)

       

        fetchPosition({
            _id: positionID
        });


      }, []);

      const handleTableChange = function(page, pageSize){
         fetchEmployee({page,pageSize, ...filters})
      }

      const handleSearch = function(newFilters){
          console.log('newFilters', newFilters)
        setFilters(newFilters);
      }

      const onFinish = function(values){

      }

      


      
    

      
    //   jd, jr, process, author, author_id, owner, resumes
      

    return (
        <div>
        {/* 搜索栏 */}
        <div style={{ marginBottom: '16px',  gap: '16px', flexWrap: 'wrap' }}>
            <h2>项目详情</h2>
       <Form
            {...layout}
            name="nest-messages"
            onFinish={onFinish}
            form={form}
             style={{ maxWidth: 600 }}
        >
            <Form.Item name="name" label="项目名称" >
                <Input />
            </Form.Item>
            <Form.Item name="city" label="工作地点" >
                <Input />
            </Form.Item>
            <Form.Item name="count" label="招聘人数" >
                <InputNumber />
            </Form.Item>
            <Form.Item name="created_at" label="创建时间">
                <Input />
            </Form.Item>
            <Form.Item name="jd" label="岗位需求">
                <Input.TextArea />
            </Form.Item>
            <Form.Item name="jr" label="岗位职责">
                <Input.TextArea />
            </Form.Item>
            <Form.Item name="process" label="面试流程">
                <Input.TextArea />
            </Form.Item>
            <Form.Item name="author" label="创建者">
                <Input />
            </Form.Item>
            {/* <Form.Item label={null}>
            <Button type="primary" htmlType="submit">
                Submit
            </Button>
            </Form.Item> */}
        </Form>

        

        </div>
        <Table loading={loading} rowKey="id" columns={columns} dataSource={list}  />
       </div>
      )
}


export default App;