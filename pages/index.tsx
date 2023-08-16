import type {
	GetServerSideProps,
	InferGetServerSidePropsType,
	NextPage,
} from "next";
import DefaultLayout from "../components/layout/DefaultLayout";
import { PostDetail, UserProfile } from "../utils/types";
import { formatPosts, readPostsFromDb } from "../lib/utils";
import InfiniteScrollPosts from "../components/common/InfiniteScrollPosts";
import { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { filterPosts } from "../utils/helper";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

const Home: NextPage<Props> = ({ posts }) => {
	const [postsToRender, setPostsToRender] = useState(posts);
	const [hasMorePosts, setHasMorePosts] = useState(posts.length >= limit);

	const { data } = useSession();
	const profile = data?.user as UserProfile;

	const isAdmin = profile && profile.role === "admin";

	const fetchMorePosts = async () => {
		try {
			pageNo++;
			const { data } = await axios(
				`/api/posts?limit=${limit}&skip=${postsToRender.length}`
			);

			if (data.posts.length < limit) {
				setPostsToRender([...postsToRender, ...data.posts]);
				setHasMorePosts(false);
			} else {
				setPostsToRender([...postsToRender, ...data.posts]);
			}
		} catch (error) {
			setHasMorePosts(false);
			console.log(error);
		}
	};

	return (
		<DefaultLayout>
			<div className="pb-20">
				<InfiniteScrollPosts
					hasMore={hasMorePosts}
					next={fetchMorePosts}
					dataLength={postsToRender.length}
					posts={postsToRender}
					showControls={isAdmin}
					onPostRemoved={(post) => {
						setPostsToRender(filterPosts(postsToRender, post));
					}}
				/>
			</div>
		</DefaultLayout>
	);
};

interface ServerSideResponse {
	posts: PostDetail[];
}

let pageNo = 0;
const limit = 9;

export const getServerSideProps: GetServerSideProps<
	ServerSideResponse
> = async () => {
	try {
		// read posts
		const posts = await readPostsFromDb(limit, pageNo);
		// format posts
		const formattedPosts = formatPosts(posts);
		return {
			props: {
				posts: formattedPosts,
			},
		};
	} catch (error) {
		return { notFound: true };
	}
};

export default Home;
