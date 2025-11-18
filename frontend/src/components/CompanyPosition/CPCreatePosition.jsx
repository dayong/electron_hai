import React, { useState, useEffect } from "react";
import {Form, Input, Button,  Layout, Select } from "antd";

import axios from "axios";

const { Content } = Layout;


function App() {
    const [options, setOptions] = useState([{value:'', label: '请选择'}]);
    const [owner_options, setOwner_options] = useState([{value:'', label: '请选择'}]);

    const [token, setToken] = useState(localStorage.getItem('token'));
    const [form1] = Form.useForm();


    useEffect(() => {
        if (!token) {
          navigate('/login');
          return;
        }

        async function find_company(){
            try{
                let res = await axios.get(
                    "http://127.0.0.1:8000/member/find_company",
                    
                    {
                        params: {"author_id":1},
                        headers: {
                            'Authorization': `${token}`
                        }
                    }
                );
        
                console.log(37, res.data);
                let list;
        
                if(res.data.message == 'success'){
                    console.log(res.data.list)
                    list = res.data.list.map(value => {
                        return {'label': value.name, 'value':value._id + '|' + value.name}
                    });
                    console.log(43, list)
                  setOptions(list)
                }
                
        
                
            }catch(e){
                console.log(51, e);
    
                
            }
        }

        async function find_employee(){
            try{
                let res = await axios.get(
                    "http://127.0.0.1:8000/member/find_employee",
                    
                    {
                        // params: {"author_id":1},
                        headers: {
                            'Authorization': `${token}`
                        }
                    }
                );
        
                console.log(70, res.data);
                let list;
        
                if(res.data.message == 'success'){
                    console.log(res.data.list)
                    list = res.data.list.map(value => {
                        return {'label': value.username||value.email, 'value':value._id + '|' + (value.username||value.email)}
                    });
                    console.log(78, list)
                    setOwner_options(list)
                }
                
        
                
            }catch(e){
                console.log(85, e);
    
                
            }
        }

        find_company();

        find_employee();


        

        // //获取用户信息
        // const fetchUser = async () => {
        //     try {
        //         let res = await axios.get("http://127.0.0.1:8000/member/find_member",{
        //             headers: {
        //                 'Authorization': `${token}`
        //             }
        //         });
        //         console.log(81, res.data);

        //         if(res.data.msg == 'login success'){
        //             setEmail(res.data.email)
        //         }

        //     } catch (err) {
        //         console.log(25, err);
        //         navigate("/login");
        //     } finally {
              
        //     }
        //   };
        


        // fetchUser();


    }, []);


    const onFinish = async values => {
        console.log(77777, values);
        const {name, company_id, jd, city, count, owner, jr, process} = values;

        if (!token) {
          navigate('/login');
          return;
        }


        try{
            let res = await axios.post(
                "http://127.0.0.1:8000/member/add_position",
                { name, company_id, jd, city, count, owner, jr, process },
                {
                    headers: {
                        'Authorization': `${token}`
                    }
                }
            );

            
    
            console.log(151, res);
    
            if(res.data.message == '创建成功'){
                alert('创建成功')
            }
            
    
            
        }catch(e){
            console.log(25, e);

            
        }
        
    };

    const onChange = value => {
        console.log(91, value)

    }

    const onSearch = value => {
        console.log(95, value)
    }

    const onFocus = value => {
        console.log('onFocus')
    }


    const layout = {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
    };

    const city_options = [
        {'value':'bj','label':'北京'},
        {'value':'sh','label':'上海'},
        {'value':'sz','label':'深圳'},
        {'value':'gz','label':'广州'}
    ]



    


  return (
          <Content style={{ background: "#fff", padding: 20 ,height: "100vh",width:"100%"}}>
            <Form
                {...layout}
                name="nest-messages"
                onFinish={onFinish}
                style={{ maxWidth: 600 }}
            >
                <Form.Item
                label="职位名称"
                name="name"
                rules={[
                  { required: true, message: "请输入职位名称！" },
                  
                ]}
              >
              <Input placeholder="职位名称"
                />
                  </Form.Item>
                <Form.Item
                name='company_id'
                label="客户"
                rules={[
                    { required: true, message: "请选择客户！" }
                ]}
                >
                    <Select
                        showSearch
                        placeholder="请选择客户"
                        optionFilterProp="label"
                        onChange={onChange}
                        onSearch={onSearch}
                        options={options}
                    />
                </Form.Item>

                <Form.Item
                label="职位描述"
                name="jd"
                rules={[
                  { required: true, message: "请输入职位描述！" }
                ]}
              >
                <Input.TextArea
                  placeholder="职位描述"
                />
              </Form.Item>

              <Form.Item
                label="城市"
                name="city"
                rules={[
                  { required: true, message: "请选择城市！" },
                  
                ]}
              >
                <Select
                        showSearch
                        placeholder="请选择城市"
                        optionFilterProp="label"
                        onChange={onChange}
                        onSearch={onSearch}
                        options={city_options}
                    />
              </Form.Item>
              <Form.Item
                label="数量"
                name="count"
                rules={[
                  { required: true, message: "请输入职位数量！" },
                  
                ]}
              >
              <Input placeholder="职位数量"
                />
              </Form.Item>
              <Form.Item
                label="参与人"
                name="owner"
                rules={[
                  { required: true, message: "请选择参与人！" },
                  
                ]}
              >
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="请选择参与人"
                // defaultValue={['a10', 'c12']}
                onChange={onChange}
                onFocus={onFocus}
                options={owner_options}
              />
              </Form.Item>

              <Form.Item
                label="任职要求"
                name="jr"
              >
                <Input.TextArea
                  placeholder="任职要求"
                />
              </Form.Item>

              <Form.Item
                label="面试流程"
                name="process"
              >
                <Input.TextArea
                  placeholder="面试流程"
                />
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
