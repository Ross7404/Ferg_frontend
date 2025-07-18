import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import Select from "react-select";
import citiesData from "../../../public/vietnamAddress.json";
import { useCreateCinemaMutation } from "../../../api/cinemaApi";
import { useGetBranchesQuery } from "../../../api/branchApi";
import { IoClose } from "react-icons/io5";

export default function AddCinema({ setAddCinema }) {
  const { data: listBranches } = useGetBranchesQuery();
  const [createCinema] = useCreateCinemaMutation();
  const [selectedCity, setSelectedCity] = useState(null);
  const [selecteddistricts, setSelecteddistricts] = useState(null);
  const [selectedWards, setSelectedwards] = useState(null);
  const [selectedStreet, setSelectedStreet] = useState(null);
  const [branchId, setBranchId] = useState(null);
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    city: "",
    districts: "",
    wards: "",
    street: "",
    branch_id: "",
  });

  const handleCityChange = (selectedOption) => {
    const listDistricts = citiesData.find(
      (item) => item.Id === selectedOption.value
    );
    setSelectedCity(listDistricts);
    setSelecteddistricts(null);
    setSelectedwards(null);
    setSelectedStreet(null);
    setErrors((prev) => ({ ...prev, city: "" }));
  };

  const handledistrictsChange = (selectedOption) => {
    const listWards = selectedCity?.Districts.find(
      (item) => item.Id === selectedOption.value
    );
    setSelecteddistricts(listWards);
    setSelectedwards(null);
    setSelectedStreet(null);
    setErrors((prev) => ({ ...prev, districts: "" }));
  };

  const handlewardsChange = (selectedOption) => {
    setSelectedwards(selectedOption?.label);
    setSelectedStreet(null);
    setErrors((prev) => ({ ...prev, wards: "" }));
  };

  const handleStreetChange = (selectedOption) => {
    setSelectedStreet(selectedOption);
    setErrors((prev) => ({ ...prev, street: "" }));
  };

  const handleBranchName = (branch) => {
    setBranchId(branch?.value);
  };

  const addCinema = async () => {
    setErrors({
      name: "",
      city: "",
      districts: "",
      wards: "",
      street: "",
      branch_id: "",
    });

    let isValid = true;

    if (!name) {
      setErrors((prev) => ({ ...prev, name: "Cinema name is required." }));
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
      setErrors((prev) => ({ ...prev, street: "Street address is required." }));
      isValid = false;
    }

    if (!branchId) {
      setErrors((prev) => ({ ...prev, branch_id: "Branch is required." }));
      isValid = false;
    }

    if (!isValid) return;

    const cinemaData = {
      name: name,
      city: selectedCity?.Name,
      district: selecteddistricts?.Name,
      ward: selectedWards,
      street: selectedStreet,
      branch_id: branchId,
    };

    try {
      await createCinema(cinemaData).unwrap();
      message.success("Cinema added successfully!");
      setAddCinema(false);
    } catch (error) {
      console.error("Failed to add cinema:", error);
      message.error("Failed to add cinema. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-lg font-medium m-0">Add New Cinema</h4>
        <Button
          type="text"
          icon={<IoClose className="text-2xl" />}
          onClick={() => setAddCinema(false)}
        />
      </div>

      <Form
        layout="vertical"
        onFinish={addCinema}
        requiredMark={false}
        className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2"
      >
        {/* Name */}
        <Form.Item
          label="Cinema Name"
          validateStatus={errors.name ? "error" : ""}
          help={errors.name}
        >
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter cinema name"
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
            options={listBranches
              ? listBranches?.branches?.map((branch) => ({
                  value: branch.id,
                  label: branch.name,
                }))
              : []}
            onChange={handleBranchName}
            value={
              branchId
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

        {/* City */}
        <Form.Item
          label="City"
          validateStatus={errors.city ? "error" : ""}
          help={errors.city}
        >
          <Select
            className="w-full"
            options={citiesData.map((city) => ({
              value: city.Id,
              label: city.Name,
            }))}
            onChange={handleCityChange}
            value={
              selectedCity
                ? { value: selectedCity.Id, label: selectedCity.Name }
                : null
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
            options={selectedCity?.Districts.map((district) => ({
              value: district.Id,
              label: district.Name,
            }))}
            onChange={handledistrictsChange}
            value={
              selecteddistricts
                ? {
                    value: selecteddistricts.Id,
                    label: selecteddistricts.Name,
                  }
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
            options={selecteddistricts?.Wards.map((ward) => ({
              value: ward.Id,
              label: ward.Name,
            }))}
            onChange={handlewardsChange}
            value={
              selectedWards
                ? {
                    label: selectedWards,
                  }
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
          className="md:col-span-2"
        >
          <Input
            value={selectedStreet}
            onChange={(e) => handleStreetChange(e.target.value)}
            placeholder="Enter house number and street name"
          />
        </Form.Item>

        {/* Buttons */}
        <Form.Item className="md:col-span-2 flex justify-end space-x-2 mt-6 pt-4 border-t">
          <Button onClick={() => setAddCinema(false)}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Add Cinema
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
