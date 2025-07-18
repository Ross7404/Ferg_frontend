import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import Select from "react-select";
import citiesData from "../../../public/vietnamAddress.json";
import { useUpdateCinemaMutation } from "../../../api/cinemaApi";
import { useGetBranchesQuery } from "../../../api/branchApi";
import { IoClose } from "react-icons/io5";

export default function EditCinema({
  id,
  name,
  city,
  district,
  ward,
  street,
  branch_id,
  setToggleUpdateCinema,
}) {
  const { data: listBranches } = useGetBranchesQuery();
  const [updateCinema] = useUpdateCinemaMutation();

  const [selectedCity, setSelectedCity] = useState(city);
  const [selecteddistricts, setSelecteddistricts] = useState(district);
  const [selectedWards, setSelectedwards] = useState(ward);
  const [selectedStreet, setSelectedStreet] = useState(street);
  const [branchId, setBranchId] = useState(branch_id);
  const [selectName, setSelectName] = useState(name);

  const [errors, setErrors] = useState({
    name: "",
    city: "",
    districts: "",
    wards: "",
    street: "",
    branch_id: "",
  });

  const handleCityChange = (cityOption) => {
    const city = citiesData.find((item) => item.Name === cityOption.value);
    setSelectedCity(city?.Name);
    setSelecteddistricts(null);
    setSelectedwards(null);
    setErrors((prev) => ({ ...prev, city: "" }));
  };

  const handledistrictsChange = (districtOption) => {
    const district = citiesData
      ?.filter((item) => item.Name === selectedCity)[0]
      ?.Districts?.find((item) => item.Name === districtOption.value);

    setSelecteddistricts(district?.Name);
    setSelectedwards(null);
    setErrors((prev) => ({ ...prev, districts: "" }));
  };

  const handlewardsChange = (wardOption) => {
    setSelectedwards(wardOption?.value);
    setErrors((prev) => ({ ...prev, wards: "" }));
  };

  const handleStreetChange = (e) => {
    setSelectedStreet(e.target.value);
    setErrors((prev) => ({ ...prev, street: "" }));
  };

  const handleBranchName = (branch) => {
    setBranchId(branch?.value);
    setErrors((prev) => ({ ...prev, branch_id: "" }));
  };

  const handleNameChange = (e) => {
    setSelectName(e.target.value);
    setErrors((prev) => ({ ...prev, name: "" }));
  };

  const onFinish = async () => {
    setErrors({
      name: "",
      city: "",
      districts: "",
      wards: "",
      street: "",
      branch_id: "",
    });

    let isValid = true;

    if (!selectName) {
      setErrors((prev) => ({ ...prev, name: "Name is required." }));
      isValid = false;
    }

    if (!selectedCity) {
      setErrors((prev) => ({ ...prev, city: "City is required." }));
      isValid = false;
    }

    if (!selecteddistricts) {
      setErrors((prev) => ({ ...prev, districts: "District is required." }));
      isValid = false;
    }

    if (!selectedWards) {
      setErrors((prev) => ({ ...prev, wards: "Ward is required." }));
      isValid = false;
    }

    if (!selectedStreet) {
      setErrors((prev) => ({ ...prev, street: "Street name is required." }));
      isValid = false;
    }

    if (!branchId) {
      setErrors((prev) => ({ ...prev, branch_id: "Branch is required." }));
      isValid = false;
    }

    if (!isValid) return;

    const cinemaData = {
      id: id,
      name: selectName,
      city: selectedCity,
      district: selecteddistricts,
      ward: selectedWards,
      street: selectedStreet,
      branch_id: branchId,
    };

    try {
      await updateCinema(cinemaData).unwrap();
      message.success("Cinema updated successfully!");
      setToggleUpdateCinema(false);
    } catch (error) {
      console.error("Failed to update cinema:", error);
      message.error("Failed to update cinema. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-lg font-medium m-0">Edit Cinema</h4>
        <Button
          type="text"
          icon={<IoClose className="text-2xl" />}
          onClick={() => setToggleUpdateCinema(false)}
        />
      </div>

      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        {/* Container grid 2 cột trên màn lớn, 1 cột trên màn nhỏ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <Form.Item
            label="Cinema Name"
            validateStatus={errors.name ? "error" : ""}
            help={errors.name}
          >
            <Input
              value={selectName}
              onChange={handleNameChange}
              placeholder="Enter cinema name"
            />
          </Form.Item>

          {/* City */}
          <Form.Item
            label="City"
            validateStatus={errors.city ? "error" : ""}
            help={errors.city}
          >
            <Select
              className="w-full"
              options={citiesData.map((city) => ({
                value: city.Name,
                label: city.Name,
              }))}
              onChange={handleCityChange}
              value={
                selectedCity ? { value: selectedCity, label: selectedCity } : null
              }
              placeholder="Select city"
              isClearable
            />
          </Form.Item>

          {/* District */}
          <Form.Item
            label="District"
            validateStatus={errors.districts ? "error" : ""}
            help={errors.districts}
          >
            <Select
              className="w-full"
              options={
                citiesData
                  ?.filter((item) => item.Name === selectedCity)[0]
                  ?.Districts?.map((district) => ({
                    value: district.Name,
                    label: district.Name,
                  })) || []
              }
              onChange={handledistrictsChange}
              value={
                selecteddistricts
                  ? { value: selecteddistricts, label: selecteddistricts }
                  : null
              }
              placeholder="Select district"
              isClearable
              isDisabled={!selectedCity}
            />
          </Form.Item>

          {/* Ward */}
          <Form.Item
            label="Ward"
            validateStatus={errors.wards ? "error" : ""}
            help={errors.wards}
          >
            <Select
              className="w-full"
              options={
                citiesData
                  ?.filter((item) => item.Name === selectedCity)[0]
                  ?.Districts?.filter((item) => item.Name === selecteddistricts)[0]
                  ?.Wards?.map((ward) => ({
                    value: ward.Name,
                    label: ward.Name,
                  })) || []
              }
              onChange={handlewardsChange}
              value={
                selectedWards
                  ? { value: selectedWards, label: selectedWards }
                  : null
              }
              placeholder="Select ward"
              isClearable
              isDisabled={!selecteddistricts}
            />
          </Form.Item>

          {/* Street */}
          <Form.Item
            label="Street Address"
            validateStatus={errors.street ? "error" : ""}
            help={errors.street}
          >
            <Input
              value={selectedStreet}
              onChange={handleStreetChange}
              placeholder="Enter house number and street name"
            />
          </Form.Item>

          {/* Branch */}
          <Form.Item
            label="Branch"
            validateStatus={errors.branch_id ? "error" : ""}
            help={errors.branch_id}
          >
            <Select
              className="w-full"
              options={
                listBranches?.branches?.map((branch) => ({
                  value: branch.id,
                  label: branch.name,
                })) || []
              }
              onChange={handleBranchName}
              value={
                branchId && listBranches?.branches
                  ? {
                      value: branchId,
                      label: listBranches?.branches?.find(
                        (branch) => branch.id === branchId
                      )?.name,
                    }
                  : null
              }
              placeholder="Select branch"
              isClearable
            />
          </Form.Item>
        </div>

        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
          <Button onClick={() => setToggleUpdateCinema(false)}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </div>
      </Form>
    </div>
  );
}
