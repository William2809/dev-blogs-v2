import { FC, useEffect, useState } from "react";
import CommentForm from "./CommentForm";
import useAuth from "../../hooks/useAuth";
import { GitHubAuthButton } from "../button";
import axios from "axios";
import { CommentResponse } from "../../utils/types";
import CommentCard from "./CommentCard";
import ConfirmModal from "./ConfirmModal";
import PageNavigator from "./PageNavigator";

interface Props {
	belongsTo?: string;
	fetchAll?: boolean;
}

const limit = 5;
let currentPageNo = 0;

const Comments: FC<Props> = ({ belongsTo, fetchAll }): JSX.Element => {
	const [comments, setComments] = useState<CommentResponse[]>();
	const [showConfirmModal, SetShowConfirmModal] = useState(false);
	const [reachedToEnd, SetReachedToEnd] = useState(false);
	const [busyCommentLike, SetBusyCommentLike] = useState(false);
	const [submitting, SetSubmitting] = useState(false);
	const [selectedComment, SetSelectedComment] =
		useState<CommentResponse | null>(null);
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
		SetSubmitting(true);
		try {
			const newComment = await axios
				.post("/api/comment", { content, belongsTo })
				.then(({ data }) => data.comment)
				.catch((err) => console.log(err));

			if (newComment && comments) {
				setComments([...comments, newComment]);
			} else {
				setComments([newComment]);
			}
		} catch (error) {
			console.log(error);
		}
		SetSubmitting(false);
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
		SetBusyCommentLike(true);
		SetSelectedComment(comment);
		axios
			.post("/api/comment/update-like", { commentId: comment.id })
			.then(({ data }) => {
				updateLikedComments(data.comment);
				SetBusyCommentLike(false);
			})
			.catch((err) => {
				console.log(err);
				SetBusyCommentLike(false);
				SetSelectedComment(null);
			});
	};

	// fetch all comments
	const fetchAllComments = async (pageNo = currentPageNo) => {
		try {
			const { data } = await axios.get(
				`/api/comment/all?pageNo=${pageNo}&limit=${limit}`
			);

			if (!data.comments.length) {
				currentPageNo--;
				return SetReachedToEnd(true);
			}

			setComments(data.comments);
		} catch (error) {
			console.log(error);
		}
	};

	const handleOnNextClick = () => {
		if (reachedToEnd) return;

		currentPageNo++;
		fetchAllComments(currentPageNo);
	};

	const handleOnPrevClick = () => {
		if (currentPageNo <= 0) return;
		if (reachedToEnd) SetReachedToEnd(false);

		currentPageNo--;
		fetchAllComments(currentPageNo);
	};

	useEffect(() => {
		if (!belongsTo) return;

		axios(`/api/comment?belongsTo=${belongsTo}`)
			.then(({ data }) => {
				setComments(data.comments);
			})
			.catch((err) => console.log(err));
	}, [belongsTo]);

	useEffect(() => {
		if (!belongsTo && fetchAll) {
			fetchAllComments();
		}
	}, [belongsTo, fetchAll]);

	return (
		<div className="py-20 space-y-4">
			{userProfile ? (
				<CommentForm
					visible={!fetchAll}
					onSubmit={handleNewCommentSubmit}
					title="Add Comment"
					busy={submitting}
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
							busy={selectedComment?.id === comment.id && busyCommentLike}
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
											busy={selectedComment?.id === reply.id && busyCommentLike}
										/>
									);
								})}
							</div>
						) : null}
					</div>
				);
			})}

			{fetchAll ? (
				<div className="py-10 flex justify-end">
					<PageNavigator
						onNextClick={handleOnNextClick}
						onPrevClick={handleOnPrevClick}
					/>
				</div>
			) : null}

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
