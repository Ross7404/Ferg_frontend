import { Pagination, Select } from "antd";

const PaginationDefault = ({ 
    current, 
    total, 
    pageSize, 
    onChange, 
    showSizeChanger,
    pageSizeOptions = [5, 10, 15]
}) => {
    // Calculate items being displayed
    const startItem = (current - 1) * pageSize + 1;
    const endItem = Math.min(current * pageSize, total);

    return (
        <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
                <span className="text-[var(--text-secondary)]">Rows per page:</span>
                <Select
                    value={pageSize}
                    onChange={(value) => onChange(1, value)}
                    options={pageSizeOptions.map(size => ({
                        value: size,
                        label: size
                    }))}
                    className="w-[80px]"
                />
                <span className="text-[var(--text-secondary)] ml-4">
                    Showing {startItem}-{endItem} of {total} items
                </span>
            </div>
            <Pagination
                current={current}
                total={total}
                pageSize={pageSize}
                onChange={(page) => onChange(page, pageSize)}
                showSizeChanger={false}
            />
        </div>
    );
};

export default PaginationDefault;
