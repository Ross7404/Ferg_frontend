import { Card, Form, Input, InputNumber, Select, DatePicker, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCreatePromotionMutation } from "../../../api/promotionApi";

const { Option } = Select;

const generateCouponCode = (applicableTo) => {
  const prefixMap = {
    ticket: "TICKET",
    food: "FOOD",
    total_bill: "BILL",
    other: "OTHER",
  };

  const prefix = prefixMap[applicableTo] || "PROMO";
  const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `${prefix}-${randomCode}`;
};

export default function AddPromotion() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [createPromotion] = useCreatePromotionMutation();
  const [couponCode, setCouponCode] = useState("");

  const handleApplicableToChange = (value) => {
    const newCode = generateCouponCode(value);
    setCouponCode(newCode);
    form.setFieldsValue({ code: newCode });
  };

  const handleSubmit = async (values) => {
    try {
        const formattedValues = {
            ...values,
            start_date: values.start_date ? values.start_date.format("YYYY-MM-DD") : null,
            end_date: values.end_date ? values.end_date.format("YYYY-MM-DD") : null,
          };
                  
      const response = await createPromotion(formattedValues).unwrap();
      if(response.status === 409) {
        message.error(response.message || "Promotion code already exists!");
        return;
      }
      message.success(response.message || "Promotion code created successfully!");      
      navigate("/admin/promotions");
    } catch (error) {
      console.error("Failed to create promotion:", error);
    }
  };

  return (
    <Card title="Add Promotion Code" className="w-full">
      <Form 
        layout="vertical" 
        form={form} 
        onFinish={handleSubmit} 
        initialValues={{ discount_type: "percentage", applicable_to: "ticket" }}
      >
        <Form.Item name="name" label="Promotion Name" rules={[{ required: true, message: "Promotion name is required" }]}> 
          <Input placeholder="Ex: Summer Discount" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} placeholder="Promotion program description" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="applicable_to" label="Applicable To" rules={[{ required: true, message: "Please select applicable target" }]}> 
            <Select onChange={handleApplicableToChange}>
              <Option value="ticket">Movie Ticket</Option>
              <Option value="food">Food</Option>
              <Option value="total_bill">Total Bill</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="code" label="Promotion Code" rules={[{ required: true, message: "Please enter promotion code" }]}> 
            <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="discount_type" label="Discount Type" rules={[{ required: true, message: "Required" }]}>
            <Select>
              <Option value="percentage">Percentage</Option>
              <Option value="fixed_amount">Fixed Amount</Option>
            </Select>
          </Form.Item>

          <Form.Item name="discount_value" label="Discount Value" rules={[{ required: true, message: "Please enter discount value" }]}> 
            <InputNumber className="w-full" min={1} placeholder="Ex: 10 or 50000" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="min_order_value" label="Minimum Order Value">
            <InputNumber className="w-full" min={0} placeholder="Ex: 100000" />
          </Form.Item>

          <Form.Item name="max_discount" label="Maximum Discount">
            <InputNumber className="w-full" min={0} placeholder="Ex: 50000" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="usage_limit" label="Usage Limit">
            <InputNumber className="w-full" min={1} placeholder="Ex: 100" />
          </Form.Item>

          <Form.Item name="per_user_limit" label="Per User Limit">
            <InputNumber className="w-full" min={1} placeholder="Ex: 5" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="start_date" label="Start Date" rules={[{ required: true, message: "Please select start date" }]}> 
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item name="end_date" label="End Date" rules={[{ required: true, message: "Please select end date" }]}> 
            <DatePicker className="w-full" />
          </Form.Item>
        </div>

        <Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => navigate("/admin/promotions")}>Cancel</Button>
            <Button type="primary" htmlType="submit">Add Code</Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
}
