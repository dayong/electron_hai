import React, { useState, useEffect }  from 'react';
import { Space, Table, Input, Button, Popconfirm, message, Modal, Select, Radio, Grid, Col, Row, List } from 'antd';

import { SearchOutlined } from '@ant-design/icons';

import { base_url } from '../../config'

import axios from "axios";



function App() {
    const [open, setOpen] = useState(false);

    const [loading, setLoading] = useState(false);

    const [resumes, setResumes] = useState([]);

    const [positions, setPositions] = useState([]);

    const [str, setStr] = useState('');

    const [resume_id, set_resume_id] = useState('');

    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        total: 0,
      });

    const [filters, setFilters] = useState({});

    const [currentPdf, setCurrentPdf] = useState('');

    const [messageApi, contextHolder] = message.useMessage();
    const info = (msg) => {
        messageApi.info(msg);
    };


    const showLoading = () => {
        setOpen(true);
        setLoading(true);
        // Simple loading mock. You should add cleanup logic in real world.
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      };


    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            // render: text => <a>{text}</a>,
          },
          {
            title: '姓名',
            dataIndex: 'name',
            key: 'name',
            // render: text => <a>{text}</a>,
          },
          {
            title: '电话',
            dataIndex: 'phone',
            key: 'phone',
            // render: text => <a>{text}</a>,
          },
      {
        title: '路径',
        dataIndex: 'file_path',
        key: 'file_path',
        render: (_, record) => {
            let arr = _.split('/');
            let text = arr[arr.length-1];
            return (
                <div style={{width:80}}>{text}</div>
            )
        }
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
      },
      {
        title: 'is_parse',
        dataIndex: 'is_parse',
        key: 'is_parse',
      },
    //   {
    //       title: '简介',
    //       dataIndex: 'resume_text',
    //       key: 'resume_text',
    //       render: function(_, record){
    //         return (
    //             <div>{_ && _.substring(0,100)}</div>
    //         )
    //       }
    //   },
      {
          title: '导入时间',
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
            <Button danger size="small">
                ...
            </Button>
          </Popconfirm>
          <Button danger type="link" size="small" onClick={() => handleView(record)}>
                详细
            </Button>
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



    const fetchResumes = async (params) => {
        setLoading(true)
        console.log('fetchResumes', params)
        setStr(JSON.stringify(params))
        // const { current = 1, pageSize = 10, ...filters } = params;

        try {
          const {data, total, page} = await window.api.getResumes(params);

          console.log(67, data, total, page)

          setResumes(data);

          setPagination({
            page,
            pageSize:10,
            total,
          });

        } catch (err) {
         
          console.error('获取简历列表失败:', err);
        } finally {
            setLoading(false);
        }
      };

      useEffect(() => {
        fetchResumes({
            page: 1,
            pageSize: 10
        });
      }, []);

      const handleTableChange = function(page, pageSize){
         fetchResumes({page,pageSize, ...filters})
      }

      const handleSearch = function(newFilters){
        setFilters(newFilters);
      }

      const renderList = async function(id = ''){
        console.log('resume_id', id)
        var f_resume_id = id || resume_id;
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        setPositions([])

        
        try {
            let res = await axios.get(
                `${base_url}/member/find_position`,
                {
                    params: {
                        'use_owner_id': true
                    },  // 查询参数放在这里
                    headers: {
                        'Authorization': `${token}`
                    }
                }
            );

            console.log(210,resume_id, res.data);

            res.data.list.forEach(function(item, index){
                
                var company = item.company_id.split('|')[1];
                console.log(23123123, company)

                res.data.list[index]['company'] = company;

                if(item.resumes && Array.isArray(item.resumes)){
                    var isExceting = item.resumes.some((resume)=>{
                        return resume.id == f_resume_id;
                    }); 
                    if(isExceting){
                        res.data.list[index]['isExceting'] = true
                    }
                }
            });

            console.log(237, res.data.list)

            setPositions(res.data.list);

        

        } catch (err) {
        
        console.error('获取雇员列表失败:', err);
        } finally {
            setLoading(false);
        }
      }

      const handleView = async function(record){
            // console.log(1751, record)
            const {server_id }= record;

            console.log(188, server_id)

            set_resume_id(server_id);

            // var result = await window.api.readPdfFile(record.file_path);
            const base64Data = await window.api.readPdfFile(record.file_path);
            // console.log(180, base64Data)
            const blob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            // document.querySelector("#pdfViewer").src = url;

            console.log(183, url)


            renderList(server_id)






            setCurrentPdf(url);
            setOpen(true);
      }

      const intoItem = async function(item){
            console.log(item, resume_id)
            addItemToCompany({
                item_id: item._id,
                resume_id
            })
      }

     



      const addItemToCompany = async (params) => {
        console.log('addItemToCompany', params)

        const { item_id, resume_id} = params;

        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        
        try {
            let res = await axios.post(
                `${base_url}/member/add_resume_to_company`,
                {item_id, resume_id},
                {
                    headers: {
                        'Authorization': `${token}`
                    }
                }
            );

          console.log(263, res.data)

          renderList()


        } catch (err) {
            console.error('添加失败:', err);
        } finally {
            setLoading(false);
        }
      };

   
      
    

      const style = { background: '#0092ff', padding: '8px 0' };

      

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
            onClick={() => fetchResumes({ ...pagination, ...filters })}
        >
            搜索
        </Button>
        </div>
 
        <Table loading={loading} rowKey="id" columns={columns} dataSource={resumes} pagination={{...pagination,showQuickJumper: true, onChange:handleTableChange}} />


        <Modal width="95%" height="80%"
        title={<p>{resume_id}</p>}
        footer={
          <Button type="primary" onClick={showLoading}>
            Reload
          </Button>
        }
        loading={loading}
        open={open}
        onCancel={() => setOpen(false)}>
        

        <div>
        <Row gutter={16}>
            <Col className="gutter-row" span={12}>
                <div style={style}>
                    <embed src={currentPdf}  id="pdfViewer" type="application/pdf" width="100%" height="600px" />
                </div>
            </Col>
            <Col className="gutter-row" span={12}>
            <div>
                <h3>项目信息</h3>
                <List
                    itemLayout="horizontal"
                    dataSource={positions}
                    renderItem={(item, index) => (
                    <List.Item>
                        <List.Item.Meta
                        title={<div><a href="">{'职位:' + item.name+' | 需求人数: '+item.count +' | '+ item.company}</a><br />
                        
                        {item.isExceting ? '当前简历已加入' : (<Button type="primary" size="small" onClick={() => intoItem(item)}>
                        --简历加入到该项目
                        </Button>)
                        }
                      
                      </div>}
                        description=""
                        />
                    </List.Item>
                    )}
                />
            </div>
            </Col>
        </Row>
            
        </div>

        

        

        


      </Modal>
       </div>
      )
}


export default App;