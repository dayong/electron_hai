import React, { useState, useEffect } from "react";
import { Space, Table, Input, Button, Popconfirm, message } from "antd";
import { useNavigate, Link, useOutletContext } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";

import axios from "../../api/axios";

import { map, base_url } from "../../config";

function PositionList() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [str, setStr] = useState("");
    const navigate = useNavigate();
    const { currentUser } = useOutletContext();
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        total: 0
    });

    const [filters, setFilters] = useState({});

    const [messageApi, contextHolder] = message.useMessage();
    const info = msg => {
        messageApi.info(msg);
    };

    const view_detail = function(id) {
        navigate(`/position_detail/${id}`);
    };

    const columns = [
        {
            title: "职位",
            dataIndex: "name",
            key: "name"
        },
        {
            title: "数量",
            key: "count",
            dataIndex: "count"
        },
        {
            title: "工作地点",
            key: "city",
            render: (_, record) => <div>{map.city[record.city]}</div>
        },
        {
            title: "候选人数",
            key: "houxuanren",
            render: (_, record) => (
                <div>( {record.resumes && record.resumes.length} )</div>
            )
        },

        {
            title: "所属公司",
            key: "company_id",
            render: (_, record) => <div>{record.company_id.split("|")[1]}</div>
        },
        {
            title: "参与人",
            key: "owner",
            render: (_, record) => (
                <div>
                    {record.owner.map(value => value.split("|")[1]).join("\n")}
                </div>
            )
        },
        {
            title: "创建者",
            dataIndex: "author",
            key: "author"
        },
        {
            title: "创建时间",
            dataIndex: "created_at",
            key: "created_at"
        },

        {
            title: "操作",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    {contextHolder}
                    <a onClick={() => view_detail(record._id)}>查看</a>
                    {currentUser === record.author && (
                        <a onClick={() => handleDelete(record._id)}>删除</a>
                    )}
                </Space>
            )
        }
    ];

    // 删除回调
    const handleDelete = async record => {
        console.log("要删除的记录:", record);
        // const result = await window.api.delPosition(record["id"]);

        console.log(100, result);

        info("移除成功！");
        fetchPosition({ ...pagination, ...filters });
    };

    const fetchPosition = async params => {
        setLoading(true);
        console.log("fetchResumes", params);
        setStr(JSON.stringify(params));

        // const { page = 1, pageSize = 10, ...filters} = params;

        // const token = localStorage.getItem('token');
        // if (!token) {
        //   navigate('/login');
        //   return;
        // }
        console.log(128);

        try {
            let res = await axios.get(`/member/find_position`, {
                params // 查询参数放在这里
            });

            console.log(138, res.data);

            const { page, total, pageSize } = res.data;

            setList(res.data.list);

            setPagination({
                page,
                pageSize,
                total
            });
        } catch (err) {
            console.error("获取职位列表失败:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log(129, map);

        fetchPosition({
            page: 1,
            size: 10
        });
    }, []);

    const handleTableChange = function(page, pageSize) {
        fetchEmployee({ page, pageSize, ...filters });
    };

    const handleSearch = function(newFilters) {
        console.log("newFilters", newFilters);
        setFilters(newFilters);
    };

    return (
        <div>
            {/* 搜索栏 */}
            <div
                style={{
                    marginBottom: "16px",
                    display: "flex",
                    gap: "16px",
                    flexWrap: "wrap"
                }}
            >
                <Input
                    placeholder="关键字"
                    style={{ width: 250 }}
                    onChange={e =>
                        handleSearch({ ...filters, keys: e.target.value })
                    }
                />
                <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={() => fetchEmployee({ ...pagination, ...filters })}
                >
                    搜索
                </Button>
            </div>

            <Table
                loading={loading}
                rowKey="id"
                columns={columns}
                dataSource={list}
                pagination={{
                    ...pagination,
                    showQuickJumper: true,
                    onChange: handleTableChange
                }}
            />
        </div>
    );
}

export default PositionList;
