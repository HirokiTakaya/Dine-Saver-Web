const jwt = require('jsonwebtoken');


exports.login = async (req, res) => {
    const { username, password } = req.body;
    
 

    const user = { id: 'ユーザーID', username: username };
    
    
    const secretKey = 'your_secret_key';
    const token = jwt.sign(user, secretKey);
    
    res.json({ token });
};
