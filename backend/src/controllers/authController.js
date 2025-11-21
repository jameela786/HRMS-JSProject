const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { createOrganisation } = require("../models/organisation");
const { createUser, findUserByEmail } = require("../models/user");
const { createLog } = require("../models/log");

exports.register = async (req, res) => {
    try {
        const { orgName, adminName, email, password } = req.body;

        const org = await createOrganisation(orgName);
        const orgId = org.lastID;

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await createUser(orgId, adminName, email, passwordHash);
        const userId = user.lastID;
        await createLog(
            orgId,
            userId,
            "ORG_CREATED",
            { message: `User '${userId}' created organisation '${orgId}'` }
        );
        const token = jwt.sign(
            { userId, orgId },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.json({ token, user: { id: userId, email, orgId } });
    } catch (err) {
        res.status(500).json({ error: "Registration failed", details: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await findUserByEmail(email);
        if (!user)
            return res.status(401).json({ error: "Invalid email or password" });

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match)
            return res.status(401).json({ error: "Invalid email or password" });

        const token = jwt.sign(
            { userId: user.id, orgId: user.organisation_id },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        await createLog(
            user.organisation_id,
            user.id,
            "LOGIN",
            { message: `User '${user.id}' logged in` }
        );

        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ error: "Login failed", details: err.message });
    }
};
