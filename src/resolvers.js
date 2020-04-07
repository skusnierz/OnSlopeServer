import bcrypt from 'bcrypt';
import { User } from './models/user';
import { createToken } from './services/tokenService';

export const resolvers = {
    Query: {
        hello: () => "hi",
        users: (_, __, { req }) => {
            if (!req.userId) {
                throw Error("You don't have access!!")
            }
            return User.find()
        },
        user: (_, __, { req }) => {
            console.log(req);
            if (!req.userId) {
                throw Error("You don't have access!!")
            }
            return User.findOne({ '_id': req.userId })
        },
    },
    Mutation: {
        register: async(_, { username, email, password }) => {
            const user = new User({ username, email, password });
            user.password = await bcrypt.hash(user.password, 12)
            await user.save();
            return user;
        },
        login: async(_, { email, password }, { res }) => {
            const user = await User.findOne({ 'email': email });
            if (!user) {
                throw new Error('User with passed email not exist!')
            }

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) {
                throw new Error('Invalid password !')
            }

            const { accessToken, refreshToken } = createToken(user)
            res.cookie('accessToken', accessToken);
            res.cookie('refreshToken', refreshToken);
            return user
        },
        logout: async(_, __, { req, res }) => {

            if (!req.userId) {
                return false;
            }
            const user = await User.findOne({ '_id': req.userId });
            user.refreshTokenCounter += 1;
            res.clearCookie('accessToken');
            await user.save();
            return true;
        }
    }
};