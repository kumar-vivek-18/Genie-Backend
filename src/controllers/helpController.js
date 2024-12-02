
import nodemailer from 'nodemailer';
import { Contact } from '../models/contact.model.js';
import { Query } from '../models/query.model.js';
import dotenv from 'dotenv';

dotenv.config(); 

// console.log("user",process.env.EMAIL_USER)

const transporter = nodemailer.createTransport({
    service: 'gmail', // or use another email service
    auth: {
        user: process.env.EMAIL_USER, // your email address
        pass: process.env.EMAIL_PASS // your email password or app-specific password
    }
});

export const createConcern = async (req, res) => {
    try {
        // console.log("user find");
        const { name, mobileNo, email, concern, countryCode,requestId } = req.body;
        const user = await Contact.findOne({ email: email, mobileNo: mobileNo });
        // console.log("user find", user, mobileNo, email, concern, countryCode,requestId);

        let response;
        if (user) {
            user.concern.push(concern);
            await user.save();
            response = user;
        } else {
            const newConcern = await Contact.create({ name: name, countryCode: countryCode, mobileNo: mobileNo, email: email,requestId:requestId, concern: [concern] });
            response = newConcern;
        }

        // Prepare email data
        // const mailOptions = {
        //     from:`${email}`,
        //     to: process.env.EMAIL_USER,
        //     subject: 'New Report Concern',
        //     text: `Name: ${name}\nCountry Code: ${countryCode}\nMobile No: ${mobileNo}\nEmail: ${email}\nRequestId: ${requestId}\nConcern: ${concern}`
        // };

        const mailOptions = {
            from: `${email}`,
            to: process.env.EMAIL_USER,
            subject: 'New Report Concern',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Mobile No:</strong>${countryCode}${mobileNo}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    
                    <p><strong>Request ID:</strong> ${requestId}</p>
                    <p><strong>Concern:</strong></p>
                    <p style="background-color: #f8f9fa; padding: 10px; border-left: 5px solid #fcb800;">${concern}</p>
                    <hr style="border: 0; border-top: 1px solid #ddd;" />
                    
                </div>
            `
        };
        

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                // console.error('Error sending email:', error);
                return res.status(500).json({ message: 'Error sending email', error });
            } else {
                // console.log('Email sent:', info.response);
                res.status(201).json(response);
            }
        });
    } catch (error) {
        res.status(400).json(error);
    }
};

export const createQuery = async (req, res) => {
    try {
        // console.log('hii');
        const { name, mobileNo, email, concern, countryCode,requestId } = req.body;
        const user = await Query.findOne({ email: email, mobileNo: mobileNo });
        // console.log("user find", user);

        if (user) {
            user.concern.push(concern);
            user.save();
            res.status(201).json(user);
        }
        else {
            const newConcern = await Query.create({ name: name, countryCode: countryCode, mobileNo: mobileNo, email: email,requestId:requestId, concern: [concern] });
            // console.log('newConcern', newConcern);
            res.status(201).json(newConcern);
        }

        // const mailOptions = {
        //     from:`${email}`,
        //     to: process.env.EMAIL_USER,
        //     subject: 'New Query Recieved',
        //     text: `Name: ${name}\nCountry Code: ${countryCode}\nMobile No: ${mobileNo}\nEmail: ${email}\nRequestId: ${requestId}\nConcern: ${concern}`
        // };

        const mailOptions = {
            from: `${email}`,
            to: process.env.EMAIL_USER,
            subject: 'New Query Recieved',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                   
                    <p><strong>Name:</strong> ${name}</p>
                   
                    <p><strong>Mobile No:</strong> ${countryCode}${mobileNo}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    
                    <p><strong>Request ID:</strong> ${requestId}</p>
                    <p><strong>Query:</strong></p>
                    <p style="background-color: #f8f9fa; padding: 10px; border-left: 5px solid #fcb800;">${concern}</p>
                    <hr style="border: 0; border-top: 1px solid #ddd;" />
                    
                </div>
            `
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                // console.error('Error sending email:', error);
                return res.status(500).json({ message: 'Error sending email', error });
            } else {
                // console.log('Email sent:', info.response);
                res.status(201).json(response);
            }
        });

    } catch (error) {
        res.status(400).json(error);
    }
}