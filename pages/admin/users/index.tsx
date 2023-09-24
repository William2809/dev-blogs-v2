import { NextPage } from "next";
import AdminLayout from "../../../components/layout/AdminLayout";
import LatestUserTable from "../../../components/admin/LatestUserTable";
import { useEffect, useState } from "react";
import { LatestUserProfile } from "../../../utils/types";
import axios from "axios";
import PageNavigator from "../../../components/common/PageNavigator";

interface Props {}

const limit = 5;
let currentPageNo = 0;

const Users: NextPage<Props> = () => {
	const [users, setUsers] = useState<LatestUserProfile[]>();
	const [reachedToEnd, SetReachedToEnd] = useState(false);

	// fetch all comments
	const fetchAllUsers = (pageNo = currentPageNo) => {
		const res = axios
			.get(`/api/user?pageNo=${pageNo}&limit=${limit}`)
			.then(({ data }) => {
				if (data.users.length) {
					currentPageNo--;
					return SetReachedToEnd(true);
				}
				setUsers(data.users);
			})
			.catch((err) => console.log(err));
	};

	const handleOnNextClick = () => {
		if (reachedToEnd) return;

		currentPageNo++;
		fetchAllUsers(currentPageNo);
	};

	const handleOnPrevClick = () => {
		if (currentPageNo <= 0) return;
		if (reachedToEnd) SetReachedToEnd(false);

		currentPageNo--;
		fetchAllUsers(currentPageNo);
	};

	useEffect(fetchAllUsers, []);

	return (
		<AdminLayout>
			<h1 className="text-2xl dark:text-primary text-primary-dark font-semibold py-2 transition">
				Users
			</h1>
			<LatestUserTable users={users} />
			<div className="py-10 flex justify-end">
				<PageNavigator
					onNextClick={handleOnNextClick}
					onPrevClick={handleOnPrevClick}
				/>
			</div>
		</AdminLayout>
	);
};

export default Users;
