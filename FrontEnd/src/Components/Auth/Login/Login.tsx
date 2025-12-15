import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from 'react';
import { login } from '../../../Services/authApi';
import type { User } from '../../../Types/userType';
import { jwtDecode } from "jwt-decode";


function Login({ setIsLogged, setUser }: any) {
    const nav = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [msgSubmit, setMsgSubmit] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email must be filled";
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }

        if (!formData.password.trim()) {
            newErrors.password = "password must be filled";
        } else if (formData.password.length < 4 || formData.password.length > 20) {
            newErrors.password = "The password must be between 4 and 20 characters";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (errors[name]) setErrors({ ...errors, [name]: "" });
    }

    const handleSubmit = (e: any) => {
        e.preventDefault();
        if (validate()) {
            login(formData).then((res) => {
                setFormData({ email: "", password: "" });
                sessionStorage.setItem("token", res);

                const userInfo: { userWithoutPassword: User[] } = jwtDecode(res);

                setUser({ ...userInfo.userWithoutPassword });
                setIsLogged(true);
                nav("/home");
            }).catch((error) => {
                if (error.response.data === "unauthorized") {
                    setMsgSubmit("The username or password is incorrect");
                } else {
                    setMsgSubmit(error.response.data);
                }
            })
        }
    }

    return (
        <>
            <div id="container-Login">
                <h4 id="titleLogin">Login</h4>

                <h6 className="msgSubmitError">{msgSubmit}</h6>

                <Form onSubmit={handleSubmit} noValidate>
                    <Form.Group className="mb-3">
                        <Form.Label>Email *</Form.Label>
                        <Form.Control type="email" placeholder="Enter email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            isInvalid={!!errors.email} autoComplete="off" />
                        <Form.Control.Feedback type="invalid">
                            {errors.email}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Password *</Form.Label>
                        <Form.Control type="password" placeholder="Enter password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            isInvalid={!!errors.password} />
                        <Form.Control.Feedback type="invalid">
                            {errors.password}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        Sign-in
                    </Button><br /><br />

                    <Link to="/register">Don't Have an account?</Link>
                </Form>
            </div>
        </>
    )
}

export default Login;