import bcrypt from 'bcrypt';

export const generateHashedPassword = async (password) => {
    const saltRounds = 10; // you can adjust the cost factor
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
};

export const generateHashedPasswordSync = (password) => {
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds);
};
