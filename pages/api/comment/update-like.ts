import { NextApiHandler } from "next";
import { isAuth, formatComment } from "../../../lib/utils";

import dbConnect from "../../../lib/dbConnect";
import Comment from "../../../models/Comment";
import { isValidObjectId } from "mongoose";

const handler: NextApiHandler = (req, res) => {
	const { method } = req;

	switch (method) {
		case "POST":
			return updateLike(req, res);

		default:
			res.status(404).send("Not Found!");
	}
};

const updateLike: NextApiHandler = async (req, res) => {
	const user = await isAuth(req, res);
	if (!user) return res.status(403).json({ error: "unauthorized request!" });

	const { commentId } = req.body;

	if (!isValidObjectId(commentId))
		return res.status(422).json({ error: "Invalid comment id!" });

	await dbConnect();

	const comment = await Comment.findById(commentId)
		.populate({
			path: "owner",
			select: "name avatar",
		})
		.populate({
			path: "replies",
			populate: {
				path: "owner",
				select: "name avatar",
			},
		});

	if (!comment) return res.status(404).json({ error: "Comment not found!" });

	const oldLikes = comment.likes || [];
	const likedBy = user.id as any;

	// like and unlike
	// unlike comments
	if (oldLikes.includes(likedBy)) {
		comment.likes = oldLikes.filter(
			(like) => like.toString() !== likedBy.toString()
		);
	} else {
		//like
		comment.likes = [...oldLikes, likedBy];
	}

	await comment.save();
	res.status(201).json({
		comment: {
			...formatComment(comment, user),
			replies: comment.replies?.map((reply: any) => formatComment(reply, user)),
		},
	});
};

export default handler;
