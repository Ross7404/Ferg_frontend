import { Modal, Form, Input, DatePicker, Button, message } from "antd";
import { useEffect } from "react";
import dayjs from "dayjs";
import { useUpdatePromotionMutation } from "@/api/promotionApi";

export default function EditPromotionModal({ visible, onClose, promotion }) {
  const [form] = Form.useForm();
  const [updatePromotion] = useUpdatePromotionMutation();

  useEffect(() => {
    if (promotion) {
      form.setFieldsValue({
        name: promotion.name,
        description: promotion.description,
        start_date: promotion.start_date ? dayjs(promotion.start_date) : null,
        end_date: promotion.end_date ? dayjs(promotion.end_date) : null,
      });
    }
  }, [promotion, form]);

  const handleSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        end_date: values.end_date?.format("YYYY-MM-DD"),
      };      
      await updatePromotion({ id: promotion.id, ...formattedValues }).unwrap();
      message.success("Update successful!");
      onClose();
    } catch (error) {
      message.error("Update failed, please try again!");
    }
  };

  return (
    <Modal
      title="Edit Promotion Code"
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item name="name" label="Promotion Name" rules={[{ required: true, message: "Required" }]}> 
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} />
        </Form.Item>
          <Form.Item name="end_date" label="End Date" rules={[{ required: true, message: "Required" }]}>
            <DatePicker className="w-full" />
          </Form.Item>
        <Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit">Update</Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
