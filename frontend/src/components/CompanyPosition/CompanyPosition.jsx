import React, { useState, useEffect }  from 'react';
import { Space, Table, Input, Button, Popconfirm, message } from 'antd';
import { useNavigate, Link } from "react-router-dom";
import { SearchOutlined } from '@ant-design/icons';
import axios from "axios";

import {map, base_url} from '../../config'

function App() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [str, setStr] = useState('');
    const navigate = useNavigate();
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        total: 0,
      });

    const [filters, setFilters] = useState({});

    const [messageApi, contextHolder] = message.useMessage();
    const info = (msg) => {
        messageApi.info(msg);
    };


    const columns = [
            {
                title: '公司名称',
                dataIndex: 'name',
                key: 'name'
            },
            {
                title: '客户类型',
                key: 'category',
                render: (_, record) => (
                  <div>{map.category[record.category]}</div>
                ),
              },
              {
                title: '子/母公司',
                key: 'level',
                render: (_, record) => (
                  <div>{map.level[record.level]}</div>
                ),
              },
              {
                title: '拥有者',
                dataIndex: 'author',
                key: 'author'
            },
            {
                title: '创建时间',
                dataIndex: 'created_at',
                key: 'created_at'
            },
  
      {
        title: '操作',
        key: 'action',
        render: (_, record) => (
          <Space size="middle">
              {contextHolder}
            <Popconfirm
                title="确定要删除吗？"
                onConfirm={() => handleDelete(record)}
                okText="确定"
                cancelText="取消"
            >
            
                -
            
          </Popconfirm>
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



    const fetchEmployee = async (params) => {
        setLoading(true)
        console.log('fetchResumes', params)
        setStr(JSON.stringify(params))

        // const { page = 1, pageSize = 10, ...filters} = params;

        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        
        try {
            let res = await axios.get(
                `${base_url}/member/find_company`,
                {
                    params,  // 查询参数放在这里
                    headers: {
                        'Authorization': `${token}`
                    }
                }
            );

          console.log(67, res.data)

          const {page, total, pageSize} = res.data;

          setList(res.data.list);

          setPagination({
            page,
            pageSize,
            total
          });

        } catch (err) {
         
          console.error('获取雇员列表失败:', err);
        } finally {
            setLoading(false);
        }
      };

      useEffect(() => {
        console.log(129, map)

        fetchEmployee({
            page: 1,
            size: 10
        });
      }, []);

      const handleTableChange = function(page, pageSize){
         fetchEmployee({page,pageSize, ...filters})
      }

      const handleSearch = function(newFilters){
          console.log('newFilters', newFilters)
        setFilters(newFilters);
      }


      
    

      

      

    return (
        <div>
        {/* 搜索栏 */}
        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <Input
            placeholder="关键字"
            style={{ width: 250 }}
            onChange={(e) => handleSearch({ ...filters, keys: e.target.value })}
        />
        <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => fetchEmployee({ ...pagination, ...filters })}
        >
            搜索
        </Button>
        </div>
 
        <Table loading={loading} rowKey="id" columns={columns} dataSource={list} pagination={{...pagination,showQuickJumper: true, onChange:handleTableChange}} />
       </div>
      )
}


export default App;