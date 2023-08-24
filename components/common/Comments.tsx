import { FC, useEffect, useState } from "react";
import CommentForm from "./CommentForm";
import useAuth from "../../hooks/useAuth";
import { GitHubAuthButton } from "../button";
import axios from "axios";
import { CommentResponse } from "../../utils/types";
import CommentCard from "./CommentCard";

interface Props {
	belongsTo: string;
}

const Comments: FC<Props> = ({ belongsTo }): JSX.Element => {
	const [comments, setComments] = useState<CommentResponse[]>();

	const userProfile = useAuth();

	const insertNewReplyComments = (reply: CommentResponse) => {
		if (!comments) return;
		const updatedComments = [...comments];

		const chiefCommentIndex = updatedComments.findIndex(
			({ id }) => id === reply.repliedTo
		);

		const { replies } = updatedComments[chiefCommentIndex];
		if (replies) {
			updatedComments[chiefCommentIndex].replies = [...replies, reply];
		} else {
			updatedComments[chiefCommentIndex].replies = [reply];
		}

		setComments([...updatedComments]);
	};

	const handleNewCommentSubmit = async (content: string) => {
		const newComment = await axios
			.post("/api/comment", { content, belongsTo })
			.then(({ data }) => data.comment)
			.catch((err) => console.log(err));

		if (newComment && comments) {
			setComments([...comments, newComment]);
		} else {
			setComments([newComment]);
		}
	};

	const handleReplySubmit = async (replyComment: {
		content: string;
		repliedTo: string;
	}) => {
		await axios
			.post("/api/comment/add-reply", replyComment)
			.then(({ data }) => insertNewReplyComments(data.comment))
			.catch((err) => console.log(err));
	};

	useEffect(() => {
		axios(`/api/comment?belongsTo=${belongsTo}`)
			.then(({ data }) => {
				setComments(data.comments);
			})
			.catch((err) => console.log(err));
	}, []);

	return (
		<div className="py-20 space-y-4">
			{userProfile ? (
				<CommentForm
					onSubmit={handleNewCommentSubmit}
					title="Add Comment"
				/>
			) : (
				<div className="flex flex-col items-end space-y-2">
					<h3 className="text-secondary-dark text-xl font-semibold">
						Log in to add comment
					</h3>
					<GitHubAuthButton />
				</div>
			)}

			{comments?.map((comment) => {
				const { replies } = comment;
				return (
					<div key={comment.id}>
						<CommentCard
							comment={comment}
							showControls={userProfile?.id === comment.owner.id}
							onReplySubmit={(content) =>
								handleReplySubmit({ content, repliedTo: comment.id })
							}
							onUpdateSubmit={(content) => {
								console.log("update:", content);
							}}
						/>

						{replies?.length ? (
							<div className="w-[93%] ml-auto space-y-3">
								<h1 className="text-secondary-dark mb-3">Replies</h1>
								{replies.map((reply) => {
									return (
										<CommentCard
											key={reply.id}
											comment={reply}
											showControls={userProfile?.id === reply.owner.id}
											onReplySubmit={(content) =>
												handleReplySubmit({ content, repliedTo: comment.id })
											}
											onUpdateSubmit={(content) => {
												console.log("update:", content);
											}}
										/>
									);
								})}
							</div>
						) : null}
					</div>
				);
			})}
		</div>
	);
};

export default Comments;
