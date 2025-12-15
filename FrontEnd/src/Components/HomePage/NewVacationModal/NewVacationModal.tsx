import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import "./NewVacationModal.css";
import { createVacation } from "../../../Services/vacationApi";
import type { newVacation } from "../../../Types/vacationType";

function NewVacationModal({ showModalNvacation, setShowModalNvacation, getVacations }: any) {
  const handleClose = () => setShowModalNvacation(false);

  const [formData, setFormData] = useState<newVacation>({
    destination: "",
    description: "",
    startdate: "",
    enddate: "",
    price: "",
    imagefilename: undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const showAlert = (type: any, message: any) => {
    setAlert({ show: true, type, message });

    setTimeout(() => {
      setAlert({ show: false, type: "", message: "" });
    }, 3000);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.imagefilename) {
      newErrors.imagefilename = "image must be filled";
    }
    if (!formData.destination.trim()) {
      newErrors.destination = "destination must be filled";
    } else if (formData.destination.length < 3 || formData.destination.length > 15) {
      newErrors.destination = "The destination must be between 3 and 15 characters";
    }
    if (!formData.description.trim()) {
      newErrors.description = "description must be filled";
    } else if (formData.description.length < 3 || formData.description.length > 255) {
      newErrors.description = "The description must be between 3 and 255 characters";
    }
    if (!formData.startdate) {
      newErrors.startdate = "startdate must be filled";
    } else if (new Date(formData.startdate) < new Date()) {
      newErrors.startdate = "Start date cannot be in the past";
    }
    if (!formData.enddate) {
      newErrors.enddate = "enddate must be filled";
    } else if (new Date(formData.enddate) < new Date(formData.startdate)) {
      newErrors.enddate = "End date must be greater than Start date";
    }
    if (!formData.price) {
      newErrors.price = "price must be filled";
    } else if (Number(formData.price) <= 0 || Number(formData.price) > 10000) {
      newErrors.price = "Price must be positive and less than 10,000";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<any>) => {
    if (e.target.name === "imagefilename") {
      const fileInput = e.target.files?.[0];
      if (!fileInput) return;

      if (!["image/png", "image/jpeg", "image/jpg"].includes(fileInput.type)) {
        e.target.value = "";
        setErrors({ ...errors, ["imagefilename"]: "image must be filled" })
        setFormData({ ...formData, [e.target.name]: undefined });
      } else setFormData({ ...formData, [e.target.name]: fileInput });

    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (validate()) {
      createVacation(formData).then(() => {
        getVacations();
        handleClose();
        showAlert("success", "Vacation added!");
      }).catch(() => {
        showAlert("danger", "vacation not added..");
      });

    }
  };

  const resetForm = () => {
    setFormData({
      destination: "",
      description: "",
      startdate: "",
      enddate: "",
      price: "",
      imagefilename: undefined
    })
    setErrors({
      imagefilename: "",
      destination: "",
      description: "",
      startdate: "",
      enddate: "",
      price: ""
    })
  }

  return (
    <>
      <Modal show={showModalNvacation} onHide={handleClose} onShow={resetForm}>
        <Modal.Header closeButton>
          <Modal.Title>New vacation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-3">
              {formData.imagefilename && (
                <div id="imgContainer">
                  <img src={typeof formData.imagefilename === "string"
                    ? formData.imagefilename
                    : URL.createObjectURL(formData.imagefilename)}
                    alt="imgVacation" className="imgCard" />
                </div>
              )}
              <Form.Label>Image *</Form.Label>
              <Form.Control name="imagefilename" type="file"
                onChange={handleChange} accept="image/*"
                isInvalid={!!errors.imagefilename} />
              <Form.Control.Feedback type="invalid">
                {errors.imagefilename}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Destination *</Form.Label>
              <Form.Control name="destination" type="text"
                placeholder="Enter destination"
                value={formData.destination}
                onChange={handleChange}
                isInvalid={!!errors.destination} />
              <Form.Control.Feedback type="invalid">
                {errors.destination}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control name="description" type="text"
                placeholder="Enter description"
                value={formData.description}
                onChange={handleChange}
                isInvalid={!!errors.description} />
              <Form.Control.Feedback type="invalid">
                {errors.description}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>StartDate *</Form.Label>
              <Form.Control name="startdate" type="date"
                value={formData.startdate ? new Date(formData.startdate).toISOString().split("T")[0] : ""}
                onChange={handleChange}
                isInvalid={!!errors.startdate} />
              <Form.Control.Feedback type="invalid">
                {errors.startdate}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>EndDate *</Form.Label>
              <Form.Control name="enddate" type="date"
                value={formData.enddate ? new Date(formData.enddate).toISOString().split("T")[0] : ""}
                onChange={handleChange}
                isInvalid={!!errors.enddate} />
              <Form.Control.Feedback type="invalid">
                {errors.enddate}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price *</Form.Label>
              <Form.Control name="price" type="number"
                placeholder="Enter price $"
                value={formData.price}
                onChange={handleChange}
                isInvalid={!!errors.price} />
              <Form.Control.Feedback type="invalid">
                {errors.price}
              </Form.Control.Feedback>
            </Form.Group>

            <Button variant="primary" type="submit">
              New vacation
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {alert.show && (
        <div className={`alert alert-${alert.type} position-fixed bottom-0 end-0 m-4 shadow`} style={{ zIndex: 9999 }}>
          {alert.message}
        </div>
      )}
    </>
  );
}

export default NewVacationModal;