
export const uploadImages = (req, res) => {

    try {
        if (req.files && Array.isArray(req.files)) {
            const imageUrl = req.files.map(file => `http://173.212.193.109:5000/uploads/${file.filename}`);
            return res.status(201).json(imageUrl);
        }
        else {
            return res.status(400).json({ message: 'No files provided' });
        }

    } catch (error) {
        throw new Error(error.message);
    }
}