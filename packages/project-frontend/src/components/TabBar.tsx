import React from "react";
import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faUser, faUserGroup } from "@fortawesome/free-solid-svg-icons";

interface TabBarProps {
	openModal: () => void;
}

const TabBar: React.FC<TabBarProps> = ({ openModal }) => {
	return (
		<div className="tabbar">
			<Link to="/friends" className="tab-button">
				<FontAwesomeIcon icon={faUserGroup} />
				<span>Friends</span>
			</Link>
			<button onClick={openModal} className="tab-button">
				<FontAwesomeIcon icon={faPlus} />
				<span>Add Hobbies</span>
			</button>
			<Link to="/" className="tab-button">
				<FontAwesomeIcon icon={faUser} />
				<span>Profile</span>
			</Link>
		</div>
	);
};

export default TabBar;
