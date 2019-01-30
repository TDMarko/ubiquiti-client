/*
 * Core
 */
import styled from 'styled-components';

export const Title = styled.h1`
	font-size: 32px;
	color: #ffffff;
`;

export const Container = styled.div`
	padding: 40px;
	width: 580px;
	box-sizing: border-box;
	background: #f7f7f7;
	border-radius: 8px;
`;

export const Logout = styled.div`
	display: inline-block;
	text-decoration: underline;
	font-size: 18px;
	&:hover {
		cursor: pointer;
		text-decoration: none;
	}
`;
