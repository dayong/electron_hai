import React, { useState, useEffect }  from 'react';
import { Space, Table, Input, Button, Popconfirm, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';


function App() {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [str, setStr] = useState('');
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
      {
          title: '简介',
          dataIndex: 'resume_text',
          key: 'resume_text',
          render: function(_, record){
            return (
                <div>{_ && _.substring(0,100)}</div>
            )
          }
      },
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
                移除
            </Button>
          </Popconfirm>
          <Button danger size="small">
                加入看板
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
       </div>
      )
}


export default App;