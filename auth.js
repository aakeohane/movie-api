const jwtSecret = 'your_jwt_secret';

const jwt = require('jsonwebtoken'),
   passport = require('passport');

   require('./passport');

  /**
   * generates an encoded JWT token which expires in 7 days
   * @param {string} user - username you’re encoding in the JWT
   * @returns JWT Token
   */
   let generateJWTToken = (user) => {
      return jwt.sign(user, jwtSecret, {
         expiresIn: '7d',
         algorithm: 'HS256'
      });
   }

   /** POST login */ 
   module.exports = (router) => {
      router.post('/login', (req, res) => {
         passport.authenticate('local', { session: false }, (error, user, info) => {
            if (error || !user) {
               return res.status(400).json({
                  message: 'Something is not right',
                  user: user
               });
            }
            req.login(user, { session: false }, (error) => {
               if (error) {
                  res.send(error);
               }
               let token = generateJWTToken(user.toJSON());
               return res.json({ user, token });
            });
         })(req, res);
      });
   }