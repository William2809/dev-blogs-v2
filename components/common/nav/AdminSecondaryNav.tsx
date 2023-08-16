import { FC } from "react";
import DropdownOptions, { dropDownOptions } from "../DropdownOptions";
import ProfileHead from "../ProfileHead";
import { useRouter } from "next/router";
import useDarkMode from "../../../hooks/useDarkMode";
import { signOut } from "next-auth/react";
import SearchBar from "../SearchBar";

interface Props {}

const AdminSecondaryNav: FC<Props> = (props): JSX.Element => {
	const router = useRouter();
	const { toggleTheme } = useDarkMode();
	const navigateToCreateNewPost = () => router.push("/admin/posts/create");
	const handleLogOut = async () => await signOut();

	const options: dropDownOptions = [
		{
			label: "Add new post",
			onClick: navigateToCreateNewPost,
		},
		{
			label: "Change theme",
			onClick: toggleTheme,
		},
		{
			label: "Log out",
			onClick: handleLogOut,
		},
	];

	return (
		<div className="flex items-center justify-between">
			{/* Search bar */}
			<SearchBar />
			{/* Options / Profile head */}
			<DropdownOptions
				head={<ProfileHead nameInitial="W" />}
				options={options}
			/>
		</div>
	);
};

export default AdminSecondaryNav;
