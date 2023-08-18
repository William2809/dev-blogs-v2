import { NextApiHandler } from "next";
import { isAuth } from "../../../lib/utils";
import {
	commentValidationSchema,
	validateSchema,
} from "../../../lib/validator";
import dbConnect from "../../../lib/dbConnect";
import Post from "../../../models/Post";
import Comment from "../../../models/Comment";

const handler: NextApiHandler = (req, res) => {
	const { method } = req;

	switch (method) {
		case "POST":
			return createNewComment(req, res);

		default:
			res.status(404).send("Not Found!");
	}
};

const createNewComment: NextApiHandler = async (req, res) => {
	const user = await isAuth(req, res);
	if (!user) return res.status(403).json({ error: "unauthorized request!" });

	const error = validateSchema(commentValidationSchema, req.body);
	if (error) return res.status(422).json({ error });

	// create comment
	await dbConnect();

	const { belongsTo, content } = req.body;

	const post = await Post.findById(belongsTo);
	if (!post) return res.status(401).json({ error: "Invalid post!" });

	const comment = new Comment({
		content,
		belongsTo,
		owner: user.id,
		chiefComment: true,
	});

	await comment.save();
	res.status(201).json(comment);
};

export default handler;
