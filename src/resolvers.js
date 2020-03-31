import { User } from './models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

export const resolvers = {
    Query: {
        hello: () => "hi",
        users: () => User.find()
    },
    Mutation: {
        register: async(_, { username, email, password }) => {
            const user = new User({ username, email, password });
            user.password = await bcrypt.hash(user.password, 20)
            await user.save();
            return user;
        },
        login: async(_, { email, password }) => {
            const user = await User.findOne({ 'email': email });
            if (!user) {
                throw new Error('User with passed email not exist!')
            }

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) {
                throw new Error('Invalid password !')
            }

            const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' })

            return token
        }
    }
};