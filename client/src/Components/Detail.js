import React, { useState } from 'react';
import videoFile from './vid1.mp4';
import { Link, useNavigate } from 'react-router-dom';

function VideoPlayer() {
    return (
        <video width="600" loop autoPlay muted>
            <source src={videoFile} type="video/mp4" />
        </video>
    );
}

export default function Detail() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: '',
        mobileNumber: '',
        fatherName: '',
        motherName: '',
        fatherMobile: '',
        motherMobile: '',
        guardianName: '',
        guardianMobile: '',
        address: '',
        district: '',
        state: '',
        pincode: '',
    });
    const [checkbox, setCheckbox] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleCheckboxChange = (e) => {
        setCheckbox(e.target.checked);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (checkbox) {
                const response = await fetch('http://localhost:1042/user/user-detail', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
                if (response.ok) {
                    alert('User registration successful!');
                    // Reset form fields after successful submission
                    setFormData({
                        name: '',
                        mobileNumber: '',
                        fatherName: '',
                        motherName: '',
                        fatherMobile: '',
                        motherMobile: '',
                        guardianName: '',
                        guardianMobile: '',
                        address: '',
                        district: '',
                        state: '',
                        pincode: '',
                    });
                    navigate("/Share-Location")
                } else {
                    alert('Error submitting form.');
                    
                }
            } else {
                alert("Please agree to the terms and conditions by checking the checkbox.");
            }
        } catch (err) {
            alert('Submission failed. Please try again.');
        }
    };

    return (
        <div>
            <div className="header">
                <div>
                    <div className="container1">
                        {VideoPlayer()}
                    </div>
                </div>
                <div className="sextion">
                    <div className="cunt2">
                        <div className="heading">User Details</div>
                        <form className="form" onSubmit={handleSubmit}>
                            {/* Name and Phone */}
                            <div className="form1">
                                <div className="val1">Name</div>
                                <div className="val2 a2">Phone</div>
                            </div>
                            <div className="form2">
                                <input
                                    className="age"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                                <input
                                    className="age2 age"
                                    type="number"
                                    name="mobileNumber"
                                    value={formData.mobileNumber}
                                    onChange={handleChange}
                                />
                                <br /><br />
                            </div>

                            {/* Father's Name and Phone */}
                            <div className="form1">
                                <div className="val1">Father's Name</div>
                                <div className="val2">Phone</div>
                            </div>
                            <div className="form2">
                                <input
                                    className="age"
                                    type="text"
                                    name="fatherName"
                                    value={formData.fatherName}
                                    onChange={handleChange}
                                />
                                <input
                                    className="age2 age"
                                    type="number"
                                    name="fatherMobile"
                                    value={formData.fatherMobile}
                                    onChange={handleChange}
                                />
                                <br /><br />
                            </div>

                            {/* Mother's Name and Phone */}
                            <div className="form1">
                                <div className="val1">Mother's Name</div>
                                <div className="val2">Phone</div>
                            </div>
                            <div className="form2">
                                <input
                                    className="age"
                                    type="text"
                                    name="motherName"
                                    value={formData.motherName}
                                    onChange={handleChange}
                                />
                                <input
                                    className="age2 age"
                                    type="number"
                                    name="motherMobile"
                                    value={formData.motherMobile}
                                    onChange={handleChange}
                                />
                                <br /><br />
                            </div>

                            {/* Guardian Name and Phone */}
                            <div className="form1">
                                <div className="val1">Guardian Name</div>
                                <div className="val2">Phone</div>
                            </div>
                            <div className="form2">
                                <input
                                    className="age"
                                    type="text"
                                    name="guardianName"
                                    value={formData.guardianName}
                                    onChange={handleChange}
                                />
                                <input
                                    className="age2 age"
                                    type="number"
                                    name="guardianMobile"
                                    value={formData.guardianMobile}
                                    onChange={handleChange}
                                />
                                <br /><br />
                            </div>

                            {/* Address and State */}
                            <div className="form1">
                                <div className="val1">Address</div>
                                <div className="val2 a2">State</div>
                            </div>
                            <div className="form2">
                                <input
                                    className="age"
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                                <input
                                    className="age2 age"
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                />
                                <br /><br />
                            </div>

                            {/* City and Pincode */}
                            <div className="form1">
                                <div className="val1">City</div>
                                <div className="val2 a2">Pin Code</div>
                            </div>
                            <div className="form2">
                                <input
                                    className="age"
                                    type="text"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                />
                                <input
                                    className="age2 age"
                                    type="number"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                />
                                <br /><br />
                            </div>

                            {/* Checkbox for Agreement */}
                            <div className="em">
                                <input
                                    type="checkbox"
                                    className="tick"
                                    checked={checkbox}
                                    onChange={handleCheckboxChange}
                                />
                                <div className="tor">
                                    I agree with Stayfree Terms of Service, Privacy, and Policy and default Notification Setting
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button className="formsub" type="submit">
                                Submit
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
