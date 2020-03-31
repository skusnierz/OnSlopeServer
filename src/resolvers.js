import { User } from './models/user';
import bcrypt from 'bcrypt';
import { createToken } from './services/tokenService';

export const resolvers = {
    Query: {
        hello: () => "hi",
        users: (_, __, { req }) => {
            if (!req.userId) {
                throw Error("You dont have access!!")
            }
            return User.find()
        },
        user: (_, __, { req }) => {
            if (!req.userId) {
                throw Error("You dont have access!!")
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
        invalidateTokens: async(_, __, { req }) => {
            if (!req.userId) {
                return false;
            }
            const user = await User.findOne({ '_id': req.userId });
            user.refreshTokenCounter += 1;
            await user.save();
            return true;
        }
    }
};