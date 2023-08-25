import { FC, useEffect, useState } from "react";
import CommentForm from "./CommentForm";
import useAuth from "../../hooks/useAuth";
import { GitHubAuthButton } from "../button";
import axios from "axios";
import { CommentResponse } from "../../utils/types";
import CommentCard from "./CommentCard";
import ConfirmModal from "./ConfirmModal";

interface Props {
	belongsTo: string;
}

const Comments: FC<Props> = ({ belongsTo }): JSX.Element => {
	const [comments, setComments] = useState<CommentResponse[]>();
	const [showConfirmModal, SetShowConfirmModal] = useState(false);
	const [commentToDelete, setCommentToDelete] =
		useState<CommentResponse | null>(null);

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

	const updatedEditedComment = (newComment: CommentResponse) => {
		if (!comments) {
			return;
		}

		let updatedComments = [...comments];
		// To update the comment we can only change the content

		// if edited comment is chief
		if (newComment.chiefComment) {
			const index = updatedComments.findIndex(({ id }) => id === newComment.id);
			updatedComments[index].content = newComment.content;
		}
		// otherwise updating comment from replies
		else {
			const chiefCommentIndex = updatedComments.findIndex(
				({ id }) => id === newComment.repliedTo
			);

			let newReplies = updatedComments[chiefCommentIndex].replies;
			newReplies = newReplies?.map((comment) => {
				if (comment.id === newComment.id) {
					comment.content = newComment.content;
				}
				return comment;
			});

			updatedComments[chiefCommentIndex].replies = newReplies;
		}

		setComments([...updatedComments]);
	};

	const updateLikedComments = (likedComment: CommentResponse) => {
		if (!comments) return;
		let newComments = [...comments];
		if (likedComment.chiefComment) {
			newComments = newComments.map((comment) => {
				if (comment.id === likedComment.id) return likedComment;
				return comment;
			});
		} else {
			const chiefCommentIndex = newComments.findIndex(
				({ id }) => id === likedComment.repliedTo
			);
			const newReplies = newComments[chiefCommentIndex].replies?.map(
				(reply) => {
					if (reply.id === likedComment.id) return likedComment;
					return reply;
				}
			);
			newComments[chiefCommentIndex].replies = newReplies;
		}

		setComments([...newComments]);
	};

	const updateDeletedComments = (deletedComment: CommentResponse) => {
		if (!comments) return;
		let newComments = [...comments];
		if (deletedComment.chiefComment) {
			newComments = newComments.filter(({ id }) => id !== deletedComment.id);
		} else {
			const chiefCommentIndex = newComments.findIndex(
				({ id }) => id === deletedComment.repliedTo
			);
			const newReplies = newComments[chiefCommentIndex].replies?.filter(
				({ id }) => id !== deletedComment.id
			);
			newComments[chiefCommentIndex].replies = newReplies;
		}

		setComments([...newComments]);
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

	const handleUpdateSubmit = async (content: string, id: string) => {
		await axios
			.patch(`/api/comment?commentId=${id}`, { content })
			.then(({ data }) => updatedEditedComment(data.comment))
			.catch((err) => console.log(err));
	};

	const handleOnDeleteClick = async (comment: CommentResponse) => {
		setCommentToDelete(comment);
		SetShowConfirmModal(true);
	};

	const handleOnDeleteCancel = async () => {
		setCommentToDelete(null);
		SetShowConfirmModal(false);
	};

	const handleOnDeleteConfirm = async () => {
		if (!commentToDelete) return;
		axios
			.delete(`/api/comment?commentId=${commentToDelete.id}`)
			.then(({ data }) => {
				if (data.removed) updateDeletedComments(commentToDelete);
			})
			.catch((err) => console.log(err))
			.finally(() => {
				setCommentToDelete(null);
				SetShowConfirmModal(false);
			});
	};

	const handleOnLikeClick = (comment: CommentResponse) => {
		axios
			.post("/api/comment/update-like", { commentId: comment.id })
			.then(({ data }) => updateLikedComments(data.comment))
			.catch((err) => console.log(err));
	};

	useEffect(() => {
		axios(`/api/comment?belongsTo=${belongsTo}`)
			.then(({ data }) => {
				setComments(data.comments);
			})
			.catch((err) => console.log(err));
	}, [belongsTo]);

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
							onUpdateSubmit={(content) =>
								handleUpdateSubmit(content, comment.id)
							}
							onDeleteClick={() => handleOnDeleteClick(comment)}
							onLikeClick={() => handleOnLikeClick(comment)}
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
											onUpdateSubmit={(content) =>
												handleUpdateSubmit(content, reply.id)
											}
											onDeleteClick={() => handleOnDeleteClick(reply)}
											onLikeClick={() => handleOnLikeClick(reply)}
										/>
									);
								})}
							</div>
						) : null}
					</div>
				);
			})}

			<ConfirmModal
				visible={showConfirmModal}
				title="Are you sure?"
				subTitle="This action will remove the this comment and replies if this is chief comment!"
				onCancel={handleOnDeleteCancel}
				onConfirm={handleOnDeleteConfirm}
			/>
		</div>
	);
};

export default Comments;
