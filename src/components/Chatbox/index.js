/*
 * Core
 */
import React, { Component } from 'react';
import styled from 'styled-components';
// import ApolloClient from "apollo-boost";
// import gql from "graphql-tag";
// import { graphql } from 'react-apollo';
import { Query, Mutation } from "react-apollo";
import { animateScroll } from "react-scroll";

/*
 * Components
 */
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
// import { Preloader } from '../../components/Preloader';
import { Error } from '../../components/Error';

/*
 * Queries
 */
import { 
	QUERY_GET_MESSAGES, 
	SEND_MESSAGE_MUTATION, 
	SEND_MESSAGE_SUB 
} from '../../queries';

let sub = null;

const MessagesContainer = () => (
	<Query query={QUERY_GET_MESSAGES}>
		{({ data, loading, error, subscribeToMore }) => {
			if (!data) {
				return null;
			}
			if (loading) {
				return <span>Loading ...</span>;
			}
			if (error) { 
				return <p>Sorry! Something went wrong.</p>;
			}

			if (!sub) {
				sub = subscribeToMore({
				  document: SEND_MESSAGE_SUB,
				  updateQuery: (prev, { subscriptionData }) => {
					if (!subscriptionData.data) {
					  return prev;
					}

					const newMessage = subscriptionData.data.messageSent;

					return {
						...prev,
						getMessages: [...prev.getMessages, newMessage]
					}
				  }
				});
			}

			return <MessageList props={data.getMessages} />
		}}
	</Query>
);

const Box = styled.div`
	padding: 8px;
	height: 400px;
	width: 100%;
	overflow-y: scroll;
	background: #d4d4d4;
	border-radius: 8px;
	box-sizing: border-box;
`;

const Message = styled.div`
	margin-top: 8px;
	width: 100%;
	display: flex;
	flex-direction: row;
`;

const Avatar = styled.div`
	margin-right: 8px;
	background: #0F5672;
	color: #ffffff;
	width: 40px;
	height: 40px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
`;

const Text = styled.div`
	min-height: 40px;
	padding: 8px;
	background: #c1c1c1;
	border-radius: 8px;
	flex: 1;
`;

const MessageList = (props) => {
	scrollToBottom();

	return props.props.map((chat, index) => (
			<Message key={index}>
				<Avatar>{chat.from.substring(0, 1)}</Avatar>
				<Text>{chat.from}: {chat.message}</Text>
			</Message>
		  ))
}

const scrollToBottom = () => {
	animateScroll.scrollToBottom({
		containerId: "chatBox"
	});
}

class Chatbox extends Component {
	state = {
		from: '',
		message: '',
		error: false
	}

	render() {
		const { from, message } = this.state;
		let input;

		return (
			<div>
				<Box id="chatBox">
					{MessagesContainer()}
				</Box>
				{this.state.error && <Error>Please enter any message!</Error>}
				<Mutation mutation={SEND_MESSAGE_MUTATION}>
					{(sendMessage) => (
						<div>
							<form onSubmit={e => {
									e.preventDefault();
									this.setState({ error: false });

									if (input.value.length === 0) {
										this.setState({ error: true });

										return false;
									}

									sendMessage({ variables: { from: from, message: message } });
									this.setState({ message: "" });
								}
							}>
								<Input 
									placeholder="Enter a message to send" 
									value={message}
									ref={node => { input = node }}
									onChange={e => this.setState({ from: localStorage.getItem('name'), message: e.target.value })}
								/>
								<Button type="submit">Send</Button>
							</form>
						</div>
					)}
				</Mutation>
			</div>
		);
	}
}

export default Chatbox;