import React, { useState, useEffect } from "react";
import {Form, Input, Button,  Layout, Radio } from "antd";

const { TextArea } = Input;

import axios from "axios";

const { Content } = Layout;


function App() {
 
    const [form1] = Form.useForm();


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        


    }, []);


    const onFinish = async values => {
        console.log('onFinish', values);
       
        const {category, name, about, other, level, addr} = values;

        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        try{
            let res = await axios.post(
                "http://127.0.0.1:8000/member/add_company",
                { "category": category || 1, name, about, other, "level": level || 1, addr },
                {
                    headers: {
                        'Authorization': `${token}`
                    }
                }
            );

            
    
            console.log(53, res);
    
            if(res.data.message == '创建成功'){
                alert('创建成功')
            }
            
    
            
        }catch(e){
            console.log(62, e);

            
        }
        
    };

    const onChange = (value) => {

    }

    const onChange1 = (value) => {

    }

    const layout = {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
    };

    


  return (
          <Content style={{ background: "#fff", padding: 20 ,height: "100vh",width:"100%"}}>
            <Form
                {...layout}
                name="nest-messages"
                onFinish={onFinish}
                style={{ maxWidth: 600 }}
            >

            <Form.Item
                name='category'
                label='客户类型'
                
                >
                    <Radio.Group
   
                        defaultValue={1}
                        options={[
                        { value: 1, label: '普通公司' },
                        { value: 2, label: '开发中客户' },
                        { value: 3, label: '已签约客户' }
                        ]}
                    />
                </Form.Item>
                <Form.Item
                name='name'
                label="公司名称"
                rules={[
                    { required: true, message: "请输入公司名！" }
                ]}
                >
                    <Input placeholder="公司名称"  />
                </Form.Item>

                <Form.Item
                name='about'
                label="公司介绍"
                >
                    <TextArea
                        showCount
                        maxLength={100}
                        onChange={onChange}
                        placeholder="公司介绍"
                        style={{ height: 120, resize: 'none' }}
                        />
                </Form.Item>

                <Form.Item
                name='other'
                label="公司福利"
                >
                    <TextArea
                        showCount
                        maxLength={100}
                        onChange={onChange1}
                        placeholder="公司福利"
                        style={{ height: 120, resize: 'none' }}
                        />
                </Form.Item>



                <Form.Item
                name='level'
                label='子/母公司'
                >
                    <Radio.Group
                        defaultValue={1}
                        options={[
                        { value: 1, label: '无' },
                        { value: 2, label: '子公司' },
                        { value: 3, label: '母公司' }
                        ]}
                    />
                </Form.Item>


                <Form.Item
                name='addr'
                label="公司地址"
                >
                    <Input placeholder="公司地址"  />
                </Form.Item>


                

                

              

                <Form.Item label={null}>
                <Button type="primary" htmlType="submit">
                    提交
                </Button>
                </Form.Item>
            </Form>
          </Content>
  );
}

export default App;
